import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useEmployees } from './EmployeeContext'

const PayrollContext = createContext()

export const usePayroll = () => {
  const context = useContext(PayrollContext)
  if (!context) {
    throw new Error('usePayroll must be used within a PayrollProvider')
  }
  return context
}

export const PayrollProvider = ({ children }) => {
  const { user } = useAuth()
  const { employees } = useEmployees()
  const [payrollData, setPayrollData] = useState([])
  const [loading, setLoading] = useState(false)

  // Generate dynamic payroll data based on employees
  useEffect(() => {
    if (employees.length > 0) {
      const generatedPayroll = employees.map(employee => {
        // Generate realistic payroll data based on position
        const baseSalary = generateBaseSalary(employee.position)
        const allowances = generateAllowances(baseSalary)
        const grossSalary = baseSalary + allowances.total
        const deductions = generateDeductions(grossSalary)
        const netSalary = grossSalary - deductions.total

        return {
          id: employee.id,
          employeeId: `EMP${String(employee.id).padStart(4, '0')}`,
          name: employee.name,
          position: employee.position,
          department: employee.department,
          email: employee.email,
          baseSalary,
          houseRentAllowance: allowances.houseRent,
          standardAllowance: allowances.standard,
          performanceBonus: allowances.performance,
          leaveTravelAllowance: allowances.leaveTravel,
          fixedAllowance: allowances.fixed,
          grossSalary,
          pf: deductions.pf,
          tax: deductions.tax,
          insurance: deductions.insurance,
          totalDeductions: deductions.total,
          netSalary,
          paySchedule: 'Monthly',
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      })
      setPayrollData(generatedPayroll)
    }
  }, [employees])

  // Generate base salary based on position
  const generateBaseSalary = (position) => {
    const salaryRanges = {
      'Software Engineer': { min: 75000, max: 95000 },
      'Senior Software Engineer': { min: 95000, max: 120000 },
      'Product Manager': { min: 90000, max: 110000 },
      'UX Designer': { min: 65000, max: 85000 },
      'HR Manager': { min: 70000, max: 90000 },
      'Sales Representative': { min: 50000, max: 70000 },
      'Marketing Specialist': { min: 60000, max: 80000 },
      'DevOps Engineer': { min: 80000, max: 100000 },
      'Data Analyst': { min: 70000, max: 90000 },
      'Backend Developer': { min: 75000, max: 95000 },
      'Frontend Developer': { min: 70000, max: 90000 },
      'Full Stack Developer': { min: 80000, max: 100000 }
    }

    const range = salaryRanges[position] || { min: 60000, max: 80000 }
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
  }

  // Generate allowances based on base salary
  const generateAllowances = (baseSalary) => {
    const houseRent = Math.round(baseSalary * 0.15) // 15% of base salary
    const standard = Math.round(baseSalary * 0.06) // 6% of base salary
    const performance = Math.round(baseSalary * 0.10) // 10% performance bonus
    const leaveTravel = Math.round(baseSalary * 0.04) // 4% leave travel
    const fixed = Math.round(baseSalary * 0.02) // 2% fixed allowance

    return {
      houseRent,
      standard,
      performance,
      leaveTravel,
      fixed,
      total: houseRent + standard + performance + leaveTravel + fixed
    }
  }

  // Generate deductions based on gross salary
  const generateDeductions = (grossSalary) => {
    const pf = Math.round(grossSalary * 0.12) // 12% Provident Fund
    const tax = Math.round(grossSalary * 0.18) // 18% Income Tax (simplified)
    const insurance = 2400 // Fixed health insurance

    return {
      pf,
      tax,
      insurance,
      total: pf + tax + insurance
    }
  }

  const updatePayroll = async (employeeId, updates) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setPayrollData(prev =>
        prev.map(payroll =>
          payroll.id === employeeId
            ? { 
                ...payroll, 
                ...updates, 
                lastUpdated: new Date().toISOString().split('T')[0],
                // Recalculate totals
                grossSalary: calculateGrossSalary(updates),
                totalDeductions: calculateTotalDeductions(calculateGrossSalary(updates)),
                netSalary: calculateNetSalary(updates)
              }
            : payroll
        )
      )
      return { success: true, message: 'Payroll updated successfully!' }
    } catch (error) {
      console.error('Error updating payroll:', error)
      return { success: false, message: 'Failed to update payroll' }
    } finally {
      setLoading(false)
    }
  }

  const calculateGrossSalary = (payrollData) => {
    return (payrollData.baseSalary || 0) + 
           (payrollData.houseRentAllowance || 0) + 
           (payrollData.standardAllowance || 0) + 
           (payrollData.performanceBonus || 0) + 
           (payrollData.leaveTravelAllowance || 0) + 
           (payrollData.fixedAllowance || 0)
  }

  const calculateTotalDeductions = (grossSalary) => {
    const pf = Math.round(grossSalary * 0.12)
    const tax = Math.round(grossSalary * 0.18)
    const insurance = 2400
    return pf + tax + insurance
  }

  const calculateNetSalary = (payrollData) => {
    const gross = calculateGrossSalary(payrollData)
    const deductions = calculateTotalDeductions(gross)
    return gross - deductions
  }

  const getPayrollByEmployee = (employeeId) => {
    return payrollData.find(payroll => payroll.id === employeeId)
  }

  const getPayrollByEmployeeName = (employeeName) => {
    return payrollData.find(payroll => payroll.name === employeeName)
  }

  const getCurrentUserPayroll = () => {
    if (!user) return null
    
    const userName = user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.name
    return getPayrollByEmployeeName(userName)
  }

  const getPayrollStats = () => {
    const totalEmployees = payrollData.length
    const totalPayroll = payrollData.reduce((sum, payroll) => sum + payroll.netSalary, 0)
    const avgSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0
    const highestSalary = Math.max(...payrollData.map(p => p.netSalary), 0)
    const lowestSalary = Math.min(...payrollData.map(p => p.netSalary), 0)

    return {
      totalEmployees,
      totalPayroll,
      avgSalary,
      highestSalary,
      lowestSalary
    }
  }

  const contextValue = {
    payrollData,
    loading,
    updatePayroll,
    getPayrollByEmployee,
    getPayrollByEmployeeName,
    getCurrentUserPayroll,
    getPayrollStats,
    calculateGrossSalary,
    calculateTotalDeductions,
    calculateNetSalary
  }

  return (
    <PayrollContext.Provider value={contextValue}>
      {children}
    </PayrollContext.Provider>
  )
}

export default PayrollProvider