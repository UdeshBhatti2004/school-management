import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../auth/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// Wraps the base query so an expired/invalid token clears auth state and
// bounces to /login the same way the old axios interceptor did.
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && api.getState().auth.token) {
  const message = result.error?.data?.message || "";

  if (
    message.toLowerCase().includes("token") ||
    message.toLowerCase().includes("not authorized")
  ) {
    api.dispatch(logout());

    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }
}

if (result.error?.status === 403) {
  const { code, message } = result.error?.data || {};

  if (
    code === "TRIAL_EXPIRED" ||
    code === "SCHOOL_DEACTIVATED"
  ) {
    api.dispatch(logout());

  sessionStorage.setItem(
  "schoolAccessError",
  JSON.stringify({
    code,
    message,
  })
);

api.dispatch(logout());

window.location.href = "/school-access";
  }
}

  return result;
};

// Central cache tag registry. New features add their tag here once,
// then reference it from their own injectEndpoints() call.
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,

  tagTypes: [
    'Auth',
    'Stats',
    'User',
    'Class',
    'Announcement',
    'Assignment',
    'Submission',
    'Attendance',
    'Fee',
    'Lecture',
    'Note',
  ],

  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  refetchOnReconnect: true,

  endpoints: () => ({}),
});
