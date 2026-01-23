import { createSlice } from "@reduxjs/toolkit";

interface IAuthState {
  isUserLoggedIn: boolean;
}

const initialState: IAuthState = {
  isUserLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
});

export default authSlice.reducer;
