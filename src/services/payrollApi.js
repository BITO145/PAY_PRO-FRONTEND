import { apiSlice } from './api'

export const payrollApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPayrolls: builder.query({
      query: ({ page = 1, limit = 10, month, year, department, status, search } = {}) => ({
        url: '/payroll',
        params: { page, limit, month, year, department, status, search },
      }),
      providesTags: ['Payroll'],
    }),
    getPayroll: builder.query({
      query: (id) => `/payroll/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payroll', id }],
    }),
    generatePayroll: builder.mutation({
      query: ({ employeeId, ...data }) => ({
        url: `/payroll/generate/${employeeId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payroll'],
    }),
    updatePayroll: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/payroll/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Payroll', id }],
    }),
    processPayroll: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/payroll/${id}/process`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Payroll', id }],
    }),
    deletePayroll: builder.mutation({
      query: (id) => ({
        url: `/payroll/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payroll'],
    }),
    getEmployeePayrollHistory: builder.query({
      query: ({ employeeId, page = 1, limit = 10, year } = {}) => ({
        url: `/payroll/employee/${employeeId}/history`,
        params: { page, limit, year },
      }),
      providesTags: (result, error, { employeeId }) => [{ type: 'Payroll', id: `employee-${employeeId}` }],
    }),
    getPayrollReport: builder.query({
      query: ({ startDate, endDate, department } = {}) => ({
        url: '/payroll/reports/summary',
        params: { startDate, endDate, department },
      }),
      providesTags: ['PayrollReport'],
    }),
    // RazorpayX Payout Endpoints
    initiateBulkPayout: builder.mutation({
      query: (data) => ({
        url: '/payroll/bulk-payout',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payroll'],
    }),
    getPayoutStatus: builder.query({
      query: (payoutId) => `/payroll/payout-status/${payoutId}`,
      providesTags: (result, error, payoutId) => [{ type: 'PayoutStatus', id: payoutId }],
    }),
    getAccountBalance: builder.query({
      query: () => '/payroll/account/balance',
      providesTags: ['AccountBalance'],
    }),
  }),
})

export const {
  useGetPayrollsQuery,
  useGetPayrollQuery,
  useGeneratePayrollMutation,
  useUpdatePayrollMutation,
  useProcessPayrollMutation,
  useDeletePayrollMutation,
  useGetEmployeePayrollHistoryQuery,
  useGetPayrollReportQuery,
  useInitiateBulkPayoutMutation,
  useGetPayoutStatusQuery,
  useGetAccountBalanceQuery,
} = payrollApiSlice