import { useState, useEffect } from 'react'
import { Bell, Check, X, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLeaveRequests } from '../../contexts/LeaveRequestContext'

const EmployeeNotifications = () => {
  const { user, isAdmin } = useAuth()
  const { leaveRequests } = useLeaveRequests()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [viewedNotifications, setViewedNotifications] = useState(new Set())

  // Don't show for admin users
  if (isAdmin) {
    return null
  }

  // Get current user's name
  const currentUserName = user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.name || 'Unknown'

  // Get user's requests and create notifications
  useEffect(() => {
    const userRequests = leaveRequests.filter(req => req.employeeName === currentUserName)
    
    // Create notifications for status updates
    const newNotifications = userRequests
      .filter(req => req.status !== 'pending') // Only show completed requests
      .map(req => ({
        id: req.id,
        type: req.status,
        title: req.status === 'approved' ? 'Leave Request Approved' : 'Leave Request Rejected',
        message: req.status === 'approved' 
          ? `Your ${getLeaveTypeLabel(req.leaveType)} request for ${req.numberOfDays} day${req.numberOfDays !== 1 ? 's' : ''} has been approved.`
          : `Your ${getLeaveTypeLabel(req.leaveType)} request has been rejected. ${req.rejectionReason ? `Reason: ${req.rejectionReason}` : ''}`,
        date: req.status === 'approved' ? req.approvedAt : req.rejectedAt,
        leaveType: req.leaveType,
        fromDate: req.fromDate,
        toDate: req.toDate,
        numberOfDays: req.numberOfDays,
        rejectionReason: req.rejectionReason,
        isRead: viewedNotifications.has(req.id)
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Most recent first

    setNotifications(newNotifications)
    
    // Calculate unread count
    const unreadNotifications = newNotifications.filter(notif => !viewedNotifications.has(notif.id))
    setUnreadCount(unreadNotifications.length)
  }, [leaveRequests, currentUserName, viewedNotifications])

  // Mark notifications as read when dropdown is opened
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
    
    if (!showNotifications) {
      // Mark all notifications as read when opening
      const newViewedSet = new Set(viewedNotifications)
      notifications.forEach(notif => {
        newViewedSet.add(notif.id)
      })
      setViewedNotifications(newViewedSet)
      
      // Save to localStorage to persist across sessions
      localStorage.setItem('viewedNotifications', JSON.stringify([...newViewedSet]))
    }
  }

  // Load viewed notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('viewedNotifications')
    if (saved) {
      setViewedNotifications(new Set(JSON.parse(saved)))
    }
  }, [])

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

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getNotificationIcon = (type) => {
    if (type === 'approved') {
      return <Check className="h-5 w-5 text-green-600" />
    }
    if (type === 'rejected') {
      return <X className="h-5 w-5 text-red-600" />
    }
    return <Clock className="h-5 w-5 text-yellow-600" />
  }

  const getNotificationBgColor = (type, isRead) => {
    const baseColor = isRead ? 'opacity-60' : ''
    if (type === 'approved') return `bg-green-50 border-green-200 ${baseColor}`
    if (type === 'rejected') return `bg-red-50 border-red-200 ${baseColor}`
    return `bg-yellow-50 border-yellow-200 ${baseColor}`
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={handleNotificationClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
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
                Leave Updates ({notifications.length})
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
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <Bell className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600 font-medium">No notifications</p>
                <p className="text-sm text-gray-500">You'll see leave request updates here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${getNotificationBgColor(notification.type, notification.isRead)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-semibold ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                          {notification.title}
                          {!notification.isRead && (
                            <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.date)}
                        </span>
                      </div>
                      
                      <p className={`text-sm mb-2 ${notification.isRead ? 'text-gray-600' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="text-xs text-gray-600 bg-white bg-opacity-50 rounded p-2">
                        <p>
                          <strong>Dates:</strong> {formatDate(notification.fromDate)} - {formatDate(notification.toDate)}
                        </p>
                        <p>
                          <strong>Duration:</strong> {notification.numberOfDays} day{notification.numberOfDays !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Show rejection reason if rejected */}
                      {notification.type === 'rejected' && notification.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs">
                          <div className="flex items-start">
                            <AlertCircle className="h-3 w-3 text-red-600 mr-1 mt-0.5 flex-shrink-0" />
                            <span className="text-red-800">
                              <strong>Rejection Reason:</strong> {notification.rejectionReason}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600 text-center">
                Recent leave request updates will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EmployeeNotifications