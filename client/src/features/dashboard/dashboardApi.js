import { apiSlice } from '../api/apiSlice';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOverviewStats: builder.query({
      query: () => '/users/stats/overview',
      providesTags: ['Stats'],
    }),
  }),
});

export const { useGetOverviewStatsQuery } = dashboardApi;
