import { createContext, useContext, useState, useEffect } from 'react'

const LeaveRequestContext = createContext()

export const useLeaveRequests = () => {
  const context = useContext(LeaveRequestContext)
  if (!context) {
    throw new Error('useLeaveRequests must be used within a LeaveRequestProvider')
  }
  return context
}

export const LeaveRequestProvider = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState([
    // Sample data for testing - Updated to August 2026 to match current view
    {
      id: 1,
      employeeName: 'John Doe',
      leaveType: 'Annual Leave',
      fromDate: '2026-08-20',
      toDate: '2026-08-22',
      reason: 'Family vacation',
      status: 'approved',
      submittedAt: '2026-08-15T10:00:00Z',
      approvedAt: '2026-08-16T14:30:00Z'
    },
    {
      id: 2,
      employeeName: 'Jane Smith',
      leaveType: 'Sick Leave',
      fromDate: '2026-08-21',
      toDate: '2026-08-21',
      reason: 'Medical appointment',
      status: 'approved',
      submittedAt: '2026-08-20T09:15:00Z',
      approvedAt: '2026-08-20T16:45:00Z'
    },
    {
      id: 3,
      employeeName: 'John Doe',
      leaveType: 'Personal Leave',
      fromDate: '2026-08-25',
      toDate: '2026-08-25',
      reason: 'Personal matters',
      status: 'pending',
      submittedAt: '2026-08-22T11:30:00Z'
    },
    {
      id: 4,
      employeeName: 'John Doe',
      leaveType: 'Sick Leave',
      fromDate: '2026-08-15',
      toDate: '2026-08-15',
      reason: 'Doctor visit',
      status: 'approved',
      submittedAt: '2026-08-14T08:30:00Z',
      approvedAt: '2026-08-14T12:15:00Z'
    }
  ])
  const [loading, setLoading] = useState(false)

  const submitLeaveRequest = async (requestData) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newRequest = {
        ...requestData,
        id: Date.now(), // Simple ID generation
        status: 'pending'
      }
      
      setLeaveRequests(prev => [newRequest, ...prev])
      return { success: true, message: 'Leave request submitted successfully!' }
    } catch (error) {
      console.error('Error submitting leave request:', error)
      return { success: false, message: 'Failed to submit leave request' }
    } finally {
      setLoading(false)
    }
  }

  const approveRequest = async (requestId) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setLeaveRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: 'approved', approvedAt: new Date().toISOString() }
            : req
        )
      )
      
      // Find the request for employee notification
      const request = leaveRequests.find(req => req.id === requestId)
      if (request) {
        // This would typically send an actual notification to the employee
        console.log(`✅ Notification sent to ${request.employeeName}: Your leave request has been approved!`)
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error approving request:', error)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const rejectRequest = async (requestId, rejectionReason) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setLeaveRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { 
                ...req, 
                status: 'rejected', 
                rejectionReason: rejectionReason,
                rejectedAt: new Date().toISOString() 
              }
            : req
        )
      )
      
      // Find the request for employee notification
      const request = leaveRequests.find(req => req.id === requestId)
      if (request) {
        // This would typically send an actual notification to the employee
        console.log(`❌ Notification sent to ${request.employeeName}: Your leave request has been rejected. Reason: ${rejectionReason}`)
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error rejecting request:', error)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const getRequestsByEmployee = (employeeName) => {
    return leaveRequests.filter(req => req.employeeName === employeeName)
  }

  const getPendingRequests = () => {
    return leaveRequests.filter(req => req.status === 'pending')
  }

  const getRequestsByStatus = (status) => {
    return leaveRequests.filter(req => req.status === status)
  }

  const contextValue = {
    leaveRequests,
    loading,
    submitLeaveRequest,
    approveRequest,
    rejectRequest,
    getRequestsByEmployee,
    getPendingRequests,
    getRequestsByStatus
  }

  return (
    <LeaveRequestContext.Provider value={contextValue}>
      {children}
    </LeaveRequestContext.Provider>
  )
}

export default LeaveRequestProvider