import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { User, Mail, Phone, MapPin, Edit, Save } from 'lucide-react'
import { useState } from 'react'

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)

  const user = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    position: 'Software Developer',
    department: 'Engineering',
    location: 'New York, USA',
    joinDate: 'January 15, 2023',
    employeeId: 'EMP001'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account settings.
          </p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          className="gap-2"
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your basic information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  value={user.name} 
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  value={user.email} 
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  value={user.phone} 
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input 
                  value={user.location} 
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Info */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{user.employeeId}</p>
                <p className="text-xs text-muted-foreground">Employee ID</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{user.position}</p>
                <p className="text-xs text-muted-foreground">Position</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{user.department}</p>
                <p className="text-xs text-muted-foreground">Department</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{user.joinDate}</p>
                <p className="text-xs text-muted-foreground">Join Date</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Manage your password and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Customize your application experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Update Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}