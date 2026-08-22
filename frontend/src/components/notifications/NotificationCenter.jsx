import { useState, useEffect } from 'react'
import { Bell, Check, X, Clock, User, Calendar, MessageSquare } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const NotificationCenter = ({ leaveRequests = [], onApproveRequest, onRejectRequest }) => {
  const { isAdmin } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [showRejectionModal, setShowRejectionModal] = useState(false)

  // Filter pending requests for admin
  const pendingRequests = leaveRequests.filter(req => req.status === 'pending')
  const notificationCount = pendingRequests.length

  const handleApprove = async (request) => {
    try {
      await onApproveRequest(request.id)
      // Show success notification to admin
      alert(`✅ Leave request from ${request.employeeName} has been approved successfully!`)
    } catch (error) {
      alert('Error approving request. Please try again.')
    }
  }

  const handleRejectClick = (request) => {
    setSelectedRequestId(request.id)
    setShowRejectionModal(true)
  }

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      await onRejectRequest(selectedRequestId, rejectionReason.trim())
      
      // Show success notification to admin
      const request = leaveRequests.find(req => req.id === selectedRequestId)
      alert(`❌ Leave request from ${request?.employeeName} has been rejected.`)
      
      // Reset state
      setShowRejectionModal(false)
      setSelectedRequestId(null)
      setRejectionReason('')
    } catch (error) {
      alert('Error rejecting request. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getLeaveTypeColor = (type) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      sick: 'bg-red-100 text-red-800',
      unpaid: 'bg-gray-100 text-gray-800',
      maternity: 'bg-pink-100 text-pink-800',
      paternity: 'bg-blue-100 text-blue-800',
      bereavement: 'bg-purple-100 text-purple-800',
      emergency: 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getLeaveTypeLabel = (type) => {
    const labels = {
      paid: 'Paid Leave',
      sick: 'Sick Leave',
      unpaid: 'Unpaid Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      bereavement: 'Bereavement Leave',
      emergency: 'Emergency Leave'
    }
    return labels[type] || type
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Leave Requests ({notificationCount})
              </h3>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <Bell className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600 font-medium">No pending requests</p>
                <p className="text-sm text-gray-500">All leave requests have been processed</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{request.employeeName}</h4>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          Submitted {formatDate(request.requestDate)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.leaveType)}`}>
                      {getLeaveTypeLabel(request.leaveType)}
                    </span>
                  </div>

                  <div className="ml-12 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {formatDate(request.fromDate)} - {formatDate(request.toDate)} 
                        ({request.numberOfDays} {request.numberOfDays === 1 ? 'day' : 'days'})
                      </span>
                    </div>

                    <div className="flex items-start text-sm text-gray-600">
                      <MessageSquare className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="line-clamp-2">{request.reason}</p>
                    </div>

                    {request.document && (
                      <div className="text-xs text-blue-600">
                        📎 Document attached
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleApprove(request)}
                        className="flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectClick(request)}
                        className="flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Reject Leave Request</h2>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this leave request. This will be communicated to the employee.
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Enter rejection reason..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              />
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectionReason.trim()}
                  className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${
                    rejectionReason.trim()
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter