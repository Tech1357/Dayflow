import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../layout/Header'
import MyProfile from './tabs/MyProfile'
import PrivateInfo from './tabs/PrivateInfo'
import BankDetails from './tabs/BankDetails'
import SalaryInfo from './tabs/SalaryInfo'
import Resume from './tabs/Resume'
import Skills from './tabs/Skills'
import Security from './tabs/Security'
import { useAuth } from '../../contexts/AuthContext'
import { useEmployees } from '../../contexts/EmployeeContext'

const EmployeeProfile = () => {
  const { user, isAdmin } = useAuth()
  const { employees, getEmployeeById } = useEmployees()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('profile')
  const [currentEmployee, setCurrentEmployee] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState(true)

  if (!user) {
    return <div>Loading...</div>
  }

  useEffect(() => {
    // Get employee data from context or use current user data
    const employeeId = location.state?.employeeId || (user.employee?.id || user.id)
    const isOwn = location.state?.isOwnProfile !== false
    
    console.log('🔍 Loading employee profile:', { employeeId, isOwn, user })
    
    // Try to get employee from context first
    let employee = getEmployeeById(employeeId)
    console.log('👤 Employee from context:', employee)
    
    // If not found in context, use user data as fallback
    if (!employee && user.employee) {
      employee = {
        id: user.employee.id || user.id || 1, // Ensure we have an ID
        name: `${user.employee.firstName} ${user.employee.lastName}`,
        position: user.employee.position || 'Employee',
        department: user.employee.department || 'General',
        email: user.employee.email || user.email,
        phone: user.employee.phone || '+1 (555) 123-4567',
        address: user.employee.address || '123 Main St, City, State 12345',
        dateOfBirth: user.employee.dateOfBirth || '1990-01-01',
        nationality: user.employee.nationality || 'American',
        maritalStatus: user.employee.maritalStatus || 'Single',
        gender: user.employee.gender || 'Not specified',
        emergencyContact: user.employee.emergencyContact || {
          name: 'Emergency Contact',
          relationship: 'Family',
          phone: '+1 (555) 987-6543'
        }
      }
      console.log('👤 Created employee from user data:', employee)
    } else if (!employee) {
      // Last fallback - create a basic employee object
      employee = {
        id: 1,
        name: user.name || 'John Doe',
        position: 'Employee',
        department: 'General',
        email: user.email || 'employee@company.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, City, State 12345'
      }
      console.log('👤 Created fallback employee:', employee)
    }
    
    setCurrentEmployee(employee)
    setIsOwnProfile(isOwn)
  }, [location.state, user, employees, getEmployeeById])

  // Handle employee data updates
  const handleEmployeeUpdate = (updatedEmployee) => {
    console.log('📝 Updating employee data in parent:', updatedEmployee)
    setCurrentEmployee(updatedEmployee)
  }

  // Define available tabs based on role and profile ownership
  const getAvailableTabs = () => {
    const baseTabs = [
      { id: 'profile', label: 'My Profile', component: MyProfile },
      { id: 'resume', label: 'Resume', component: Resume },
    ]

    // Private info - accessible to employee and admin
    if (isOwnProfile || isAdmin) {
      baseTabs.push({ id: 'private', label: 'Private Info', component: PrivateInfo })
    }

    // Bank details - accessible to employee and admin/HR
    if (isOwnProfile || isAdmin) {
      baseTabs.push({ id: 'bank', label: 'Bank Details', component: BankDetails })
    }

    // Salary info - only visible to admin/HR
    if (isAdmin) {
      baseTabs.push({ id: 'salary', label: 'Salary Info', component: SalaryInfo })
    }

    // Skills and Security for own profile
    if (isOwnProfile) {
      baseTabs.push(
        { id: 'skills', label: 'Skills', component: Skills },
        { id: 'security', label: 'Security', component: Security }
      )
    }

    return baseTabs
  }

  const availableTabs = getAvailableTabs()
  const ActiveComponent = availableTabs.find(tab => tab.id === activeTab)?.component || MyProfile

  if (!currentEmployee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
            <p className="text-gray-600">Please wait while we load the profile information.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-6">
              {/* Profile Picture */}
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {currentEmployee.profileImage ? (
                  <img 
                    src={currentEmployee.profileImage} 
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-500">
                    {currentEmployee.name.charAt(0)}
                  </span>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{currentEmployee.name}</h1>
                <p className="text-lg text-gray-600 mt-1">{currentEmployee.position}</p>
                <p className="text-sm text-gray-500 mt-1">{currentEmployee.department}</p>
                
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 text-gray-900">{currentEmployee.email}</span>
                  </div>
                  {(isOwnProfile || isAdmin) && (
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-2 text-gray-900">{currentEmployee.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Badge */}
              {isAdmin && !isOwnProfile && (
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Admin View
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {availableTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <ActiveComponent 
                employee={currentEmployee}
                userRole={isAdmin ? 'admin' : 'employee'}
                isOwnProfile={isOwnProfile}
                onEmployeeUpdate={handleEmployeeUpdate}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EmployeeProfile