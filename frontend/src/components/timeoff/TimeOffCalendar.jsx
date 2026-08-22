import { useState } from 'react'
import { ChevronLeft, ChevronRight, User } from 'lucide-react'

const TimeOffCalendar = ({ requests, userRole }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Generate calendar days
  const calendarDays = []
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Get time off requests for the current month
  const getTimeOffForDate = (day) => {
    if (!day) return []
    
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    return requests.filter(request => {
      const startDate = new Date(request.startDate)
      const endDate = new Date(request.endDate)
      const checkDate = new Date(dateStr)
      
      return checkDate >= startDate && checkDate <= endDate && request.status === 'approved'
    })
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const getTypeColor = (type) => {
    if (type === 'Paid Time Off') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (type === 'Sick Leave') return 'bg-green-100 text-green-800 border-green-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {months[currentMonth]} {currentYear}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Team Calendar View
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Paid Time Off</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Sick Leave</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
          <span className="text-gray-600">Other</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {daysOfWeek.map(day => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const timeOffRequests = getTimeOffForDate(day)
            const isToday = day && 
              day === new Date().getDate() && 
              currentMonth === new Date().getMonth() && 
              currentYear === new Date().getFullYear()

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-b border-r border-gray-200 ${
                  day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                }`}
              >
                {day && (
                  <>
                    {/* Day number */}
                    <div className={`text-sm font-medium mb-2 ${
                      isToday 
                        ? 'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center' 
                        : 'text-gray-900'
                    }`}>
                      {day}
                    </div>

                    {/* Time off requests for this day */}
                    <div className="space-y-1">
                      {timeOffRequests.slice(0, 3).map((request, reqIndex) => (
                        <div
                          key={reqIndex}
                          className={`text-xs p-1 rounded border ${getTypeColor(request.type)} truncate`}
                          title={`${request.employee} - ${request.type}`}
                        >
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{request.employee}</span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Show "more" indicator if there are additional requests */}
                      {timeOffRequests.length > 3 && (
                        <div className="text-xs text-gray-500 p-1">
                          +{timeOffRequests.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {requests.filter(r => {
                const date = new Date(r.startDate)
                return date.getMonth() === currentMonth && 
                       date.getFullYear() === currentYear && 
                       r.status === 'approved' && 
                       r.type === 'Paid Time Off'
              }).length}
            </div>
            <div className="text-sm text-gray-600">Paid Time Off Days</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {requests.filter(r => {
                const date = new Date(r.startDate)
                return date.getMonth() === currentMonth && 
                       date.getFullYear() === currentYear && 
                       r.status === 'approved' && 
                       r.type === 'Sick Leave'
              }).length}
            </div>
            <div className="text-sm text-gray-600">Sick Leave Days</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {requests.filter(r => {
                const date = new Date(r.startDate)
                return date.getMonth() === currentMonth && 
                       date.getFullYear() === currentYear && 
                       r.status === 'pending'
              }).length}
            </div>
            <div className="text-sm text-gray-600">Pending Requests</div>
          </div>
        </div>
      </div>

      {/* Team Members Currently Off */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Currently Off Today</h3>
        
        {(() => {
          const today = new Date().toISOString().split('T')[0]
          const todayRequests = requests.filter(request => {
            const startDate = new Date(request.startDate)
            const endDate = new Date(request.endDate)
            const checkDate = new Date(today)
            
            return checkDate >= startDate && 
                   checkDate <= endDate && 
                   request.status === 'approved'
          })

          if (todayRequests.length === 0) {
            return (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No team members are off today</p>
              </div>
            )
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayRequests.map((request, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {request.employee}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {request.type}
                    </p>
                    <p className="text-xs text-gray-400">
                      Until {new Date(request.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

export default TimeOffCalendar