import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Employees from './pages/employees/Employees'
import Attendance from './pages/attendance/Attendance'
import Leaves from './pages/leaves/Leaves'
import Payroll from './pages/payroll/Payroll'
import Departments from './pages/departments/Departments'
import Announcements from './pages/announcements/Announcements'
import Holidays from './pages/holidays/Holidays'
import Profile from './pages/Profile'
import './App.css'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Role-based Route Component
const RoleRoute = ({ children, allowed = [] }) => {
  const { user } = useSelector((state) => state.auth)
  const role = (user?.role || 'employee').toLowerCase()
  if (allowed.length === 0 || allowed.includes(role)) return children
  return <Navigate to="/dashboard" replace />
}

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="employees"
          element={
            <RoleRoute allowed={[ 'admin', 'hr' ]}>
              <Employees />
            </RoleRoute>
          }
        />
        <Route
          path="attendance"
          element={
            <RoleRoute allowed={[ 'employee' ]}>
              <Attendance />
            </RoleRoute>
          }
        />
        <Route
          path="leaves"
          element={
            <RoleRoute allowed={[ 'admin', 'hr', 'employee' ]}>
              <Leaves />
            </RoleRoute>
          }
        />
        <Route
          path="payroll"
          element={
            <RoleRoute allowed={[ 'admin', 'hr' ]}>
              <Payroll />
            </RoleRoute>
          }
        />
        <Route
          path="departments"
          element={
            <RoleRoute allowed={[ 'admin', 'hr' ]}>
              <Departments />
            </RoleRoute>
          }
        />
        <Route path="announcements" element={<Announcements />} />
        <Route path="holidays" element={<Holidays />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
