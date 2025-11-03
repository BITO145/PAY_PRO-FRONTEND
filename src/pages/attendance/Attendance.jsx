import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'

export default function Attendance() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground">
            Track and manage employee attendance and working hours.
          </p>
        </div>
        <Button className="gap-2">
          <Clock className="h-4 w-4" />
          Mark Attendance
        </Button>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Present Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">94.7% attendance rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Absent Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2.0% absence rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              On Leave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">3.3% on leave</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Features */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Management</CardTitle>
          <CardDescription>
            Comprehensive attendance tracking and reporting system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Attendance System</h3>
            <p className="text-muted-foreground mb-4">
              Check-in/out, attendance reports, and analytics will be implemented here.
            </p>
            <Button variant="outline">View Backend API</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}