import { createSlice } from '@reduxjs/toolkit';

// status: 'idle' (haven't checked yet) -> 'loading' (checking /auth/me) -> 'authenticated' | 'unauthenticated'
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload;
      if (user) state.user = user;
      if (token) {
        state.token = token;
        localStorage.setItem('token', token);
      }
      state.status = 'authenticated';
    },
    updateUser(state, action) {
      state.user = state.user ? { ...state.user, ...action.payload } : state.user;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'unauthenticated';
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
