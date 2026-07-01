import { apiSlice } from '../api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (role) => `/users?role=${role}`,
      providesTags: (result, error, role) =>
        result
          ? [...result.map((u) => ({ type: 'User', id: u._id })), { type: 'User', id: `LIST-${role}` }]
          : [{ type: 'User', id: `LIST-${role}` }],
    }),

    createUser: builder.mutation({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      // A new teacher/student should refresh that role's list AND the
      // dashboard stat cards — no manual refetch() needed anywhere.
      invalidatesTags: (result, error, body) => [{ type: 'User', id: `LIST-${body.role}` }, 'Stats'],
    }),

    updateUser: builder.mutation({
      query: ({ id, role, ...patch }) => ({ url: `/users/${id}`, method: 'PUT', body: patch }),
      invalidatesTags: (result, error, { id, role }) => [
        { type: 'User', id },
        { type: 'User', id: `LIST-${role}` },
      ],
    }),

    deleteUser: builder.mutation({
      query: ({ id }) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { role }) => [{ type: 'User', id: `LIST-${role}` }, 'Stats'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
