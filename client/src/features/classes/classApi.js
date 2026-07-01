import { apiSlice } from '../api/apiSlice';

export const classApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getClasses: builder.query({
      query: () => '/classes',
      providesTags: (result) =>
        result
          ? [...result.map((c) => ({ type: 'Class', id: c._id })), { type: 'Class', id: 'LIST' }]
          : [{ type: 'Class', id: 'LIST' }],
    }),

    // Used for the roster modal — single-class detail with populated students.
    getClassById: builder.query({
      query: (id) => `/classes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Class', id }],
    }),

    createClass: builder.mutation({
      query: (body) => ({ url: '/classes', method: 'POST', body }),
      invalidatesTags: [{ type: 'Class', id: 'LIST' }, 'Stats'],
    }),

    updateClass: builder.mutation({
      query: ({ id, ...patch }) => ({ url: `/classes/${id}`, method: 'PUT', body: patch }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Class', id }, { type: 'Class', id: 'LIST' }],
    }),

    deleteClass: builder.mutation({
      query: (id) => ({ url: `/classes/${id}`, method: 'DELETE' }),
      // Deleting a class unassigns students, so the student list & stats may change too.
      invalidatesTags: (result, error, id) => [
        { type: 'Class', id },
        { type: 'Class', id: 'LIST' },
        { type: 'User', id: 'LIST-student' },
        'Stats',
      ],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useGetClassByIdQuery,
  useLazyGetClassByIdQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = classApi;
