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
  Loader2
} from 'lucide-react'
import { 
  useGetDashboardStatsQuery, 
  useGetRecentActivitiesQuery,
  useGetAttendanceOverviewQuery,
  useGetDepartmentOverviewQuery 
} from '../services/dashboardApi'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  
  // API queries
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useGetDashboardStatsQuery()
  const { data: recentActivities, isLoading: activitiesLoading } = useGetRecentActivitiesQuery({ limit: 6 })
  const { data: attendanceOverview, isLoading: attendanceLoading } = useGetAttendanceOverviewQuery()
  const { data: departmentOverview, isLoading: departmentLoading } = useGetDepartmentOverviewQuery()

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

  // Render loading state
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    )
  }

  // Render error state
  if (statsError) {
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
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                onClick={handleAddEmployee}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Add Employee</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                onClick={handleMarkAttendance}
              >
                <Clock className="h-6 w-6" />
                <span className="text-sm">Mark Attendance</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                onClick={handleApplyLeave}
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Apply Leave</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                onClick={handleProcessPayroll}
              >
                <DollarSign className="h-6 w-6" />
                <span className="text-sm">Process Payroll</span>
              </Button>
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