import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Building2, Edit3, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { 
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useToggleDepartmentStatusMutation
} from '../../services/departmentApi'
import { useGetEmployeesQuery } from '../../services/employeeApi'

function DepartmentForm({ initial, onSubmit, onClose, employees, submitting }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    description: initial?.description || '',
    headOfDepartment: initial?.headOfDepartment?._id || '',
    budget: initial?.budget || ''
  }))

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.name) {
      toast.error('Name is required')
      return
    }
    const payload = {
      ...form,
      budget: form.budget ? Number(form.budget) : undefined,
    }
    onSubmit(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{initial ? 'Edit Department' : 'Add Department'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Engineering" />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              name="description"
              className="w-full min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              value={form.description}
              onChange={handleChange}
              placeholder="What does this department do?"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-foreground">Department Head</label>
              <select
                name="headOfDepartment"
                value={form.headOfDepartment}
                onChange={handleChange}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="">None</option>
                {employees?.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {(emp.user?.name || emp.name || 'Unnamed')} ({emp.employeeCode || emp.employeeId || '—'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1 text-foreground">Budget (₹)</label>
              <Input name="budget" type="number" min="0" value={form.budget} onChange={handleChange} placeholder="e.g. 1000000" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : (initial ? 'Update' : 'Create')}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Departments() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all') // all | active | inactive
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data, isFetching, refetch } = useGetDepartmentsQuery({ page, limit, search, status, sortBy, sortOrder })
  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation()
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation()
  const [deleteDepartment] = useDeleteDepartmentMutation()
  const [toggleDepartmentStatus] = useToggleDepartmentStatusMutation()

  const { data: employeesData } = useGetEmployeesQuery({ page: 1, limit: 100 })
  const headOptions = useMemo(() => employeesData?.data || [], [employeesData])

  const departments = data?.data || []
  const pagination = data?.pagination

  const onAdd = () => {
    setEditing(null)
    setShowForm(true)
  }

  const onEdit = (dept) => {
    setEditing(dept)
    setShowForm(true)
  }

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await updateDepartment({ id: editing._id, ...payload }).unwrap()
        toast.success('Department updated')
      } else {
        await createDepartment(payload).unwrap()
        toast.success('Department created')
      }
      setShowForm(false)
      setEditing(null)
      refetch()
    } catch (err) {
      const message = err?.data?.error || 'Operation failed'
      toast.error(message)
    }
  }

  const handleDelete = async (dept) => {
    if (!confirm(`Delete department ${dept.name}?`)) return
    try {
      await deleteDepartment(dept._id).unwrap()
      toast.success('Department deleted')
      refetch()
    } catch (err) {
      toast.error(err?.data?.error || 'Delete failed')
    }
  }

  const handleToggle = async (dept) => {
    try {
      await toggleDepartmentStatus(dept._id).unwrap()
      toast.success(`Department ${dept.isActive ? 'deactivated' : 'activated'}`)
      refetch()
    } catch (err) {
      toast.error(err?.data?.error || 'Update failed')
    }
  }

  const changeSort = (key) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground">Manage organizational departments and their structure.</p>
        </div>
        <Button className="gap-2" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Management</CardTitle>
          <CardDescription>Organize your company structure and manage departments</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
                <Input
                placeholder="Search by name or description..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Head of Department</th>
                  <th className="text-left px-4 py-3">Employees</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>  
              <tbody>
                {isFetching && (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-muted-foreground">Loading...</td>
                  </tr>
                )}
                {!isFetching && departments.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-10 w-10" />
                        <span>No departments found</span>
                      </div>
                    </td>
                  </tr>
                )}
                {departments.map((dept) => (
                  <tr key={dept._id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{dept.name}</div>
                      <div className="text-xs text-muted-foreground">{dept.description || '—'}</div>
                    </td>
                    <td className="px-4 py-3">{dept.headOfDepartment?.user?.name || dept.headOfDepartment?.name || '—'}</td>
                    <td className="px-4 py-3">{dept.employeeCount ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${dept.isActive ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => onEdit(dept)}>
                          <Edit3 className="h-4 w-4" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => handleToggle(dept)}>
                          {dept.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />} {dept.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="destructive" size="sm" className="gap-1" onClick={() => handleDelete(dept)}>
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <DepartmentForm
          initial={editing}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditing(null) }}
          employees={headOptions}
          submitting={isCreating || isUpdating}
        />
      )}
    </div>
  )
}