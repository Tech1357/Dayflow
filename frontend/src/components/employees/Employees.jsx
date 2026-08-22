import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../layout/Header'
import EmployeeCard from '../dashboard/EmployeeCard'
import AddEmployeeModal from './AddEmployeeModal'
import { Search, Filter, Users, UserCheck, UserX, Plane, Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useEmployees } from '../../contexts/EmployeeContext'

const Employees = () => {
  const { user, isAdmin } = useAuth()
  const { employees, getStatusCounts, addEmployee, loading } = useEmployees()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  if (!user) {
    return <div>Loading...</div>
  }

  // Redirect non-admin users
  if (!isAdmin) {
    navigate('/dashboard')
    return null
  }

  const statusCounts = getStatusCounts()

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || employee.status === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const handleCardClick = (employeeId) => {
    navigate('/profile', { state: { employeeId, isOwnProfile: false } })
  }

  const handleAddEmployee = async (employeeData) => {
    const result = await addEmployee(employeeData)
    if (result.success) {
      setShowAddModal(false)
      alert('Employee added successfully!')
    } else {
      alert('Failed to add employee')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Employee Management
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage and view all employee information and status
              </p>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </button>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-900">{statusCounts.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-xl font-bold text-green-600">{statusCounts.present}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plane className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Leave</p>
                  <p className="text-xl font-bold text-blue-600">{statusCounts.leave}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <UserX className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-xl font-bold text-yellow-600">{statusCounts.absent}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-xl shadow-card border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-2 sm:flex-shrink-0">
                <Filter className="text-gray-400 h-4 w-4" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="leave">On Leave</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          {(searchTerm || selectedFilter !== 'all') && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredEmployees.length} of {statusCounts.total} employees
              </p>
            </div>
          )}

          {/* Employee Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onClick={() => handleCardClick(employee.id)}
                userRole="admin"
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredEmployees.length === 0 && employees.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-gray-400 mb-4">
                <Users className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-6">
                Start by adding your first employee to the system.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Employee
              </button>
            </div>
          )}

          {/* No Search Results */}
          {filteredEmployees.length === 0 && employees.length > 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          onSubmit={handleAddEmployee}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

export default Employees