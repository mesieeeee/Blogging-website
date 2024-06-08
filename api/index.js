import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { dbConnection } from "./dbConnection.js";
import { User } from "./models/userModel.js";
import { Post } from "./models/postModel.js";
import bcrypt from "bcrypt";
import  JsonWebToken  from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from 'multer';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const uploadMiddleware = multer({ dest: 'uploads/'});
const salt = bcrypt.genSaltSync(10);
const secret = 'qwerty678uioplkjhghdfaszxcvbnmklo';
app.use(cors({credentials: true, origin:'http://localhost:3000'}))
app.use(express.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname + '/uploads')));

dbConnection();

app.post("/register", async (req, res) => {
    const {username, password} = req.body;
    try{
        const userDoc = await User.create({
            username,
            password:bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);

    }catch(e){
        console.log(e);
        res.status(400).json(e);
    }
});

app.post("/login", async(req, res) => {
    const{username, password} = req.body;
    console.log(username);
    console.log(password);
    try{
        const trimmedUsername = username.trim();
        const userDoc = await User.findOne({username: new RegExp(`^\\s*${trimmedUsername}\\s*$`, 'i')});
        console.log(userDoc);
        const passOk = bcrypt.compareSync(password, userDoc.password);
        console.log(passOk);
        if (passOk){
            JsonWebToken.sign({username, id: userDoc._id}, secret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json({
                    id: userDoc._id,
                    username,
                });
            })
        }else {
            res.status(400).json('wrong credentials');
        }
    }catch(e){
        console.log(e);
        res.status(400).json(e);
    }
    
})

app.get('/profile', (req, res) => {
    const {token} = req.cookies;
    JsonWebToken.verify(token, secret, {}, (err, info) => {
        if(err) throw err;
        res.json(info);
    })
})

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
})

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length -1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, path+'.'+ext);

    const {token} = req.cookies;
    JsonWebToken.verify(token, secret, {}, async(err, info) => {
        if(err) throw err;
        const {title, summary, content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id,
    })
    res.json(postDoc);
})
})


app.get('/post', async(req, res) => {
    res.json(await Post.find().populate('author', ['username']).sort({createdAt: -1}));   
});

app.get('/post/:id', async(req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
})
app.put('/post',uploadMiddleware.single('file'), async(req, res) => {
    let newPath = null;
    if (req.file) {
        const {originalname, path} = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }

    const {token} = req.cookies;
    JsonWebToken.verify(token, secret, {}, async(err, info) => {
        if(err) throw err;
        const {id, title, summary, content} = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if(!isAuthor) {
            return res.status(400).json("you are not the author, so not permitted to access this post");
        }
        await postDoc.updateOne({title, summary, content,
            cover:newPath ? newPath : postDoc.cover,
        });
        res.json(postDoc);
})
})





app.listen(8000);