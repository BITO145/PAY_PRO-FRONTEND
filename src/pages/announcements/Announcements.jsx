import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Megaphone, Plus } from 'lucide-react'

export default function Announcements() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground">
            Create and manage company announcements and notifications.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcement System</CardTitle>
          <CardDescription>
            Company-wide communications and important updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Announcements</h3>
            <p className="text-muted-foreground mb-4">
              Create, edit, and broadcast announcements to your organization.
            </p>
            <Button variant="outline">View API</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}