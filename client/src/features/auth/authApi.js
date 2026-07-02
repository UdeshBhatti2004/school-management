import { apiSlice } from '../api/apiSlice';
import { setCredentials, updateUser, logout } from './authSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
      async onQueryStarted(_credentials, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled; // let errors bubble to the caller via .unwrap()
        dispatch(setCredentials({ user: data.user, token: data.token }));
      },
      invalidatesTags: ['Auth'],
    }),


    //  Register new user
    register: builder.mutation({
  query: (body) => ({
    url: "/auth/register",
    method: "POST",
    body,
  }),
  async onQueryStarted(_body, { dispatch, queryFulfilled }) {
    const { data } = await queryFulfilled;

    dispatch(
      setCredentials({
        user: data.user,
        token: data.token,
      })
    );
  },
  invalidatesTags: ["Auth"],
}),

    // Restores the session on page load when a token is already in storage.
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth'],
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data }));
        } catch {
          dispatch(logout());
        }
      },
    }),

    updateProfile: builder.mutation({
      query: (body) => ({ url: '/auth/profile', method: 'PUT', body }),
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(updateUser(data));
      },
    }),

    changePassword: builder.mutation({
      query: (body) => ({ url: '/auth/password', method: 'PUT', body }),
    }),
  }),
});

export const { useLoginMutation,useRegisterMutation, useGetMeQuery, useUpdateProfileMutation, useChangePasswordMutation } = authApi;
