import { apiSlice } from '../api/apiSlice';

export const feeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFees: builder.query({
      query: () => '/fees',
      providesTags: (result) =>
        result
          ? [...result.map((f) => ({ type: 'Fee', id: f._id })), { type: 'Fee', id: 'LIST' }]
          : [{ type: 'Fee', id: 'LIST' }],
    }),

    getFeeSummary: builder.query({
      query: () => '/fees/summary',
      providesTags: [{ type: 'Fee', id: 'SUMMARY' }],
    }),

    createFee: builder.mutation({
      query: (body) => ({ url: '/fees', method: 'POST', body }),
      invalidatesTags: [{ type: 'Fee', id: 'LIST' }, { type: 'Fee', id: 'SUMMARY' }],
    }),

    recordPayment: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/fees/${id}/pay`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Fee', id },
        { type: 'Fee', id: 'LIST' },
        { type: 'Fee', id: 'SUMMARY' },
      ],
    }),

    updateFee: builder.mutation({
      query: ({ id, ...patch }) => ({ url: `/fees/${id}`, method: 'PUT', body: patch }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Fee', id },
        { type: 'Fee', id: 'LIST' },
        { type: 'Fee', id: 'SUMMARY' },
      ],
    }),

    deleteFee: builder.mutation({
      query: (id) => ({ url: `/fees/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Fee', id: 'LIST' }, { type: 'Fee', id: 'SUMMARY' }],
    }),
  }),
});

export const {
  useGetFeesQuery,
  useGetFeeSummaryQuery,
  useCreateFeeMutation,
  useRecordPaymentMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
} = feeApi;
