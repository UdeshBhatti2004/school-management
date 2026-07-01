import { apiSlice } from '../api/apiSlice';

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Raw attendance sheet for one class/date (used by TakeAttendance to
    // pre-fill existing marks when re-opening a date that was already taken).
    getAttendance: builder.query({
      query: ({ classRoom, date }) => `/attendance?classRoom=${classRoom}&date=${date}`,
      providesTags: (result, error, { classRoom }) => [{ type: 'Attendance', id: classRoom }],
    }),

    getClassSummary: builder.query({
      query: (classRoom) => `/attendance/summary?classRoom=${classRoom}`,
      providesTags: (result, error, classRoom) => [{ type: 'Attendance', id: classRoom }],
    }),

    getMyAttendance: builder.query({
      query: () => '/attendance/me',
      providesTags: ['Attendance'],
    }),

    markAttendance: builder.mutation({
      query: (body) => ({ url: '/attendance', method: 'POST', body }),
      // Refresh that class's sheet/summary and the generic tag so a
      // student viewing their own record later gets the fresh data too.
      invalidatesTags: (result, error, { classRoom }) => [{ type: 'Attendance', id: classRoom }, 'Attendance'],
    }),
  }),
});

export const {
  useGetAttendanceQuery,
  useGetClassSummaryQuery,
  useGetMyAttendanceQuery,
  useMarkAttendanceMutation,
} = attendanceApi;
