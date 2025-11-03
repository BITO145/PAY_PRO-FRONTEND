import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { CalendarDays, Plus } from 'lucide-react'

export default function Holidays() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Holidays</h1>
          <p className="text-muted-foreground">
            Manage company holidays and public holiday calendar.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Holiday
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Holiday Management</CardTitle>
          <CardDescription>
            Company holiday calendar and public holiday tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Holiday Calendar</h3>
            <p className="text-muted-foreground mb-4">
              Holiday calendar management and public holiday integration.
            </p>
            <Button variant="outline">Check Backend</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}