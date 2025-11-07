import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  UserCheck,
  UserX,
  CalendarCheck,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { 
  useGetDashboardStatsQuery, 
  useGetRecentActivitiesQuery,
  useGetAttendanceOverviewQuery,
  useGetDepartmentOverviewQuery 
} from '../services/dashboardApi'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetTodayAttendanceQuery, useGetAttendanceRangeQuery } from '../services/attendanceApi'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const role = (user?.role || 'employee').toLowerCase()
  
  // API queries
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useGetDashboardStatsQuery()
  const { data: recentActivities, isLoading: activitiesLoading } = useGetRecentActivitiesQuery({ limit: 6 })
  const { data: attendanceOverview, isLoading: attendanceLoading } = useGetAttendanceOverviewQuery()
  const { data: departmentOverview, isLoading: departmentLoading } = useGetDepartmentOverviewQuery()
  const { data: todayAttendance, isLoading: todayAttendanceLoading } = useGetTodayAttendanceQuery(undefined, { skip: role !== 'employee' })
  const timerRef = useRef(null)
  const [remaining, setRemaining] = useState('00:00:00')
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startDateISO = new Date(monthStart).toISOString()
  const endDateISO = new Date(new Date(monthEnd).setHours(23, 59, 59, 999)).toISOString()
  const { data: monthData, isFetching: monthLoading } = useGetAttendanceRangeQuery({ startDate: startDateISO, endDate: endDateISO }, { skip: role !== 'employee' })

  // Derive attendance fields for timer (employee only)
  const isEmployee = role === 'employee'
  const attStatus = isEmployee ? (todayAttendance?.data?.currentStatus || 'idle') : 'idle'
  const attPunchIn = isEmployee && todayAttendance?.data?.punchInTime ? new Date(todayAttendance.data.punchInTime) : null
  const attPunchOut = isEmployee && todayAttendance?.data?.punchOutTime ? new Date(todayAttendance.data.punchOutTime) : null

  // Live remaining-time timer until 6:30 PM (server policy auto-stop)
  useEffect(() => {
    if (!isEmployee) return
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (attPunchIn && !attPunchOut && attStatus === 'active') {
      // Remaining time should be based on standard work duration from punch-in
      const WORK_HOURS = 8
      const end = new Date(attPunchIn.getTime() + WORK_HOURS * 60 * 60 * 1000)
      const tick = () => {
        const ms = end.getTime() - Date.now()
        const totalSeconds = Math.max(0, Math.floor(ms / 1000))
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
        const s = String(totalSeconds % 60).padStart(2, '0')
        setRemaining(`${h}:${m}:${s}`)
      }
      tick()
      timerRef.current = setInterval(tick, 1000)
    } else {
      setRemaining('00:00:00')
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isEmployee, attPunchIn, attPunchOut, attStatus])

  const handleAddEmployee = () => {
    navigate('/employees?action=add')
  }

  const handleMarkAttendance = () => {
    navigate('/attendance')
  }

  const handleApplyLeave = () => {
    navigate('/leaves?action=apply')
  }

  const handleProcessPayroll = () => {
    navigate('/payroll')
  }

  // Render loading state (for admin/hr dashboard)
  if (statsLoading && role !== 'employee') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    )
  }

  // Render error state
  if (statsError && role !== 'employee') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error loading dashboard data</div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Employees',
      value: dashboardStats?.data.totalEmployees || 0,
      icon: Users,
      description: dashboardStats?.employeeGrowth ? `${dashboardStats.employeeGrowth > 0 ? '+' : ''}${dashboardStats.employeeGrowth}% from last month` : 'No data',
      color: 'text-blue-600'
    },
    {
      title: 'Present Today',
      value: dashboardStats?.data.presentToday || 0,
      icon: UserCheck,
      description: dashboardStats?.data.attendanceRate ? `${dashboardStats.data.attendanceRate}% attendance rate` : 'No data',
      color: 'text-green-600'
    },
    {
      title: 'On Leave',
      value: dashboardStats?.data.onLeave || 0,
      icon: CalendarCheck,
      description: dashboardStats?.data.leaveBreakdown ? `${dashboardStats.data.leaveBreakdown.sick || 0} sick, ${dashboardStats.data.leaveBreakdown.vacation || 0} vacation` : 'No data',
      color: 'text-yellow-600'
    },
    {
      title: 'Absent',
      value: dashboardStats?.data.absent || 0,
      icon: UserX,
      description: dashboardStats?.data.absenceRate ? `${dashboardStats.data.absenceRate}% absence rate` : 'No data',
      color: 'text-red-600'
    }
  ]

  // EMPLOYEE-SPECIFIC DASHBOARD
  if (role === 'employee') {
    const status = attStatus
    const punchIn = attPunchIn
    const punchOut = attPunchOut
    const inTime = punchIn ? punchIn.toLocaleTimeString() : '—'
    const outTime = punchOut ? punchOut.toLocaleTimeString() : '—'

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! Here's your day at a glance.</p>
          </div>
          <div className="flex gap-3">
            <Button className="shadow-sm" onClick={() => navigate('/attendance')}>
              <Clock className="h-4 w-4 mr-2" />
              Mark Attendance
            </Button>
            <Button variant="outline" className="shadow-sm" onClick={() => navigate('/leaves?action=apply')}>
              <Calendar className="h-4 w-4 mr-2" />
              Apply Leave
            </Button>
          </div>
        </div>

  {/* Today Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Today's Attendance</CardTitle>
              <CardDescription className="text-muted-foreground">Your check-in / check-out summary</CardDescription>
            </CardHeader>
            <CardContent>
              {todayAttendanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-accent/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="text-base font-semibold capitalize">{status === 'idle' ? 'Not Started' : status}</p>
                  </div>
                  <div className="p-4 bg-accent/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Punch In</p>
                    <p className="text-base font-semibold">{inTime}</p>
                  </div>
                  <div className="p-4 bg-accent/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Punch Out</p>
                    <p className="text-base font-semibold">{outTime}</p>
                  </div>
                  <div className="p-4 bg-accent/30 rounded-lg border border-border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                    <p className="text-lg font-semibold tabular-nums">{remaining}</p>
                  </div>
                </div>
              )}
              <div className="mt-4 flex gap-3">
                <Button onClick={() => navigate('/attendance')} className="shadow-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Go to Attendance
                </Button>
                <Button variant="outline" onClick={() => navigate('/leaves')} className="shadow-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Leaves
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Attendance Calendar (Employee) */}
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Monthly Attendance</CardTitle>
              <CardDescription className="text-muted-foreground">Green = Present, Red = Absent (weekdays with no record), Yellow = Leave</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <button
                  className="p-1 rounded hover:bg-accent"
                  onClick={() => {
                    const d = new Date(currentMonth)
                    setCurrentMonth(new Date(d.getFullYear(), d.getMonth() - 1, 1))
                  }}
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm">
                  {currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                </span>
                <button
                  className="p-1 rounded hover:bg-accent"
                  onClick={() => {
                    const d = new Date(currentMonth)
                    setCurrentMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1))
                  }}
                  aria-label="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <EmployeeMonthCalendar
                monthStart={monthStart}
                monthEnd={monthEnd}
                records={monthData?.data || monthData || []}
                loading={monthLoading}
              />
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Recent Activities</CardTitle>
              <CardDescription className="text-muted-foreground">Latest updates relevant to you</CardDescription>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading activities...</span>
                </div>
              ) : recentActivities?.length ? (
                <div className="space-y-3">
                  {recentActivities.map((activity) => {
                    const iconMap = {
                      'employee': Users,
                      'leave': Calendar,
                      'attendance': Clock,
                      'payroll': DollarSign,
                      'default': Users
                    }
                    const Icon = iconMap[activity.type] || iconMap.default
                    return (
                      <div key={activity._id || activity.id} className="flex items-center gap-4 p-3 bg-accent/30 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="p-2 bg-primary/10 rounded-full border border-primary/20">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground capitalize">{activity.action || activity.type}</p>
                          <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : activity.time}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ADMIN/HR DASHBOARD
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening at your company today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="shadow-sm">Download Report</Button>
          <Button className="shadow-sm" onClick={handleAddEmployee}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Recent Activities</CardTitle>
            <CardDescription className="text-muted-foreground">Latest updates and activities in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading activities...</span>
              </div>
            ) : recentActivities?.length ? (
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const iconMap = {
                    'employee': Users,
                    'leave': Calendar,
                    'attendance': Clock,
                    'payroll': DollarSign,
                    'default': Users
                  }
                  const Icon = iconMap[activity.type] || iconMap.default
                  
                  return (
                    <div key={activity._id || activity.id} className="flex items-center gap-4 p-3 bg-accent/30 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="p-2 bg-primary/10 rounded-full border border-primary/20">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground capitalize">{activity.action || activity.type}</p>
                        <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : activity.time}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activities</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">Frequently used actions and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {(role === 'admin' || role === 'hr') && (
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                  onClick={handleAddEmployee}
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Add Employee</span>
                </Button>
              )}
              {role === 'employee' && (
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                  onClick={handleMarkAttendance}
                >
                  <Clock className="h-6 w-6" />
                  <span className="text-sm">Mark Attendance</span>
                </Button>
              )}
              {role === 'employee' && (
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                  onClick={handleApplyLeave}
                >
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Apply Leave</span>
                </Button>
              )}
              {(role === 'admin' || role === 'hr') && (
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                  onClick={handleProcessPayroll}
                >
                  <DollarSign className="h-6 w-6" />
                  <span className="text-sm">Process Payroll</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Attendance Overview</CardTitle>
            <CardDescription className="text-muted-foreground">Weekly attendance trends</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading attendance data...</span>
              </div>
            ) : attendanceOverview?.data?.length ? (
              <div className="h-64 space-y-4 p-4">
                {attendanceOverview.data.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-accent/20 border border-border rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-foreground mb-1">No attendance data available</p>
                  <p className="text-xs text-muted-foreground">Data will appear once employees mark attendance</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Department Overview</CardTitle>
            <CardDescription className="text-muted-foreground">Employee distribution by department</CardDescription>
          </CardHeader>
          <CardContent>
            {departmentLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading department data...</span>
              </div>
            ) : departmentOverview?.departments?.length ? (
              <div className="h-64 space-y-3 p-4">
                {departmentOverview.departments.map((dept, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.employeeCount} employees</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{Math.round((dept.employeeCount / departmentOverview.totalEmployees) * 100)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-accent/20 border border-border rounded-lg">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-foreground mb-1">No department data available</p>
                  <p className="text-xs text-muted-foreground">Add departments and employees to see the distribution</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Small calendar component reused in employee dashboard
const EmployeeMonthCalendar = ({ monthStart, monthEnd, records = [], loading }) => {
  const recMap = new Map()
  records.forEach((r) => {
    const d = new Date(r.date || r?.createdAt)
    const key = d.toISOString().slice(0, 10)
    recMap.set(key, (r.status || '').toLowerCase())
  })
  const today = new Date()
  const daysInMonth = monthEnd.getDate()
  const firstWeekday = new Date(monthStart).getDay()
  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    const curr = new Date(monthStart.getFullYear(), monthStart.getMonth(), day)
    const key = curr.toISOString().slice(0, 10)
    const isFuture = curr > today
    const isWeekend = curr.getDay() === 0 || curr.getDay() === 6
    let status = recMap.get(key)
    if (!status) {
      if (!isFuture && !isWeekend) status = 'absent'
      else status = 'none'
    }
    cells.push({ day, status, date: curr })
  }
  const colorFor = (status) => {
    switch (status) {
      case 'present': return 'bg-emerald-500/20 text-emerald-700 border-emerald-300'
      case 'leave':
      case 'half day': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300'
      case 'absent': return 'bg-red-500/20 text-red-700 border-red-300'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }
  return (
    <div>
      <div className="grid grid-cols-7 text-xs text-muted-foreground mb-2">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((w) => (
          <div key={w} className="text-center py-1">{w}</div>
        ))}
      </div>
      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell, idx) =>
            cell ? (
              <div key={idx} className={`h-10 rounded-md border flex items-center justify-center text-xs ${colorFor(cell.status)}`} title={`${cell.date.toDateString()} — ${cell.status}`}>
                {cell.day}
              </div>
            ) : (
              <div key={idx} className="h-10" />
            )
          )}
        </div>
      )}
    </div>
  )
}