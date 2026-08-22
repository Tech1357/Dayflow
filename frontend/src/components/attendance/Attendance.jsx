import { useState } from 'react'
import Header from '../layout/Header'
import AttendanceTable from './AttendanceTable'
import AttendanceStats from './AttendanceStats'
import { ChevronLeft, ChevronRight, Search, Filter, Download, Calendar } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useAttendance } from '../../contexts/AttendanceContext'
import { useEmployees } from '../../contexts/EmployeeContext'
import { useLeaveRequests } from '../../contexts/LeaveRequestContext'

const Attendance = () => {
  const { user, isAdmin } = useAuth()
  const { attendanceRecords, getAllAttendanceStats } = useAttendance()
  const { employees } = useEmployees()
  const { leaveRequests } = useLeaveRequests()
  const [selectedMonth, setSelectedMonth] = useState(7) // August (0-indexed)
  const [selectedYear, setSelectedYear] = useState(2026)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [view, setView] = useState(isAdmin ? 'admin' : 'employee')

  if (!user) {
    return <div>Loading...</div>
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Get employee names for dropdown
  const employeeOptions = ['All Employees', ...employees.map(emp => emp.name)]

  // Get current user's name
  const currentUserName = user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.name || 'Unknown'

  // Create virtual attendance records for approved leave dates
  const createLeaveAttendanceRecords = () => {
    const leaveRecords = []
    const approvedLeaves = leaveRequests.filter(req => req.status === 'approved')
    
    approvedLeaves.forEach(leave => {
      const fromDate = new Date(leave.fromDate)
      const toDate = new Date(leave.toDate)
      
      // Generate records for each day of the leave
      for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
        const recordDate = new Date(d)
        
        // Only create records for the current month/year
        if (recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear) {
          leaveRecords.push({
            id: `leave-${leave.id}-${recordDate.toISOString().split('T')[0]}`,
            date: recordDate.toISOString().split('T')[0],
            day: recordDate.toLocaleDateString('en-US', { weekday: 'long' }),
            employeeName: leave.employeeName,
            checkIn: '--',
            checkOut: '--',
            workHours: '--',
            extraHours: '--',
            status: 'leave',
            leaveType: leave.leaveType,
            leaveReason: leave.reason
          })
        }
      }
    })
    
    return leaveRecords
  }

  // Add day field to existing attendance records and format them properly
  const formattedAttendanceRecords = attendanceRecords
    .filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear
    })
    .map(record => ({
      ...record,
      day: new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' }),
      checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }) : '--',
      checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }) : '--',
      workHours: record.hoursWorked ? `${Math.floor(record.hoursWorked)}:${Math.round((record.hoursWorked % 1) * 60).toString().padStart(2, '0')}` : '--',
      extraHours: record.hoursWorked > 8 ? `${Math.floor(record.hoursWorked - 8)}:${Math.round(((record.hoursWorked - 8) % 1) * 60).toString().padStart(2, '0')}` : '0:00'
    }))

  // Combine actual attendance records with leave records
  const allAttendanceData = [
    ...formattedAttendanceRecords,
    ...createLeaveAttendanceRecords()
  ]

  // Remove duplicates (if someone checked in on a leave day, keep the actual record)
  const uniqueAttendanceData = allAttendanceData.reduce((acc, current) => {
    const existing = acc.find(item => 
      item.date === current.date && 
      item.employeeName === current.employeeName
    )
    
    if (!existing) {
      acc.push(current)
    } else if (current.status !== 'leave') {
      // If we have both a leave record and actual attendance, keep the actual attendance
      const index = acc.findIndex(item => 
        item.date === current.date && 
        item.employeeName === current.employeeName
      )
      acc[index] = current
    }
    
    return acc
  }, [])

  // Filter attendance data based on user role and selections
  const filteredAttendanceData = uniqueAttendanceData.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEmployee = selectedEmployee === 'all' || selectedEmployee === 'All Employees' || record.employeeName === selectedEmployee
    const matchesUser = isAdmin || record.employeeName === currentUserName
    
    return matchesSearch && matchesEmployee && matchesUser
  })

  // Calculate stats for the current view
  const calculateStats = () => {
    const currentMonth = selectedMonth
    const currentYear = selectedYear
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    // Get approved leave requests for the month
    const getApprovedLeaveForMonth = (employeeName) => {
      const approvedLeaves = leaveRequests.filter(req => 
        req.status === 'approved' && 
        req.employeeName === employeeName
      )
      
      let leaveDaysInMonth = 0
      approvedLeaves.forEach(leave => {
        const fromDate = new Date(leave.fromDate)
        const toDate = new Date(leave.toDate)
        
        // Check if leave overlaps with current month
        const monthStart = new Date(currentYear, currentMonth, 1)
        const monthEnd = new Date(currentYear, currentMonth + 1, 0)
        
        if (fromDate <= monthEnd && toDate >= monthStart) {
          // Calculate overlapping days
          const overlapStart = new Date(Math.max(fromDate.getTime(), monthStart.getTime()))
          const overlapEnd = new Date(Math.min(toDate.getTime(), monthEnd.getTime()))
          const daysDiff = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1
          leaveDaysInMonth += daysDiff
        }
      })
      
      return leaveDaysInMonth
    }
    
    if (isAdmin && view === 'admin') {
      // Admin view - aggregate stats for all employees
      const allRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
      })
      
      // Calculate total leave days for all employees
      const totalLeaveDays = employees.reduce((total, emp) => {
        return total + getApprovedLeaveForMonth(emp.name)
      }, 0)
      
      const presentDays = allRecords.filter(r => r.status === 'present').length
      const totalPossibleDays = employees.length * daysInMonth
      const absentDays = Math.max(0, totalPossibleDays - presentDays - totalLeaveDays)
      
      return {
        totalWorkingDays: daysInMonth,
        presentDays,
        leaveDays: totalLeaveDays,
        absentDays
      }
    } else {
      // Employee view - individual stats
      const userRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date)
        return record.employeeName === currentUserName && 
               recordDate.getMonth() === currentMonth && 
               recordDate.getFullYear() === currentYear
      })
      
      const leaveDays = getApprovedLeaveForMonth(currentUserName)
      const presentDays = userRecords.filter(r => r.status === 'present').length
      const absentDays = Math.max(0, daysInMonth - presentDays - leaveDays)
      
      return {
        totalWorkingDays: daysInMonth,
        presentDays,
        leaveDays,
        absentDays
      }
    }
  }

  const stats = calculateStats()

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isAdmin ? 'Attendance Management' : 'My Attendance'}
            </h1>
            <p className="text-gray-600">
              {isAdmin 
                ? 'Track and manage employee attendance records' 
                : 'View your attendance history and manage check-in/check-out'
              }
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Month/Year Navigation */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-medium text-gray-900">
                    {months[selectedMonth]} {selectedYear}
                  </h2>
                </div>

                <button
                  onClick={handleNextMonth}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search attendance..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Employee Filter - Only show for admin */}
                {isAdmin && (
                  <div className="flex items-center space-x-2">
                    <Filter className="text-gray-400 h-4 w-4" />
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {employeeOptions.map(employee => (
                        <option key={employee} value={employee === 'All Employees' ? 'all' : employee}>
                          {employee}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* View Toggle for Admin */}
            {isAdmin && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">View:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setView('admin')}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        view === 'admin'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Team View
                    </button>
                    <button
                      onClick={() => setView('employee')}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        view === 'employee'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Personal View
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <AttendanceStats 
            totalWorkingDays={stats.totalWorkingDays}
            presentDays={stats.presentDays}
            leaveDays={stats.leaveDays}
            absentDays={stats.absentDays}
            userRole={isAdmin ? 'admin' : 'employee'}
            view={view}
          />

          {/* Attendance Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Attendance Records
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {months[selectedMonth]} {selectedYear} • {filteredAttendanceData.length} records
              </p>
            </div>

            <AttendanceTable 
              data={filteredAttendanceData}
              userRole={isAdmin ? 'admin' : 'employee'}
              view={view}
            />
          </div>

          {/* Empty State */}
          {filteredAttendanceData.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-12">
              <div className="text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  {searchTerm || selectedEmployee !== 'all'
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                    : isAdmin
                    ? 'No attendance records have been recorded for this period yet.'
                    : 'You haven\'t recorded any attendance for this period yet. Use the Quick Actions to check in.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Attendance