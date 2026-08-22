import { useState } from 'react'
import Header from '../layout/Header'
import { Search, Filter, Download, DollarSign, Users, Calendar, Edit3, Save, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usePayroll } from '../../contexts/PayrollContext'

const Payroll = () => {
  const { user, isAdmin } = useAuth()
  const { payrollData, getCurrentUserPayroll, getPayrollStats, updatePayroll, loading } = usePayroll()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [editData, setEditData] = useState({})

  if (!user) {
    return <div>Loading...</div>
  }

  // Get current user's payroll data
  const currentUserPayroll = getCurrentUserPayroll()
  const payrollStats = getPayrollStats()

  const employees = ['All Employees', ...payrollData.map(emp => emp.name)]

  const filteredData = payrollData.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEmployee = selectedEmployee === 'all' || 
                           selectedEmployee === 'All Employees' || 
                           employee.name === selectedEmployee
    
    return matchesSearch && matchesEmployee
  })

  // For employees, only show their own payroll data
  const displayData = isAdmin 
    ? filteredData 
    : currentUserPayroll ? [currentUserPayroll] : []

  const handleEdit = (employee) => {
    setEditingEmployee(employee.id)
    setEditData({
      baseSalary: employee.baseSalary,
      houseRentAllowance: employee.houseRentAllowance,
      standardAllowance: employee.standardAllowance,
      performanceBonus: employee.performanceBonus,
      leaveTravelAllowance: employee.leaveTravelAllowance,
      fixedAllowance: employee.fixedAllowance
    })
  }

  const handleSave = async (employeeId) => {
    // Calculate new totals
    const grossSalary = Object.values(editData).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    const pf = Math.round(grossSalary * 0.12) // 12% PF
    const tax = Math.round(grossSalary * 0.18) // 18% tax (simplified)
    const insurance = 2400 // Fixed insurance
    const totalDeductions = pf + tax + insurance
    const netSalary = grossSalary - totalDeductions

    const updatedData = {
      ...editData,
      grossSalary,
      pf,
      tax,
      insurance,
      totalDeductions,
      netSalary
    }

    const result = await updatePayroll(employeeId, updatedData)
    if (result.success) {
      setEditingEmployee(null)
      setEditData({})
      alert('Payroll updated successfully!')
    } else {
      alert('Failed to update payroll')
    }
  }

  const handleCancel = () => {
    setEditingEmployee(null)
    setEditData({})
  }

  // Employee Dashboard View
  const EmployeePayrollView = () => {
    const employeeData = displayData[0] // Current employee's data
    
    if (!employeeData) {
      return (
        <div className="text-center py-12">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payroll Data</h3>
          <p className="text-gray-600">Your payroll information is not available.</p>
        </div>
      )
    }

    return (
      <div className="max-w-4xl mx-auto">
        {/* Employee Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{employeeData.name}</h2>
              <p className="text-gray-600">{employeeData.position} • {employeeData.department}</p>
              <p className="text-sm text-gray-500 mt-1">Employee ID: {employeeData.employeeId}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                ${employeeData.netSalary.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Net Monthly Salary</p>
            </div>
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              Earnings
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Salary</span>
                <span className="font-medium">${employeeData.baseSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">House Rent Allowance</span>
                <span className="font-medium">${employeeData.houseRentAllowance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Standard Allowance</span>
                <span className="font-medium">${employeeData.standardAllowance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Performance Bonus</span>
                <span className="font-medium">${employeeData.performanceBonus.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Leave Travel Allowance</span>
                <span className="font-medium">${employeeData.leaveTravelAllowance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fixed Allowance</span>
                <span className="font-medium">${employeeData.fixedAllowance.toLocaleString()}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Gross Salary</span>
                <span className="text-green-600">${employeeData.grossSalary.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <X className="h-5 w-5 text-red-600 mr-2" />
              Deductions
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Provident Fund (PF)</span>
                <span className="font-medium text-red-600">-${employeeData.pf.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Income Tax</span>
                <span className="font-medium text-red-600">-${employeeData.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Health Insurance</span>
                <span className="font-medium text-red-600">-${employeeData.insurance.toLocaleString()}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Deductions</span>
                <span className="text-red-600">-${employeeData.totalDeductions.toLocaleString()}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-xl">
                <span>Net Salary</span>
                <span className="text-green-600">${employeeData.netSalary.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Payment Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <span className="font-medium">Pay Schedule:</span> {employeeData.paySchedule}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {new Date(employeeData.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Admin Dashboard View
  const AdminPayrollView = () => (
    <div className="max-w-7xl mx-auto">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 h-4 w-4" />
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {employees.map(employee => (
                  <option key={employee} value={employee === 'All Employees' ? 'all' : employee}>
                    {employee}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="h-4 w-4 mr-2" />
            Export Payroll
          </button>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Payroll Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {displayData.length} employees • Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allowances
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.map((employee) => {
                const isEditing = editingEmployee === employee.id
                const totalAllowances = employee.houseRentAllowance + employee.standardAllowance + 
                                      employee.performanceBonus + employee.leaveTravelAllowance + 
                                      employee.fixedAllowance

                return (
                  <tr key={employee.id} className={isEditing ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.position}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.baseSalary}
                          onChange={(e) => setEditData({...editData, baseSalary: parseFloat(e.target.value) || 0})}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">${employee.baseSalary.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">${totalAllowances.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600">${employee.grossSalary.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-red-600">-${employee.totalDeductions.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">${employee.netSalary.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(employee.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'Payroll Management' : 'My Payroll'}
          </h1>
          <p className="text-gray-600">
            {isAdmin 
              ? 'Manage employee salary structures and payroll information' 
              : 'View your salary breakdown and payment details'
            }
          </p>
        </div>

        {/* Summary Cards for Admin */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{payrollStats.totalEmployees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${payrollStats.totalPayroll.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Salary</p>
                  <p className="text-2xl font-bold text-gray-900">${payrollStats.avgSalary.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {isAdmin ? <AdminPayrollView /> : <EmployeePayrollView />}
      </main>
    </div>
  )
}

export default Payroll