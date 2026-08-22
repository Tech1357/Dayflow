import { createContext, useContext, useState, useEffect } from 'react'

const EmployeeContext = createContext()

export const useEmployees = () => {
  const context = useContext(EmployeeContext)
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeeProvider')
  }
  return context
}

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Initialize with sample employees on first load
  useEffect(() => {
    if (!initialized) {
      const sampleEmployees = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@company.com',
          position: 'Software Engineer',
          department: 'Engineering',
          phone: '+1-555-0123',
          address: '123 Main St, City, State 12345',
          status: 'present',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@company.com',
          position: 'Product Manager',
          department: 'Product',
          phone: '+1-555-0124',
          address: '456 Oak Ave, City, State 12345',
          status: 'present',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike.johnson@company.com',
          position: 'UX Designer',
          department: 'Design',
          phone: '+1-555-0125',
          address: '789 Pine St, City, State 12345',
          status: 'leave',
          createdAt: new Date().toISOString()
        }
      ]
      setEmployees(sampleEmployees)
      setInitialized(true)
    }
  }, [initialized])

  const addEmployee = async (employeeData) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const newEmployee = {
        ...employeeData,
        id: Date.now(),
        status: 'present', // Default status
        createdAt: new Date().toISOString()
      }
      
      setEmployees(prev => [...prev, newEmployee])
      return { success: true, message: 'Employee added successfully!' }
    } catch (error) {
      console.error('Error adding employee:', error)
      return { success: false, message: 'Failed to add employee' }
    } finally {
      setLoading(false)
    }
  }

  const updateEmployee = async (employeeId, updates) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))
      
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === employeeId
            ? { ...emp, ...updates, updatedAt: new Date().toISOString() }
            : emp
        )
      )
      return { success: true, message: 'Employee updated successfully!' }
    } catch (error) {
      console.error('Error updating employee:', error)
      return { success: false, message: 'Failed to update employee' }
    } finally {
      setLoading(false)
    }
  }

  const removeEmployee = async (employeeId) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))
      
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId))
      return { success: true, message: 'Employee removed successfully!' }
    } catch (error) {
      console.error('Error removing employee:', error)
      return { success: false, message: 'Failed to remove employee' }
    } finally {
      setLoading(false)
    }
  }

  const getEmployeeById = (employeeId) => {
    return employees.find(emp => emp.id === employeeId)
  }

  const getEmployeesByDepartment = (department) => {
    return employees.filter(emp => 
      emp.department && emp.department.toLowerCase() === department.toLowerCase()
    )
  }

  const getEmployeesByStatus = (status) => {
    return employees.filter(emp => emp.status === status)
  }

  const updateEmployeeStatus = async (employeeId, status) => {
    return await updateEmployee(employeeId, { status })
  }

  const getStatusCounts = () => {
    return {
      total: employees.length,
      present: employees.filter(e => e.status === 'present').length,
      leave: employees.filter(e => e.status === 'leave').length,
      absent: employees.filter(e => e.status === 'absent').length
    }
  }

  const getDepartmentCounts = () => {
    const departments = {}
    employees.forEach(emp => {
      if (emp.department) {
        departments[emp.department] = (departments[emp.department] || 0) + 1
      }
    })
    return departments
  }

  const contextValue = {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    removeEmployee,
    getEmployeeById,
    getEmployeesByDepartment,
    getEmployeesByStatus,
    updateEmployeeStatus,
    getStatusCounts,
    getDepartmentCounts
  }

  return (
    <EmployeeContext.Provider value={contextValue}>
      {children}
    </EmployeeContext.Provider>
  )
}

export default EmployeeProvider