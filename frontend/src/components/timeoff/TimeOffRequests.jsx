import { useState } from 'react'
import { Check, X, Clock, User, Calendar, Filter, Search } from 'lucide-react'

const TimeOffRequests = ({ requests, userRole, onRequestSelect }) => {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    }

    const icons = {
      approved: <Check className="h-3 w-3 mr-1" />,
      pending: <Clock className="h-3 w-3 mr-1" />,
      rejected: <X className="h-3 w-3 mr-1" />
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const handleApprove = (requestId) => {
    console.log('Approving request:', requestId)
    // In real app, this would make an API call
  }

  const handleReject = (requestId) => {
    console.log('Rejecting request:', requestId)
    // In real app, this would make an API call
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (startDate === endDate) {
      return start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
    
    return `${start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`
  }

  const getLeaveTypeColor = (type) => {
    const colors = {
      paid: 'text-green-600 bg-green-50',
      sick: 'text-red-600 bg-red-50',
      unpaid: 'text-gray-600 bg-gray-50',
      maternity: 'text-pink-600 bg-pink-50',
      paternity: 'text-blue-600 bg-blue-50',
      bereavement: 'text-purple-600 bg-purple-50',
      emergency: 'text-orange-600 bg-orange-50'
    }
    return colors[type] || 'text-gray-600 bg-gray-50'
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

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={userRole === 'admin' ? 'Search requests...' : 'Search your requests...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 h-4 w-4" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {userRole === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Off Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {userRole === 'admin' && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request, index) => (
                <tr key={request.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {/* Employee - Only show for admin */}
                  {userRole === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {request.employeeName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Requested {new Date(request.requestDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Start Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {new Date(request.fromDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </td>

                  {/* End Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {new Date(request.toDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      <span className="ml-2 text-xs text-gray-500">
                        ({request.numberOfDays} day{request.numberOfDays !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </td>

                  {/* Time Off Type */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.leaveType)}`}>
                      {getLeaveTypeLabel(request.leaveType)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadge(request.status)}
                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="text-xs text-red-600">
                          {request.rejectionReason}
                        </div>
                      )}
                      {request.status === 'approved' && request.approverName && (
                        <div className="text-xs text-gray-500">
                          Approved by {request.approverName}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions - Only show for admin and pending requests */}
                  {userRole === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {request.status === 'pending' && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <span className="text-gray-400 text-xs">No actions</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredRequests.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}</span>
              <div className="flex space-x-4">
                <span>Pending: {filteredRequests.filter(r => r.status === 'pending').length}</span>
                <span>Approved: {filteredRequests.filter(r => r.status === 'approved').length}</span>
                <span>Rejected: {filteredRequests.filter(r => r.status === 'rejected').length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No time off requests found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search terms or filters'
              : userRole === 'admin'
              ? 'No time off requests have been submitted yet'
              : 'You haven\'t submitted any time off requests yet'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default TimeOffRequests