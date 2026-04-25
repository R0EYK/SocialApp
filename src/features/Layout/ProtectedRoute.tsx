import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export default function ProtectedRoute() {
  const { isUserLoggedIn, isHydrated } = useAppSelector(
    (state) => state.auth,
  );
  const bypassAuth =
    import.meta.env.VITE_BYPASS_AUTHENTICATION === "true" &&
    import.meta.env.VITE_MODE === "development";

  if (!isHydrated && !bypassAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking session...</p>
      </main>
    );
  }

  if (!isUserLoggedIn && !bypassAuth) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
