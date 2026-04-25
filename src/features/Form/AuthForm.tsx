import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { APP_NAME } from "@/app.const";
import {
  useGoogleSigninMutation,
  useLoginMutation,
  useRegisterMutation,
} from "@/store/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/reducers/auth";

interface AuthFormProps {
  mode: "login" | "register";
}

type GoogleCredentialResponse = {
  credential: string;
};

type GoogleIdAccounts = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  prompt: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdAccounts;
      };
    };
  }
}

export function AuthForm({ mode }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [googleSignin, { isLoading: isGoogleLoading }] = useGoogleSigninMutation();

  const isLogin = mode === "login";
  const isSubmitting = isLogin ? isLoginLoading : isRegisterLoading;

  const parseAuthError = (error: unknown) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "data" in error &&
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data &&
      typeof error.data.message === "string"
    ) {
      return error.data.message;
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === "FETCH_ERROR"
    ) {
      return "Cannot reach backend. Make sure backend runs on http://localhost:5001 and restart frontend dev server.";
    }
    return "Authentication failed. Please check your details and try again.";
  };

  const applyAuthResponse = (authResponse: {
    accessToken: string;
    refreshToken: string;
    id: string;
    fullName: string;
    image?: string;
    email: string;
  }) => {
    dispatch(
      setCredentials({
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        user: {
          id: authResponse.id,
          fullName: authResponse.fullName,
          image: authResponse.image,
          email: authResponse.email,
        },
      }),
    );
    navigate("/post/list", { replace: true });
  };

  const loadGoogleScript = () =>
    new Promise<void>((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      const authResponse = isLogin
        ? await login({ email, password }).unwrap()
        : await register({ fullName: name, email, password }).unwrap();

      applyAuthResponse(authResponse);
    } catch (error) {
      setFormError(parseAuthError(error));
    }
  };

  const handleGoogleLogin = async () => {
    setFormError(null);
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as
      | string
      | undefined;

    if (!googleClientId) {
      setFormError("Missing VITE_GOOGLE_CLIENT_ID in frontend .env");
      return;
    }

    try {
      await loadGoogleScript();
      if (!window.google?.accounts?.id) {
        setFormError("Google Sign-in failed to initialize.");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }: GoogleCredentialResponse) => {
          try {
            const authResponse = await googleSignin({ credential }).unwrap();
            applyAuthResponse(authResponse);
          } catch (error) {
            setFormError(parseAuthError(error));
          }
        },
      });
      window.google.accounts.id.prompt();
    } catch {
      setFormError("Failed to load Google Sign-in. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-foreground rounded-md" />
          <span className="font-semibold text-xl">{APP_NAME}</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isLogin
            ? "Enter your credentials to access your account"
            : "Enter your details to get started"}
        </p>
      </div>

      <div className="space-y-6">
        <Button
          variant="outline"
          className="w-full h-11 font-medium bg-transparent"
          onClick={handleGoogleLogin}
          type="button"
          disabled={isGoogleLoading || isSubmitting}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
                required
                autoFocus
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              required
              autoFocus={isLogin}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isLogin
                ? "Signing in..."
                : "Creating account..."
              : isLogin
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>
        {formError ? (
          <p className="text-sm text-red-600 text-center" role="alert">
            {formError}
          </p>
        ) : null}

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link
            to={isLogin ? "/auth/register" : "/auth/login"}
            className="font-medium text-foreground hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
