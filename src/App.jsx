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
        <Route path="employees" element={<Employees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="departments" element={<Departments />} />
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
