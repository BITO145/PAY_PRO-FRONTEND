import { apiSlice } from './api'

export const departmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query({
      query: ({ page = 1, limit = 10, search = '' } = {}) => ({
        url: '/departments',
        params: { page, limit, search },
      }),
      providesTags: ['Department'],
    }),
    getDepartment: builder.query({
      query: (id) => `/departments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Department', id }],
    }),
    createDepartment: builder.mutation({
      query: (departmentData) => ({
        url: '/departments',
        method: 'POST',
        body: departmentData,
      }),
      invalidatesTags: ['Department'],
    }),
    updateDepartment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/departments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Department', id }],
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Department'],
    }),
    toggleDepartmentStatus: builder.mutation({
      query: (id) => ({
        url: `/departments/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Department', id }],
    }),
  }),
})

export const {
  useGetDepartmentsQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useToggleDepartmentStatusMutation,
} = departmentApiSlice