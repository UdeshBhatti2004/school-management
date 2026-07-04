import { apiSlice } from '../api/apiSlice';

export const noteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotes: builder.query({
      query: () => '/notes',
      providesTags: (result) =>
        result
          ? [...result.map((n) => ({ type: 'Note', id: n._id })), { type: 'Note', id: 'LIST' }]
          : [{ type: 'Note', id: 'LIST' }],
    }),

    createNote: builder.mutation({
      query: (body) => ({ url: '/notes', method: 'POST', body }),
      invalidatesTags: [{ type: 'Note', id: 'LIST' }],
    }),

    updateNote: builder.mutation({
  query: ({ id, ...body }) => ({
    url: `/notes/${id}`,
    method: "PUT",
    body,
  }),
  invalidatesTags: [{ type: "Note", id: "LIST" }],
}),

    deleteNote: builder.mutation({
      query: (id) => ({ url: `/notes/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Note', id: 'LIST' }],
    }),
  }),
});

export const { useGetNotesQuery, useCreateNoteMutation, useUpdateNoteMutation , useDeleteNoteMutation } = noteApi;
