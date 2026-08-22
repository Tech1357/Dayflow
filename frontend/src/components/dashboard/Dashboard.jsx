import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../layout/Header'
import { Search, Filter, Users, UserCheck, UserX, Plane, User, Calendar, FileText, LogOut, Clock, CheckCircle, AlertCircle, Bell, DollarSign } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useEmployees } from '../../contexts/EmployeeContext'
import { useLeaveRequests } from '../../contexts/LeaveRequestContext'

const Dashboard = () => {
  const { user, isAdmin, logout } = useAuth()
  const { employees, getStatusCounts, getDepartmentCounts } = useEmployees()
  const { leaveRequests, getPendingRequests } = useLeaveRequests()
  const navigate = useNavigate()

  if (!user) {
    return <div>Loading...</div>
  }

  // Get dynamic data
  const statusCounts = getStatusCounts()
  const departmentCounts = getDepartmentCounts()
  const pendingLeaveRequests = getPendingRequests()

  // Convert department counts to array for display
  const departmentData = Object.entries(departmentCounts).map(([name, count]) => ({
    name,
    count,
    color: getDepartmentColor(name)
  }))

  function getDepartmentColor(deptName) {
    const colors = {
      'Engineering': 'bg-blue-500',
      'Product': 'bg-purple-500', 
      'Design': 'bg-green-500',
      'Human Resources': 'bg-yellow-500',
      'Sales': 'bg-red-500',
      'Marketing': 'bg-pink-500',
      'Analytics': 'bg-indigo-500',
      'HR': 'bg-yellow-500'
    }
    return colors[deptName] || 'bg-gray-500'
  }

  // Mock recent activity data
  const recentActivity = [
    {
      id: 1,
      type: 'attendance',
      message: 'You checked in at 9:15 AM',
      time: '2 hours ago',
      icon: Clock,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 2,
      type: 'leave',
      message: leaveRequests.length > 0 ? 'Leave request submitted' : 'No recent leave activity',
      time: leaveRequests.length > 0 ? '1 day ago' : 'N/A',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 3,
      type: 'system',
      message: 'Profile updated successfully',
      time: '3 days ago',
      icon: User,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  // Employee Dashboard Component
  const EmployeeDashboard = () => (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.employee ? `${user.employee.firstName}!` : 'User!'}
        </h1>
        <p className="text-gray-600">
          Here's an overview of your HR information and recent activity.
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button
          onClick={() => navigate('/profile')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Profile</h3>
            <p className="text-sm text-gray-600">View & edit profile</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/attendance')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Attendance</h3>
            <p className="text-sm text-gray-600">Check in/out & history</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/timeoff')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-purple-100 rounded-full mb-4 group-hover:bg-purple-200 transition-colors">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Leave Requests</h3>
            <p className="text-sm text-gray-600">Submit & track requests</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/payroll')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Payroll</h3>
            <p className="text-sm text-gray-600">View salary details</p>
          </div>
        </button>
      </div>

      {/* Logout Section */}
      <div className="mb-8">
        <button
          onClick={() => logout()}
          className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </button>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const IconComponent = activity.icon
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>

        {recentActivity.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No recent activity to display</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 sm:p-6 lg:p-8">
        {isAdmin ? <AdminDashboard /> : <EmployeeDashboard />}
      </main>
    </div>
  )

  // Admin Dashboard Component  
  function AdminDashboard() {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Overview of company statistics, pending approvals, and system insights
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
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
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-xl font-bold text-green-600">{statusCounts.present}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-xl font-bold text-orange-600">{pendingLeaveRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plane className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-xl font-bold text-blue-600">{statusCounts.leave}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Recent Activity Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">System Activity</h3>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{statusCounts.present} employees checked in today</p>
                  <p className="text-xs text-gray-500 mt-1">Current attendance rate: {statusCounts.total > 0 ? Math.round((statusCounts.present / statusCounts.total) * 100) : 0}%</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-50">
                <div className="p-2 rounded-lg bg-orange-100">
                  <FileText className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{pendingLeaveRequests.length} new leave requests</p>
                  <p className="text-xs text-gray-500 mt-1">{pendingLeaveRequests.length > 0 ? 'Awaiting your approval' : 'All requests processed'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{leaveRequests.filter(req => req.status !== 'pending').length} requests processed</p>
                  <p className="text-xs text-gray-500 mt-1">This week</p>
                </div>
              </div>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Department Overview</h3>
            
            <div className="space-y-4">
              {departmentData.length > 0 ? (
                departmentData.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                      <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{dept.count} employee{dept.count !== 1 ? 's' : ''}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No employees added yet</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button 
                onClick={() => navigate('/employees')}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All Employees →
              </button>
            </div>
          </div>

          {/* Leave Requests Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Pending Leave Requests</h3>
              <button 
                onClick={() => navigate('/timeoff')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {pendingLeaveRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{request.employeeName}</h4>
                      <p className="text-xs text-gray-600">{request.leaveType}</p>
                    </div>
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    {new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-green-600 text-white text-xs px-3 py-2 rounded hover:bg-green-700 transition-colors font-medium">
                      Approve
                    </button>
                    <button className="flex-1 bg-red-600 text-white text-xs px-3 py-2 rounded hover:bg-red-700 transition-colors font-medium">
                      Reject
                    </button>
                  </div>
                </div>
              ))}

              {pendingLeaveRequests.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No pending requests</p>
                  <p className="text-xs text-gray-500">All caught up!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => navigate('/employees')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Manage Employees</p>
                  <p className="text-xs text-gray-600">View and manage all employees</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/attendance')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Attendance Records</p>
                  <p className="text-xs text-gray-600">View team attendance data</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/timeoff')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Leave Management</p>
                  <p className="text-xs text-gray-600">Manage all leave requests</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/payroll')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Payroll Overview</p>
                  <p className="text-xs text-gray-600">Review payroll information</p>
                </div>
              </button>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Today's Attendance</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Present</span>
                </div>
                <span className="text-lg font-bold text-green-600">{statusCounts.present}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Plane className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">On Leave</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{statusCounts.leave}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <UserX className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-900">Absent</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{statusCounts.absent}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Attendance Rate: <span className="font-semibold text-gray-900">
                    {statusCounts.total > 0 ? Math.round((statusCounts.present / statusCounts.total) * 100) : 0}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Dashboard