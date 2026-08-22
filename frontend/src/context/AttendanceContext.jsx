import { createContext, useContext, useState } from 'react'

const AttendanceContext = createContext()

export const useAttendance = () => {
  const context = useContext(AttendanceContext)
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider')
  }
  return context
}

export const AttendanceProvider = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([
    // Sample data for testing - Updated to August 2026 to match current view
    {
      id: 1,
      employeeName: 'John Doe',
      date: '2026-08-19',
      checkIn: '2026-08-19T09:00:00Z',
      checkOut: '2026-08-19T17:30:00Z',
      status: 'present',
      hoursWorked: 8.5,
      createdAt: '2026-08-19T09:00:00Z'
    },
    {
      id: 2,
      employeeName: 'Jane Smith',
      date: '2026-08-19',
      checkIn: '2026-08-19T08:45:00Z',
      checkOut: '2026-08-19T17:15:00Z',
      status: 'present',
      hoursWorked: 8.5,
      createdAt: '2026-08-19T08:45:00Z'
    },
    {
      id: 3,
      employeeName: 'John Doe',
      date: '2026-08-18',
      checkIn: '2026-08-18T09:15:00Z',
      checkOut: '2026-08-18T18:00:00Z',
      status: 'present',
      hoursWorked: 8.75,
      createdAt: '2026-08-18T09:15:00Z'
    },
    {
      id: 4,
      employeeName: 'John Doe',
      date: '2026-08-17',
      checkIn: '2026-08-17T08:50:00Z',
      checkOut: '2026-08-17T17:20:00Z',
      status: 'present',
      hoursWorked: 8.5,
      createdAt: '2026-08-17T08:50:00Z'
    },
    {
      id: 5,
      employeeName: 'John Doe',
      date: '2026-08-16',
      checkIn: '2026-08-16T09:05:00Z',
      checkOut: '2026-08-16T17:35:00Z',
      status: 'present',
      hoursWorked: 8.5,
      createdAt: '2026-08-16T09:05:00Z'
    },
    {
      id: 6,
      employeeName: 'John Doe',
      date: '2026-08-14',
      checkIn: '2026-08-14T08:55:00Z',
      checkOut: '2026-08-14T17:25:00Z',
      status: 'present',
      hoursWorked: 8.5,
      createdAt: '2026-08-14T08:55:00Z'
    },
    {
      id: 7,
      employeeName: 'John Doe',
      date: '2026-08-13',
      checkIn: '2026-08-13T09:10:00Z',
      checkOut: '2026-08-13T17:40:00Z',
      status: 'present',
      hoursWorked: 8.5,
      createdAt: '2026-08-13T09:10:00Z'
    },
    {
      id: 8,
      employeeName: 'John Doe',
      date: '2026-08-12',
      checkIn: '2026-08-12T09:00:00Z',
      checkOut: '2026-08-12T17:30:00Z',
      status: 'present',
      hoursWorked: 8.5,
      createdAt: '2026-08-12T09:00:00Z'
    }
  ])
  const [loading, setLoading] = useState(false)

  const checkIn = async (employeeName) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toISOString()
      
      // Check if already checked in today
      const existingRecord = attendanceRecords.find(
        record => record.employeeName === employeeName && record.date === today
      )
      
      if (existingRecord) {
        return { success: false, message: 'Already checked in today' }
      }

      const newRecord = {
        id: Date.now(),
        employeeName,
        date: today,
        checkIn: now,
        checkOut: null,
        status: 'present',
        hoursWorked: 0,
        createdAt: now
      }
      
      setAttendanceRecords(prev => [newRecord, ...prev])
      return { success: true, message: 'Checked in successfully!' }
    } catch (error) {
      console.error('Error checking in:', error)
      return { success: false, message: 'Failed to check in' }
    } finally {
      setLoading(false)
    }
  }

  const checkOut = async (employeeName) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toISOString()
      
      const recordIndex = attendanceRecords.findIndex(
        record => record.employeeName === employeeName && 
                 record.date === today && 
                 !record.checkOut
      )
      
      if (recordIndex === -1) {
        return { success: false, message: 'No check-in found for today' }
      }

      const updatedRecords = [...attendanceRecords]
      const record = updatedRecords[recordIndex]
      
      // Calculate hours worked
      const checkInTime = new Date(record.checkIn)
      const checkOutTime = new Date(now)
      const hoursWorked = Math.round((checkOutTime - checkInTime) / (1000 * 60 * 60) * 100) / 100
      
      updatedRecords[recordIndex] = {
        ...record,
        checkOut: now,
        hoursWorked,
        updatedAt: now
      }
      
      setAttendanceRecords(updatedRecords)
      return { success: true, message: `Checked out successfully! Hours worked: ${hoursWorked}` }
    } catch (error) {
      console.error('Error checking out:', error)
      return { success: false, message: 'Failed to check out' }
    } finally {
      setLoading(false)
    }
  }

  const getTodayAttendance = (employeeName) => {
    const today = new Date().toISOString().split('T')[0]
    return attendanceRecords.find(
      record => record.employeeName === employeeName && record.date === today
    )
  }

  const getAttendanceByEmployee = (employeeName) => {
    return attendanceRecords
      .filter(record => record.employeeName === employeeName)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const getAttendanceByDate = (date) => {
    return attendanceRecords.filter(record => record.date === date)
  }

  const getAttendanceStats = (employeeName) => {
    const employeeRecords = getAttendanceByEmployee(employeeName)
    const totalDays = employeeRecords.length
    const totalHours = employeeRecords.reduce((sum, record) => sum + (record.hoursWorked || 0), 0)
    const avgHours = totalDays > 0 ? Math.round((totalHours / totalDays) * 100) / 100 : 0
    
    return {
      totalDays,
      totalHours: Math.round(totalHours * 100) / 100,
      avgHours,
      presentDays: employeeRecords.filter(r => r.status === 'present').length
    }
  }

  const createLeaveAttendanceRecord = async (leaveRequest) => {
    try {
      const fromDate = new Date(leaveRequest.fromDate)
      const toDate = new Date(leaveRequest.toDate)
      const leaveRecords = []
      
      // Generate attendance records for each day of the leave
      for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
        const recordDate = new Date(d).toISOString().split('T')[0]
        
        // Check if there's already an attendance record for this date
        const existingRecord = attendanceRecords.find(
          record => record.employeeName === leaveRequest.employeeName && record.date === recordDate
        )
        
        if (!existingRecord) {
          const leaveRecord = {
            id: `leave-${leaveRequest.id}-${recordDate}`,
            employeeName: leaveRequest.employeeName,
            date: recordDate,
            checkIn: null,
            checkOut: null,
            status: 'leave',
            hoursWorked: 0,
            leaveType: leaveRequest.leaveType,
            leaveReason: leaveRequest.reason,
            createdAt: new Date().toISOString()
          }
          leaveRecords.push(leaveRecord)
        }
      }
      
      if (leaveRecords.length > 0) {
        setAttendanceRecords(prev => [...leaveRecords, ...prev])
      }
      
      return { success: true, recordsCreated: leaveRecords.length }
    } catch (error) {
      console.error('Error creating leave attendance records:', error)
      return { success: false, message: 'Failed to create leave attendance records' }
    }
  }

  const getAllAttendanceStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = getAttendanceByDate(today)
    
    return {
      todayPresent: todayRecords.length,
      todayCheckedIn: todayRecords.filter(r => r.checkIn && !r.checkOut).length,
      todayCheckedOut: todayRecords.filter(r => r.checkOut).length,
      totalRecords: attendanceRecords.length
    }
  }

  const contextValue = {
    attendanceRecords,
    loading,
    checkIn,
    checkOut,
    getTodayAttendance,
    getAttendanceByEmployee,
    getAttendanceByDate,
    getAttendanceStats,
    getAllAttendanceStats,
    createLeaveAttendanceRecord
  }

  return (
    <AttendanceContext.Provider value={contextValue}>
      {children}
    </AttendanceContext.Provider>
  )
}

export default AttendanceProvider