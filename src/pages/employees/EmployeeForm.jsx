import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { X, Loader2, Save, User } from 'lucide-react'
import { useCreateEmployeeMutation, useUpdateEmployeeMutation } from '../../services/employeeApi'

export default function EmployeeForm({ employee, onClose, departments }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    designation: '',
    salary: '',
    dateOfJoining: '',
    employmentType: 'permanent',
    workLocation: 'office',
    personalDetails: {
      dateOfBirth: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    },
    bankDetails: {
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      accountHolderName: '',
      upiId: '',
      payoutMethod: 'bank_account'
    }
  })
  const [deptMode, setDeptMode] = useState(() => ('select'))
  const [deptForm, setDeptForm] = useState({ name: '', description: '', budget: '' })

  const [createEmployee, { isLoading: createLoading }] = useCreateEmployeeMutation()
  const [updateEmployee, { isLoading: updateLoading }] = useUpdateEmployeeMutation()

  const isLoading = createLoading || updateLoading
  const isEdit = !!employee

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.user?.name || '',
        email: employee.user?.email || '',
        phone: employee.user?.phone || '',
        address: employee.user?.address || '',
        department: employee.department?._id || '',
        designation: employee.designation || '',
        salary: employee.salary?.basic || '',
        dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString().split('T')[0] : '',
        employmentType: employee.employmentType || 'permanent',
        workLocation: employee.workLocation || 'office',
        personalDetails: {
          dateOfBirth: employee.personalDetails?.dateOfBirth ? new Date(employee.personalDetails.dateOfBirth).toISOString().split('T')[0] : '',
          emergencyContact: {
            name: employee.personalDetails?.emergencyContact?.name || '',
            relationship: employee.personalDetails?.emergencyContact?.relationship || '',
            phone: employee.personalDetails?.emergencyContact?.phone || ''
          }
        },
        bankDetails: {
          accountNumber: employee.bankDetails?.accountNumber || '',
          bankName: employee.bankDetails?.bankName || '',
          ifscCode: employee.bankDetails?.ifscCode || '',
          accountHolderName: employee.bankDetails?.accountHolderName || '',
          upiId: employee.bankDetails?.upiId || '',
          payoutMethod: employee.bankDetails?.payoutMethod || 'bank_account'
        }
      })
    }
  }, [employee])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('personalDetails.emergencyContact.')) {
      const field = name.split('.')[2]
      setFormData(prev => ({
        ...prev,
        personalDetails: {
          ...prev.personalDetails,
          emergencyContact: {
            ...prev.personalDetails.emergencyContact,
            [field]: value
          }
        }
      }))
    } else if (name.startsWith('personalDetails.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        personalDetails: {
          ...prev.personalDetails,
          [field]: value
        }
      }))
    } else if (name.startsWith('bankDetails.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Transform salary to the expected format
      const transformedData = {
        ...formData,
        salary: formData.salary ? { basic: parseFloat(formData.salary) } : undefined
      }

      // Department payload: if creating, send object inline
      if (deptMode === 'create') {
        const name = deptForm.name?.trim()
        if (!name) {
          alert('Department name is required')
          return
        }
        transformedData.department = {
          name,
          description: deptForm.description?.trim() || undefined,
          budget: deptForm.budget ? Number(deptForm.budget) : undefined
        }
      }

      if (isEdit) {
        await updateEmployee({
          id: employee._id,
          ...transformedData
        }).unwrap()
      } else {
        await createEmployee(transformedData).unwrap()
      }
      onClose()
    } catch (error) {
      console.error('Failed to save employee:', error)
      const errorMessage = error?.data?.message || 'Failed to save employee. Please try again.'
      alert(errorMessage)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {isEdit ? 'Edit Employee' : 'Add New Employee'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date of Birth</label>
                    <Input
                      name="personalDetails.dateOfBirth"
                      type="date"
                      value={formData.personalDetails.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Employment Type</label>
                    <select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="permanent">Permanent</option>
                      <option value="contract">Contract</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter full address"
                  />
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Employment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Department *</label>
                    {deptMode === 'select' ? (
                      <div className="space-y-2">
                        <select
                          name="department"
                          value={formData.department}
                          onChange={(e) => {
                            if (e.target.value === '__create__') {
                              setDeptMode('create')
                              setFormData(prev => ({ ...prev, department: '' }))
                            } else {
                              handleChange(e)
                            }
                          }}
                          required
                          className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        >
                          <option value="">Select Department</option>
                          {departments?.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                          <option value="__create__">+ Create new department…</option>
                        </select>
                        {!departments?.length && (
                          <p className="text-xs text-muted-foreground">No departments yet. Create one.</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 p-3 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm mb-1">Name</label>
                            <Input value={deptForm.name} onChange={(e) => setDeptForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Engineering" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Description</label>
                          <textarea
                            className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={deptForm.description}
                            onChange={(e) => setDeptForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="What does this department do?"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm mb-1">Budget (₹)</label>
                            <Input type="number" min="0" value={deptForm.budget} onChange={(e) => setDeptForm(f => ({ ...f, budget: e.target.value }))} placeholder="e.g. 1000000" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Department will be created and linked.</span>
                          <Button type="button" variant="outline" onClick={() => setDeptMode('select')}>Select existing</Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Designation *</label>
                    <Input
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      required
                      placeholder="Enter job designation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Basic Salary *</label>
                    <Input
                      name="salary"
                      type="number"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="Enter basic salary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date of Joining *</label>
                    <Input
                      name="dateOfJoining"
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Work Location</label>
                    <select
                      name="workLocation"
                      value={formData.workLocation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="office">Office</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      name="personalDetails.emergencyContact.name"
                      value={formData.personalDetails.emergencyContact.name}
                      onChange={handleChange}
                      placeholder="Contact name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Relationship</label>
                    <Input
                      name="personalDetails.emergencyContact.relationship"
                      value={formData.personalDetails.emergencyContact.relationship}
                      onChange={handleChange}
                      placeholder="Relationship"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      name="personalDetails.emergencyContact.phone"
                      value={formData.personalDetails.emergencyContact.phone}
                      onChange={handleChange}
                      placeholder="Contact phone"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details for Payroll */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Banking Information (For Payroll)</h3>
                
                {/* Payout Method Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Payout Method</label>
                  <select
                    name="bankDetails.payoutMethod"
                    value={formData.bankDetails.payoutMethod}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="bank_account">Bank Account</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>

                {/* Bank Account Details */}
                {formData.bankDetails.payoutMethod === 'bank_account' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Account Holder Name</label>
                      <Input
                        name="bankDetails.accountHolderName"
                        value={formData.bankDetails.accountHolderName}
                        onChange={handleChange}
                        placeholder="Enter account holder name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Bank Name</label>
                      <Input
                        name="bankDetails.bankName"
                        value={formData.bankDetails.bankName}
                        onChange={handleChange}
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Account Number</label>
                      <Input
                        name="bankDetails.accountNumber"
                        value={formData.bankDetails.accountNumber}
                        onChange={handleChange}
                        placeholder="Enter account number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">IFSC Code</label>
                      <Input
                        name="bankDetails.ifscCode"
                        value={formData.bankDetails.ifscCode}
                        onChange={handleChange}
                        placeholder="Enter IFSC code"
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                  </div>
                )}

                {/* UPI Details */}
                {formData.bankDetails.payoutMethod === 'upi' && (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">UPI ID</label>
                      <Input
                        name="bankDetails.upiId"
                        value={formData.bankDetails.upiId}
                        onChange={handleChange}
                        placeholder="Enter UPI ID (e.g., user@paytm)"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEdit ? 'Update Employee' : 'Create Employee'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}