import './App.css';
import Post from "./Post";
import Header from './Header';
import {Routes, Route} from "react-router-dom";
import Layout from './Layout';
import IndexPage from './pages/IndexPage';
import Loginpage from './pages/LoginPage';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import { UserContextProvider } from './UserContext';
import PostPage from './pages/PostPage';
import EditPost from './pages/EditPost';
function App() {
  return (
    <UserContextProvider>
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route index element={
          <IndexPage />
        }/>
        <Route path="/login" element={
          <Loginpage/>
        } />
        <Route path="/register" element={
          <Register />
        } />
        <Route path="/create" element={
          <CreatePost />
        }/>
        <Route path="/post/:id" element={
          <PostPage/>
        }/>
        <Route path="/edit/:id" element={<EditPost/>}>

        </Route>
      </Route>
    </Routes>
    </UserContextProvider>
  ) 
}

export default App;
