import { apiSlice } from '../api/apiSlice';

export const announcementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query({
      query: () => '/announcements',
      providesTags: (result) =>
        result
          ? [...result.map((a) => ({ type: 'Announcement', id: a._id })), { type: 'Announcement', id: 'LIST' }]
          : [{ type: 'Announcement', id: 'LIST' }],
    }),

    createAnnouncement: builder.mutation({
      query: (body) => ({ url: '/announcements', method: 'POST', body }),
      invalidatesTags: [{ type: 'Announcement', id: 'LIST' }],
    }),

    deleteAnnouncement: builder.mutation({
      query: (id) => ({ url: `/announcements/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Announcement', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = announcementApi;
