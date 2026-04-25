import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAppSelector } from "@/store/hooks";

vi.mock("@/store/hooks", () => ({
  useAppSelector: vi.fn(),
}));

const mockedUseAppSelector = vi.mocked(useAppSelector);

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_BYPASS_AUTHENTICATION", "false");
    vi.stubEnv("VITE_MODE", "test");
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("shows loader while auth is not hydrated", () => {
    mockedUseAppSelector.mockReturnValue({
      isUserLoggedIn: false,
      isHydrated: false,
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Checking session...")).toBeInTheDocument();
  });

  it("redirects unauthenticated user to login", () => {
    mockedUseAppSelector.mockReturnValue({
      isUserLoggedIn: false,
      isHydrated: true,
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/auth/login" element={<div>Login page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders outlet for authenticated user", () => {
    mockedUseAppSelector.mockReturnValue({
      isUserLoggedIn: true,
      isHydrated: true,
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
