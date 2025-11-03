import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Calendar, Plus } from 'lucide-react'

export default function Leaves() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground">
            Manage leave requests, approvals, and leave policies.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Apply Leave
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Management System</CardTitle>
          <CardDescription>
            Leave applications, approvals, and calendar integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Leave System</h3>
            <p className="text-muted-foreground mb-4">
              Leave request forms, approval workflow, and leave calendar coming soon.
            </p>
            <Button variant="outline">Check Backend</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}