import authReducer, {
  clearAuth,
  markHydrated,
  setCredentials,
  setUser,
} from "./auth";

describe("auth reducer", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores credentials and user on login", () => {
    const nextState = authReducer(
      undefined,
      setCredentials({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: "u1", fullName: "Test User" },
      }),
    );

    expect(nextState.isUserLoggedIn).toBe(true);
    expect(nextState.user?.id).toBe("u1");
    expect(localStorage.getItem("accessToken")).toBe("access-token");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-token");
  });

  it("marks state hydrated and clears auth data", () => {
    const withCredentials = authReducer(
      undefined,
      setCredentials({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      }),
    );
    const hydrated = authReducer(withCredentials, markHydrated());
    const cleared = authReducer(
      {
        ...hydrated,
        user: { id: "u2", fullName: "Another User" },
      },
      clearAuth(),
    );

    expect(cleared.isHydrated).toBe(true);
    expect(cleared.isUserLoggedIn).toBe(false);
    expect(cleared.user).toBeNull();
    expect(cleared.accessToken).toBeNull();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });

  it("does not mark logged in when user is null", () => {
    const withCredentials = authReducer(
      undefined,
      setCredentials({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      }),
    );
    const nextState = authReducer(withCredentials, setUser(null));
    expect(nextState.isUserLoggedIn).toBe(false);
  });
});
