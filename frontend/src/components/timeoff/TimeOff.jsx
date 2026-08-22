import { useState } from 'react'
import Header from '../layout/Header'
import TimeOffBalance from './TimeOffBalance'
import TimeOffCalendar from './TimeOffCalendar'
import TimeOffRequests from './TimeOffRequests'
import NewTimeOffModal from './NewTimeOffModal'
import { Plus, Calendar, Clock, Users } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLeaveRequests } from '../../contexts/LeaveRequestContext'

const TimeOff = () => {
  const { user, isAdmin } = useAuth()
  const { leaveRequests, submitLeaveRequest, loading } = useLeaveRequests()
  const [activeTab, setActiveTab] = useState('overview')
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  if (!user) {
    return <div>Loading...</div>
  }

  // Get current user name first
  const currentUserName = user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.name || 'Unknown'

  // Dynamic time off data based on user's leave requests
  const getUserTimeOffBalances = () => {
    const userRequests = leaveRequests.filter(req => req.employeeName === currentUserName)
    
    // Calculate days taken for each type
    const calculateDaysUsed = (requests) => {
      return requests.reduce((total, req) => {
        if (req.status === 'approved') {
          const fromDate = new Date(req.fromDate)
          const toDate = new Date(req.toDate)
          const daysDiff = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1
          return total + daysDiff
        }
        return total
      }, 0)
    }
    
    const annualLeaveRequests = userRequests.filter(req => 
      req.leaveType === 'Annual Leave' || req.leaveType === 'Personal Leave'
    )
    const sickLeaveRequests = userRequests.filter(req => 
      req.leaveType === 'Sick Leave'
    )
    
    const paidUsed = calculateDaysUsed(annualLeaveRequests)
    const sickUsed = calculateDaysUsed(sickLeaveRequests)

    return {
      paidTimeOff: {
        available: Math.max(0, 30 - paidUsed), // 30 days annual allowance
        used: paidUsed,
        total: 30
      },
      sickTimeOff: {
        available: Math.max(0, 10 - sickUsed), // 10 days sick leave allowance
        used: sickUsed,
        total: 10
      }
    }
  }

  const timeOffBalances = getUserTimeOffBalances()

  // Filter requests based on user role and user name
  const filteredRequests = isAdmin 
    ? leaveRequests 
    : leaveRequests.filter(req => req.employeeName === currentUserName)

  const handleNewRequest = () => {
    setShowNewRequestModal(true)
  }

  const handleRequestSubmit = async (requestData) => {
    try {
      const result = await submitLeaveRequest(requestData)
      if (result.success) {
        setShowNewRequestModal(false)
        // Success message is already shown in the modal
      } else {
        alert('Failed to submit leave request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const tabs = [
    {
      id: 'overview',
      label: isAdmin ? 'All Requests' : 'My Time Off',
      icon: Calendar
    }
  ]

  if (isAdmin) {
    tabs.push({
      id: 'calendar',
      label: 'Team Calendar',
      icon: Users
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isAdmin ? 'Time Off Management' : 'Time Off'}
              </h1>
              <p className="text-gray-600">
                {isAdmin 
                  ? 'Manage team time off requests and approvals' 
                  : 'View your time off balance and submit new requests'
                }
              </p>
            </div>

            {/* NEW Button */}
            <button
              onClick={handleNewRequest}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              NEW
            </button>
          </div>

          {/* Time Off Balances - Only for employees or when viewing own profile */}
          {(!isAdmin || activeTab === 'overview') && (
            <TimeOffBalance 
              balances={timeOffBalances}
              userRole={isAdmin ? 'admin' : 'employee'}
            />
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <TimeOffRequests 
                  requests={filteredRequests}
                  userRole={isAdmin ? 'admin' : 'employee'}
                  onRequestSelect={setSelectedRequest}
                />
              )}
              
              {activeTab === 'calendar' && isAdmin && (
                <TimeOffCalendar 
                  requests={leaveRequests}
                  userRole={isAdmin ? 'admin' : 'employee'}
                />
              )}
            </div>
          </div>

          {/* Note for Employee View */}
          {!isAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Note</h4>
              <p className="text-sm text-blue-700">
                Employees can view only their own time off records, while 
                Admins and HR Officers can view time off records & 
                approve/reject them for all employees.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* New Time Off Request Modal */}
      {showNewRequestModal && (
        <NewTimeOffModal
          onSubmit={handleRequestSubmit}
          onCancel={() => setShowNewRequestModal(false)}
          userRole={isAdmin ? 'admin' : 'employee'}
          user={user}
        />
      )}
    </div>
  )
}

export default TimeOff