import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../features/screens/Home";
import Register from "@/features/screens/auth/Register";
import Login from "@/features/screens/auth/Login";
// import other pages as needed

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
