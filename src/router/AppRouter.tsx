import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../features/screens/Home";
import Register from "@/features/screens/auth/Register";
import Login from "@/features/screens/auth/Login";
import Profile from "@/features/screens/Profile/Profile";
import PostList from "@/features/screens/Post/PostList";
import AppLayout from "@/features/Layout/AppLayout";
import Post from "@/features/screens/Post/Post";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route element={<AppLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/post/list" element={<PostList />} />
          <Route path="/posts/:postId" element={<Post />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
