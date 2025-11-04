import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Loader2, 
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react'
import { 
  useGetEmployeesQuery, 
  useDeleteEmployeeMutation,
  useGetEmployeeStatsQuery 
} from '../../services/employeeApi'
import { useGetDepartmentsQuery } from '../../services/departmentApi'
import EmployeeForm from './EmployeeForm'

export default function Employees() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('department') || '')
  const [showAddForm, setShowAddForm] = useState(searchParams.get('action') === 'add')
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)
  const [showFilters, setShowFilters] = useState(false)

  // API queries
  const { 
    data: employeesData, 
    isLoading: employeesLoading, 
    error: employeesError,
    refetch: refetchEmployees
  } = useGetEmployeesQuery({
    page,
    limit: 10,
    search: searchTerm,
    department: selectedDepartment
  })

  const { data: departmentsData } = useGetDepartmentsQuery({ limit: 100 })
  const { data: employeeStats } = useGetEmployeeStatsQuery()

  const [deleteEmployee, { isLoading: deleteLoading }] = useDeleteEmployeeMutation()

  const employees = employeesData?.data || []
  const pagination = useMemo(() => {
    const p = employeesData?.pagination || {}
    return {
      currentPage: p.current,
      totalPages: p.pages,
      totalEmployees: p.total,
      itemsPerPage: p.limit,
    }
  }, [employeesData])
  const departments = departmentsData?.data || departmentsData?.departments || []

  // Update URL params
  const updateSearchParams = (params) => {
    const newSearchParams = new URLSearchParams(searchParams)
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value)
      } else {
        newSearchParams.delete(key)
      }
    })
    setSearchParams(newSearchParams)
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setPage(1)
    updateSearchParams({ search: value, page: 1 })
  }

  const handleDepartmentFilter = (value) => {
    setSelectedDepartment(value)
    setPage(1)
    updateSearchParams({ department: value, page: 1 })
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    updateSearchParams({ page: newPage })
  }

  const handleAddEmployee = () => {
    setShowAddForm(true)
    updateSearchParams({ action: 'add' })
  }

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee)
  }

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(employeeId).unwrap()
        refetchEmployees()
      } catch (error) {
        console.error('Failed to delete employee:', error)
      }
    }
  }

  const handleFormClose = () => {
    setShowAddForm(false)
    setEditingEmployee(null)
    updateSearchParams({ action: null })
    refetchEmployees()
  }

  const handleViewEmployee = (employee) => {
    navigate(`/employees/${employee._id}`)
  }

  // Loading state
  if (employeesLoading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading employees...</span>
      </div>
    )
  }

  // Error state
  if (employeesError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error loading employees</h3>
          <p className="text-muted-foreground mb-4">
            {employeesError?.data?.message || 'Something went wrong'}
          </p>
          <Button onClick={refetchEmployees}>Try Again</Button>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground mt-2">
              Manage your organization's employees and their information.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button onClick={handleAddEmployee}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {employeeStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold">{employeeStats.totalEmployees || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">{employeeStats.activeEmployees || 0}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Departments</p>
                    <p className="text-2xl font-bold">{departments.length || 0}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                    <p className="text-2xl font-bold">{employeeStats.newThisMonth || 0}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees by name, email, or employee ID..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              {showFilters && (
                <div className="flex flex-wrap gap-4 pt-4 border-t">
                  <select
                    className="px-3 py-2 border border-border rounded-md bg-background"
                    value={selectedDepartment}
                    onChange={(e) => handleDepartmentFilter(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {(searchTerm || selectedDepartment) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedDepartment('')
                        updateSearchParams({ search: '', department: '', page: 1 })
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>
              {pagination.totalEmployees ? 
                `Showing ${employees.length} of ${pagination.totalEmployees} employees` :
                'Complete list of all employees with their details'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm || selectedDepartment ? 'No employees found' : 'No employees yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedDepartment ? 
                    'Try adjusting your search or filter criteria.' :
                    'Get started by adding your first employee to the system.'
                  }
                </p>
                {!searchTerm && !selectedDepartment && (
                  <Button onClick={handleAddEmployee}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Employee
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Employee Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employees.map((employee) => (
                    <Card key={employee._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {employee.user?.name || 'Unnamed'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {employee.employeeCode}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewEmployee(employee)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEmployee(employee._id)}
                              disabled={deleteLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{employee.department?.name || 'No Department'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{employee.user?.email || '—'}</span>
                          </div>
                          {(employee.user?.phone) && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{employee.user?.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              employee.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {employee.status}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Employee Form Modal */}
      {(showAddForm || editingEmployee) && (
        <EmployeeForm
          employee={editingEmployee}
          onClose={handleFormClose}
          departments={departments}
        />
      )}
    </>
  )
}