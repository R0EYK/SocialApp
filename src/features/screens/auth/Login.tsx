import { AuthForm } from "@/features/Form/AuthForm";
import React from "react";

const Login = () => {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <AuthForm mode="login" />
    </main>
  );
};

export default Login;
