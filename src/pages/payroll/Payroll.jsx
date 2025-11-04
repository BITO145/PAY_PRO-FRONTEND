import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  IndianRupee,
  Send
} from 'lucide-react'
import { 
  useGetPayrollsQuery, 
  useInitiateBulkPayoutMutation,
  useGetAccountBalanceQuery
} from '../../services/payrollApi'
import toast from 'react-hot-toast'

export default function Payroll() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    month: '',
    year: new Date().getFullYear(),
    department: ''
  })
  const [selectedPayrolls, setSelectedPayrolls] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const { 
    data: payrollsData, 
    isLoading, 
    refetch 
  } = useGetPayrollsQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    ...filters
  })

  const { data: balanceData } = useGetAccountBalanceQuery()

  const [initiateBulkPayout, { isLoading: payoutLoading }] = useInitiateBulkPayoutMutation()

  const payrolls = payrollsData?.data || []
  const pagination = payrollsData?.pagination || {}
  const summary = payrollsData?.summary || {}

  const handleSelectAll = () => {
    if (selectedPayrolls.length === payrolls.length) {
      setSelectedPayrolls([])
    } else {
      setSelectedPayrolls(payrolls.map(p => p._id))
    }
  }

  const handleSelectPayroll = (payrollId) => {
    setSelectedPayrolls(prev => 
      prev.includes(payrollId) 
        ? prev.filter(id => id !== payrollId)
        : [...prev, payrollId]
    )
  }

  const handleBulkPayout = async () => {
    if (selectedPayrolls.length === 0) {
      toast.error('Please select payrolls to process')
      return
    }

    try {
      const result = await initiateBulkPayout({
        payrollIds: selectedPayrolls,
        payoutMode: 'IMPS'
      }).unwrap()

      toast.success(`Bulk payout initiated! ${result.data.successful} successful, ${result.data.failed} failed`)
      setSelectedPayrolls([])
      refetch()
    } catch (error) {
      toast.error(error?.data?.error || 'Failed to initiate bulk payout')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-blue-600 bg-blue-100' 
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'pending': return <AlertCircle className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground">
            Process salaries with RazorpayX integration for instant payouts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Generate Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payrolls</p>
                <p className="text-2xl font-bold">{summary.count || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">₹{summary.totalNetSalary?.toLocaleString() || 0}</p>
              </div>
              <IndianRupee className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Salary</p>
                <p className="text-2xl font-bold">₹{Math.round(summary.averageNetSalary || 0).toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Account Balance</p>
                <p className="text-2xl font-bold">₹{balanceData?.data?.balance ? (balanceData.data.balance / 100).toLocaleString() : 'Loading...'}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="processed">Processed</option>
                <option value="failed">Failed</option>
              </select>
              
              <select
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>

              <Input
                type="number"
                placeholder="Year"
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                className="w-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedPayrolls.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{selectedPayrolls.length} payroll(s) selected</span>
              </div>
              <Button 
                onClick={handleBulkPayout}
                disabled={payoutLoading}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
                {payoutLoading ? 'Processing...' : 'Initiate Payout'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payroll Records</CardTitle>
              <CardDescription>
                Manage and process employee salaries with RazorpayX integration
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleSelectAll}>
              {selectedPayrolls.length === payrolls.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading payrolls...</div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Payrolls Found</h3>
              <p className="text-muted-foreground mb-4">
                No payroll records match your current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">
                      <input
                        type="checkbox"
                        checked={selectedPayrolls.length === payrolls.length}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left p-3">Employee</th>
                    <th className="text-left p-3">Period</th>
                    <th className="text-left p-3">Gross Salary</th>
                    <th className="text-left p-3">Net Salary</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Payment Method</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((payroll) => (
                    <tr key={payroll._id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedPayrolls.includes(payroll._id)}
                          onChange={() => handleSelectPayroll(payroll._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{payroll.employee?.user?.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{payroll.employee?.employeeCode}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {payroll.payrollPeriod ? `${payroll.payrollPeriod.month}/${payroll.payrollPeriod.year}` : 'N/A'}
                        </div>
                      </td>
                      <td className="p-3">₹{payroll.grossSalary?.toLocaleString() || 0}</td>
                      <td className="p-3 font-medium">₹{payroll.netSalary?.toLocaleString() || 0}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payroll.payoutStatus || payroll.status)}`}>
                          {getStatusIcon(payroll.payoutStatus || payroll.status)}
                          {payroll.payoutStatus || payroll.status || 'pending'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm capitalize">{payroll.paymentMethod || 'razorpayx'}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          {(payroll.payoutStatus === 'pending' || !payroll.payoutStatus) && (
                            <Button size="sm" variant="default">Process</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}