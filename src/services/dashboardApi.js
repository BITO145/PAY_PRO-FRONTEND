import { apiSlice } from './api'

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
    getRecentActivities: builder.query({
      query: ({ limit = 10 } = {}) => ({
        url: '/dashboard/activities',
        params: { limit },
      }),
      providesTags: ['Dashboard'],
    }),
    getAttendanceOverview: builder.query({
      query: ({ period = '7d' } = {}) => ({
        url: '/dashboard/attendance-overview',
        params: { period },
      }),
      providesTags: ['Dashboard'],
    }),
    getDepartmentOverview: builder.query({
      query: () => '/dashboard/department-overview',
      providesTags: ['Dashboard'],
    }),
  }),
})

export const {
  useGetDashboardStatsQuery,
  useGetRecentActivitiesQuery,
  useGetAttendanceOverviewQuery,
  useGetDepartmentOverviewQuery,
} = dashboardApiSlice