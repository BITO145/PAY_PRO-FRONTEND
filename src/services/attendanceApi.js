import apiSlice from './api'

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTodayAttendance: builder.query({
      query: () => ({ url: '/attendance/today', method: 'GET' }),
      providesTags: ['Attendance']
    }),
    getAttendanceRange: builder.query({
      query: ({ startDate, endDate }) => ({
        url: '/attendance',
        method: 'GET',
        params: { startDate, endDate }
      }),
      providesTags: ['Attendance']
    }),
    markAttendance: builder.mutation({
      query: (formData) => ({
        url: '/attendance/mark',
        method: 'POST',
        body: formData
      }),
      invalidatesTags: ['Attendance']
    })
  })
})

export const { useGetTodayAttendanceQuery, useGetAttendanceRangeQuery, useMarkAttendanceMutation } = attendanceApi
