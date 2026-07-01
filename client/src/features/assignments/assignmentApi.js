import { apiSlice } from '../api/apiSlice';

export const assignmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssignments: builder.query({
      query: () => '/assignments',
      providesTags: (result) =>
        result
          ? [...result.map((a) => ({ type: 'Assignment', id: a._id })), { type: 'Assignment', id: 'LIST' }]
          : [{ type: 'Assignment', id: 'LIST' }],
    }),

    createAssignment: builder.mutation({
      query: (body) => ({ url: '/assignments', method: 'POST', body }),
      invalidatesTags: [{ type: 'Assignment', id: 'LIST' }],
    }),

    deleteAssignment: builder.mutation({
      query: (id) => ({ url: `/assignments/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'Assignment', id }, { type: 'Assignment', id: 'LIST' }],
    }),

    // Student submits/resubmits their own work for an assignment.
    submitAssignment: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/assignments/${id}/submit`, method: 'POST', body }),
      // mySubmission is embedded on the assignment object itself, so the
      // list needs refreshing for the student's status badge to update.
      invalidatesTags: [{ type: 'Assignment', id: 'LIST' }],
    }),

    getSubmissions: builder.query({
      query: (assignmentId) => `/assignments/${assignmentId}/submissions`,
      providesTags: (result, error, assignmentId) => [{ type: 'Submission', id: assignmentId }],
    }),

    gradeSubmission: builder.mutation({
      query: ({ submissionId, ...body }) => ({ url: `/submissions/${submissionId}/grade`, method: 'PUT', body }),
      invalidatesTags: (result, error, { assignmentId }) => [{ type: 'Submission', id: assignmentId }],
    }),
  }),
});

export const {
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useDeleteAssignmentMutation,
  useSubmitAssignmentMutation,
  useGetSubmissionsQuery,
  useGradeSubmissionMutation,
} = assignmentApi;
