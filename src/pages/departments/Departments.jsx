import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Building2, Plus } from 'lucide-react'

export default function Departments() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground">
            Manage organizational departments and their structure.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Management</CardTitle>
          <CardDescription>
            Organize your company structure and manage departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Department System</h3>
            <p className="text-muted-foreground mb-4">
              Department creation, management, and organizational structure.
            </p>
            <Button variant="outline">Check API</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}