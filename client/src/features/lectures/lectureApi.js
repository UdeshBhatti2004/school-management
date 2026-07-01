import { apiSlice } from '../api/apiSlice';

export const lectureApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLectures: builder.query({
      query: () => '/lectures',
      providesTags: (result) =>
        result
          ? [...result.map((l) => ({ type: 'Lecture', id: l._id })), { type: 'Lecture', id: 'LIST' }]
          : [{ type: 'Lecture', id: 'LIST' }],
    }),

    createLecture: builder.mutation({
      query: (body) => ({ url: '/lectures', method: 'POST', body }),
      invalidatesTags: [{ type: 'Lecture', id: 'LIST' }],
    }),

    updateLecture: builder.mutation({
      query: ({ id, ...patch }) => ({ url: `/lectures/${id}`, method: 'PUT', body: patch }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lecture', id }, { type: 'Lecture', id: 'LIST' }],
    }),

    deleteLecture: builder.mutation({
      query: (id) => ({ url: `/lectures/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Lecture', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetLecturesQuery,
  useCreateLectureMutation,
  useUpdateLectureMutation,
  useDeleteLectureMutation,
} = lectureApi;
