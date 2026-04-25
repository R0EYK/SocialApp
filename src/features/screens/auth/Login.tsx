import { AuthForm } from "@/features/Form/AuthForm";

const Login = () => {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <AuthForm mode="login" />
    </main>
  );
};

export default Login;
