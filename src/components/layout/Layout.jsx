import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { Button } from '../ui/Button'
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  DollarSign,
  Building2,
  Megaphone,
  CalendarDays,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const sidebarItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Employees',
    path: '/employees',
    icon: Users
  },
  {
    title: 'Attendance',
    path: '/attendance',
    icon: Clock
  },
  {
    title: 'Leaves',
    path: '/leaves',
    icon: Calendar
  },
  {
    title: 'Payroll',
    path: '/payroll',
    icon: DollarSign
  },
  {
    title: 'Departments',
    path: '/departments',
    icon: Building2
  },
  {
    title: 'Announcements',
    path: '/announcements',
    icon: Megaphone
  },
  {
    title: 'Holidays',
    path: '/holidays',
    icon: CalendarDays
  }
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <h1 className="text-xl font-bold text-foreground">HRM System</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 bg-card">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-card-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border bg-card">
            <div className="space-y-1">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-card-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                <User className="h-5 w-5 shrink-0" />
                <span>Profile</span>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-3 h-auto text-sm font-medium text-card-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Logout</span>
              </Button>
            </div>
            {user && (
              <div className="mt-4 p-3 bg-muted rounded-lg border border-border">
                <p className="text-sm font-medium text-foreground">{user.name || user.firstName + ' ' + user.lastName}</p>
                <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role || 'Employee'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between lg:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <h2 className="text-xl font-semibold text-foreground capitalize">
              {location.pathname.split('/')[1] || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{user.name || user.firstName + ' ' + user.lastName}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role || 'Employee'}</p>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 bg-background overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}