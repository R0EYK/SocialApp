import type { RootState } from "@/store";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const isUserLoggedIn = useSelector(
    (state: RootState) => state.auth.isUserLoggedIn,
  );
  console.log(import.meta.env.VITE_BYPASS_AUTHENTICATION);

  if (
    !isUserLoggedIn &&
    (import.meta.env.VITE_BYPASS_AUTHENTICATION !== "true" ||
      import.meta.env.VITE_MODE !== "development")
  ) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
