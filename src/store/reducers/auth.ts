import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isUserLoggedIn: boolean;
  isHydrated: boolean;
}

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

type CredentialsPayload = {
  accessToken: string;
  refreshToken: string;
  user?: User;
};

const initialState: AuthState = {
  accessToken: authStorage.getAccessToken(),
  refreshToken: authStorage.getRefreshToken(),
  user: null,
  isUserLoggedIn: Boolean(authStorage.getAccessToken()),
  isHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<CredentialsPayload>) => {
      const { accessToken, refreshToken, user } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isUserLoggedIn = true;
      if (user) {
        state.user = user;
      }
      authStorage.setTokens(accessToken, refreshToken);
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isUserLoggedIn = Boolean(action.payload && state.accessToken);
    },
    markHydrated: (state) => {
      state.isHydrated = true;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isUserLoggedIn = false;
      state.isHydrated = true;
      authStorage.clear();
    },
  },
});

export const { setCredentials, setUser, markHydrated, clearAuth } =
  authSlice.actions;
export default authSlice.reducer;
