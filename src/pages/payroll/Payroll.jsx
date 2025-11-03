import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DollarSign, Plus } from 'lucide-react'

export default function Payroll() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
          <p className="text-muted-foreground">
            Manage employee salaries, payslips, and payment processing.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Process Payroll
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Management</CardTitle>
          <CardDescription>
            Salary processing, payslip generation, and payment tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Payroll System</h3>
            <p className="text-muted-foreground mb-4">
              Salary calculations, payslip generation, and payment processing features.
            </p>
            <Button variant="outline">View Backend</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}