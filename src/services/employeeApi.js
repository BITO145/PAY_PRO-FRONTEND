import { apiSlice } from './api'

export const employeeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: ({ page = 1, limit = 10, search = '', department = '' } = {}) => ({
        url: '/employees',
        params: { page, limit, search, department },
      }),
      providesTags: ['Employee'],
    }),
    getEmployee: builder.query({
      query: (id) => `/employees/${id}`,
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
    }),
    createEmployee: builder.mutation({
      query: (employeeData) => ({
        url: '/employees',
        method: 'POST',
        body: employeeData,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployee: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/employees/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Employee', id }],
    }),
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee'],
    }),
    getEmployeeStats: builder.query({
      query: () => '/employees/stats',
      providesTags: ['Employee'],
    }),
  }),
})

export const {
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetEmployeeStatsQuery,
} = employeeApiSlice