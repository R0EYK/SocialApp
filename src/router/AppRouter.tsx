import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../features/screens/Home";
import Register from "@/features/screens/auth/Register";
import Login from "@/features/screens/auth/Login";
import Profile from "@/features/screens/Profile/Profile";
import PostList from "@/features/screens/Post/PostList";
import AppLayout from "@/features/Layout/AppLayout";
import Post from "@/features/screens/Post/Post";
import ProtectedRoute from "@/features/Layout/ProtectedRoute";
import CreatePost from "@/features/screens/Post/CreatePost";
import EditPostPage from "@/features/screens/Post/EditPost";
import ConversationsPage from "@/features/screens/Chat/ConversationsPage";
import ConversationPage from "@/features/screens/Chat/ConversationPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/post/list" element={<PostList />} />
            <Route path="/post/:postId" element={<Post />} />
            <Route path="/post/create" element={<CreatePost />} />
            <Route path="/post/edit/:postId" element={<EditPostPage />} />
            <Route path="/chat" element={<ConversationsPage />} />
            <Route path="/chat/:id" element={<ConversationPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
