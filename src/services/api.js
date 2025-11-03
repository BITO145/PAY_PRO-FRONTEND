import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import Cookies from 'js-cookie'

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || Cookies.get('token')
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result?.error?.status === 401) {
    // Token expired, logout user
    api.dispatch({ type: 'auth/logout' })
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth',
    'Employee',
    'Department',
    'Attendance',
    'Leave',
    'Payroll',
    'Announcement',
    'Holiday'
  ],
  endpoints: (builder) => ({})
})

export default apiSlice