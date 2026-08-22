import { Calendar, CheckCircle, XCircle, Plane, Clock, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAttendance } from '../../contexts/AttendanceContext'
import { useAuth } from '../../contexts/AuthContext'

const AttendanceStats = ({ totalWorkingDays, presentDays, leaveDays, absentDays, userRole, view }) => {
  const navigate = useNavigate()
  const { checkIn, checkOut, getTodayAttendance } = useAttendance()
  const { user } = useAuth()
  
  const attendanceRate = totalWorkingDays > 0 ? ((presentDays / totalWorkingDays) * 100).toFixed(1) : 0
  
  // Get current user's name for attendance operations
  const currentUserName = user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.name || 'Unknown'
  
  // Get today's attendance status
  const todayAttendance = getTodayAttendance(currentUserName)
  const hasCheckedIn = todayAttendance && todayAttendance.checkIn
  const hasCheckedOut = todayAttendance && todayAttendance.checkOut

  const handleCheckIn = async () => {
    if (hasCheckedIn) {
      alert('You have already checked in today!')
      return
    }
    
    const result = await checkIn(currentUserName)
    if (result.success) {
      alert('✅ ' + result.message)
      // Optionally refresh the page or update the UI
      window.location.reload()
    } else {
      alert('❌ ' + result.message)
    }
  }

  const handleCheckOut = async () => {
    if (!hasCheckedIn) {
      alert('You need to check in first!')
      return
    }
    
    if (hasCheckedOut) {
      alert('You have already checked out today!')
      return
    }
    
    const result = await checkOut(currentUserName)
    if (result.success) {
      alert('✅ ' + result.message)
      // Optionally refresh the page or update the UI
      window.location.reload()
    } else {
      alert('❌ ' + result.message)
    }
  }

  const handleRequestTimeOff = () => {
    navigate('/timeoff')
  }

  const stats = [
    {
      id: 'working-days',
      label: 'Total Working Days',
      value: totalWorkingDays,
      icon: Calendar,
      color: 'bg-gray-50 text-gray-600 border-gray-200',
      iconColor: 'text-gray-500'
    },
    {
      id: 'present',
      label: 'Present Days',
      value: presentDays,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600 border-green-200',
      iconColor: 'text-green-500'
    },
    {
      id: 'leave',
      label: 'Leave Days',
      value: leaveDays,
      icon: Plane,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      iconColor: 'text-blue-500'
    },
    {
      id: 'absent',
      label: 'Absent Days',
      value: absentDays,
      icon: XCircle,
      color: 'bg-red-50 text-red-600 border-red-200',
      iconColor: 'text-red-500'
    }
  ]

  // Add attendance rate for individual employee view
  if (view === 'employee' || userRole === 'employee') {
    stats.push({
      id: 'attendance-rate',
      label: 'Attendance Rate',
      value: `${attendanceRate}%`,
      icon: TrendingUp,
      color: attendanceRate >= 90 
        ? 'bg-green-50 text-green-600 border-green-200'
        : attendanceRate >= 80 
        ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
        : 'bg-red-50 text-red-600 border-red-200',
      iconColor: attendanceRate >= 90 
        ? 'text-green-500'
        : attendanceRate >= 80 
        ? 'text-yellow-500'
        : 'text-red-500'
    })
  }

  return (
    <div className="mb-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon
          return (
            <div
              key={stat.id}
              className={`bg-white rounded-lg border p-6 ${stat.color}`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color.replace('text-', 'bg-').replace('border-', 'bg-').replace('-50', '-100').replace('-600', '-500')}`}>
                  <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Stats for Admin View */}
      {userRole === 'admin' && view === 'admin' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Attendance Summary Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Attendance Distribution</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Present</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {presentDays} ({totalWorkingDays > 0 ? ((presentDays / totalWorkingDays) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">On Leave</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {leaveDays} ({totalWorkingDays > 0 ? ((leaveDays / totalWorkingDays) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Absent</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {absentDays} ({totalWorkingDays > 0 ? ((absentDays / totalWorkingDays) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Average Work Hours */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Average Work Hours</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Daily Average</span>
                  <span className="text-sm font-medium text-gray-900">8.2 hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Weekly Average</span>
                  <span className="text-sm font-medium text-gray-900">41.0 hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overtime Hours</span>
                  <span className="text-sm font-medium text-orange-600">12.5 hrs</span>
                </div>
              </div>
            </div>

            {/* Trends */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Trends</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">vs Last Month</span>
                  <span className="text-sm font-medium text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5.2%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Late Arrivals</span>
                  <span className="text-sm font-medium text-gray-900">3 incidents</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Early Departures</span>
                  <span className="text-sm font-medium text-gray-900">1 incident</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Stats for Employee View */}
      {(userRole === 'employee' || view === 'employee') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Monthly Performance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendance Progress */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Attendance Goal</h4>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      Target: 95%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {attendanceRate}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div 
                    style={{width: `${Math.min(attendanceRate, 100)}%`}}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-xs text-gray-600">
                  {attendanceRate >= 95 
                    ? "🎉 Excellent attendance! Keep up the great work."
                    : attendanceRate >= 90
                    ? "👍 Good attendance. Try to maintain consistency."
                    : "⚠️ Below target. Consider improving your attendance."
                  }
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button 
                  onClick={handleCheckIn}
                  disabled={hasCheckedIn}
                  className={`w-full text-left px-3 py-2 bg-white rounded-md border transition-colors ${
                    hasCheckedIn 
                      ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : 'border-gray-200 hover:bg-green-50 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className={`h-4 w-4 mr-2 ${hasCheckedIn ? 'text-gray-400' : 'text-green-500'}`} />
                      <span className="text-sm text-gray-700">
                        {hasCheckedIn ? 'Already Checked In' : 'Check In Now'}
                      </span>
                    </div>
                    {hasCheckedIn && (
                      <span className="text-xs text-green-600 font-medium">
                        {todayAttendance ? new Date(todayAttendance.checkIn).toLocaleTimeString() : ''}
                      </span>
                    )}
                  </div>
                </button>

                <button 
                  onClick={handleCheckOut}
                  disabled={!hasCheckedIn || hasCheckedOut}
                  className={`w-full text-left px-3 py-2 bg-white rounded-md border transition-colors ${
                    !hasCheckedIn || hasCheckedOut
                      ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : 'border-gray-200 hover:bg-red-50 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className={`h-4 w-4 mr-2 ${
                        !hasCheckedIn || hasCheckedOut ? 'text-gray-400' : 'text-red-500'
                      }`} />
                      <span className="text-sm text-gray-700">
                        {!hasCheckedIn 
                          ? 'Check In First' 
                          : hasCheckedOut 
                          ? 'Already Checked Out' 
                          : 'Check Out Now'
                        }
                      </span>
                    </div>
                    {hasCheckedOut && (
                      <span className="text-xs text-red-600 font-medium">
                        {todayAttendance ? new Date(todayAttendance.checkOut).toLocaleTimeString() : ''}
                      </span>
                    )}
                  </div>
                </button>

                <button 
                  onClick={handleRequestTimeOff}
                  className="w-full text-left px-3 py-2 bg-white rounded-md border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-700">Request Time Off</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceStats