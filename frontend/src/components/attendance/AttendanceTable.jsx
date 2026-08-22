import { Clock, User, CheckCircle, XCircle, Plane } from 'lucide-react'

const AttendanceTable = ({ data, userRole, view }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'leave':
        return <Plane className="h-4 w-4 text-blue-500" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      leave: 'bg-blue-100 text-blue-800'
    }

    const labels = {
      present: 'Present',
      absent: 'Absent',
      leave: 'On Leave'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status]}</span>
      </span>
    )
  }

  const formatTime = (time) => {
    if (time === '--' || time === 'On Leave') return time
    return time
  }

  // Show different columns based on view and role
  const showEmployeeColumn = userRole === 'admin' && view === 'admin'

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Day
            </th>
            {showEmployeeColumn && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check In
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check Out
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Work Hours
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Extra Hours
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((record, index) => (
            <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {/* Date */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div className="font-medium">
                    {new Date(record.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-gray-500">
                    {new Date(record.date).getFullYear()}
                  </div>
                </div>
              </td>

              {/* Day */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.day}
              </td>

              {/* Employee - Only show in admin view */}
              {showEmployeeColumn && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {record.employeeName}
                      </div>
                    </div>
                  </div>
                </td>
              )}

              {/* Check In */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  {record.checkIn !== '--' && record.checkIn !== 'On Leave' && (
                    <Clock className="h-4 w-4 text-green-500 mr-2" />
                  )}
                  <span className={record.checkIn === '--' || record.checkIn === 'On Leave' ? 'text-gray-400' : 'font-medium'}>
                    {formatTime(record.checkIn)}
                  </span>
                </div>
              </td>

              {/* Check Out */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  {record.checkOut !== '--' && record.checkOut !== 'On Leave' && (
                    <Clock className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className={record.checkOut === '--' || record.checkOut === 'On Leave' ? 'text-gray-400' : 'font-medium'}>
                    {formatTime(record.checkOut)}
                  </span>
                </div>
              </td>

              {/* Work Hours */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  {record.workHours !== '--' && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="font-medium">{record.workHours}</span>
                    </div>
                  )}
                  {record.workHours === '--' && (
                    <span className="text-gray-400">--</span>
                  )}
                </div>
              </td>

              {/* Extra Hours */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  {record.extraHours !== '--' && record.extraHours !== '0:00' && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      <span className="font-medium text-orange-600">{record.extraHours}</span>
                    </div>
                  )}
                  {(record.extraHours === '--' || record.extraHours === '0:00') && (
                    <span className="text-gray-400">--</span>
                  )}
                </div>
              </td>

              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  {getStatusBadge(record.status)}
                  {record.status === 'leave' && record.leaveType && (
                    <div className="text-xs text-gray-500 mt-1">
                      {record.leaveType}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table Footer Summary */}
      {data.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Showing {data.length} records</span>
            <div className="flex space-x-4">
              <span>Present: {data.filter(r => r.status === 'present').length}</span>
              <span>Absent: {data.filter(r => r.status === 'absent').length}</span>
              <span>On Leave: {data.filter(r => r.status === 'leave').length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceTable