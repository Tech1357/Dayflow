import { User, Mail, MapPin, Plane } from 'lucide-react'

const EmployeeCard = ({ employee, onClick, userRole, isSelected = false }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      case 'leave':
        return <Plane className="w-3 h-3 text-blue-500" />
      case 'absent':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'present':
        return { text: 'Present', color: 'text-green-600 bg-green-50 border-green-200' }
      case 'leave':
        return { text: 'On Leave', color: 'text-blue-600 bg-blue-50 border-blue-200' }
      case 'absent':
        return { text: 'Absent', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
      default:
        return { text: 'Unknown', color: 'text-gray-600 bg-gray-50 border-gray-200' }
    }
  }

  const statusInfo = getStatusText(employee.status)

  return (
    <div 
      className={`bg-white rounded-xl shadow-card border transition-all duration-200 cursor-pointer card-hover animate-fade-in p-6 ${
        isSelected 
          ? 'border-primary-500 ring-2 ring-primary-200 shadow-card-hover' 
          : 'border-gray-200 hover:shadow-card-hover'
      }`}
      onClick={onClick}
    >
      {/* Profile Picture and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-soft">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          {/* Status indicator overlay */}
          <div className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-medium border-2 border-white">
            {getStatusIcon(employee.status)}
          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>

      {/* Employee Information */}
      <div className="space-y-3">
        {/* Name and Position */}
        <div>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight truncate">
            {employee.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1 truncate">
            {employee.position}
          </p>
        </div>

        {/* Department */}
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span className="truncate">{employee.department}</span>
        </div>

        {/* Email - Only show to admin or if it's the employee's own card */}
        {(userRole === 'admin' || employee.id === 1) && (
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>
        )}

        {/* Additional Info for Admin */}
        {userRole === 'admin' && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Employee ID</span>
              <span className="font-medium">#{employee.id.toString().padStart(4, '0')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Hint - Hidden on mobile */}
      <div className="mt-4 text-center hidden sm:block">
        <span className="text-xs text-gray-400">
          {userRole === 'admin' ? 'Click to inspect details' : 'Click to view profile'}
        </span>
      </div>

      {/* Mobile tap hint */}
      <div className="mt-3 sm:hidden">
        <div className="w-full h-1 bg-gradient-to-r from-primary-200 via-primary-300 to-primary-200 rounded-full"></div>
      </div>
    </div>
  )
}

export default EmployeeCard