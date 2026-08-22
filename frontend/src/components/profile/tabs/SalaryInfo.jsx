import { useState } from 'react'
import { Edit, Save, X, DollarSign, Calendar, TrendingUp, Lock } from 'lucide-react'

const SalaryInfo = ({ employee, userRole, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    baseSalary: employee.salary?.baseSalary || 0,
    currency: employee.salary?.currency || 'USD',
    paySchedule: employee.salary?.paySchedule || 'Monthly',
    effectiveDate: employee.salary?.effectiveDate || '',
    // Additional compensation components
    houseRentAllowance: 12500,
    standardAllowance: 15000,
    performanceBonus: 8500,
    leaveTravelAllowance: 6000,
    fixedAllowance: 5000
  })

  // Calculate totals
  const monthlyWage = formData.baseSalary / 12
  const yearlyWage = formData.baseSalary
  const totalMonthlyAllowances = 
    formData.houseRentAllowance +
    formData.standardAllowance +
    formData.performanceBonus +
    formData.leaveTravelAllowance +
    formData.fixedAllowance

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name.includes('Salary') || name.includes('Allowance') || name.includes('Bonus') 
        ? parseFloat(value) || 0 
        : value
    })
  }

  const handleSave = () => {
    console.log('Saving salary info:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      baseSalary: employee.salary?.baseSalary || 0,
      currency: employee.salary?.currency || 'USD',
      paySchedule: employee.salary?.paySchedule || 'Monthly',
      effectiveDate: employee.salary?.effectiveDate || '',
      houseRentAllowance: 12500,
      standardAllowance: 15000,
      performanceBonus: 8500,
      leaveTravelAllowance: 6000,
      fixedAllowance: 5000
    })
    setIsEditing(false)
  }

  // Only admin/HR can view and edit salary information
  if (userRole !== 'admin') {
    return (
      <div className="text-center py-12">
        <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">
          Salary information is only accessible to HR administrators and authorized personnel.
        </p>
      </div>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
            Salary Information
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Confidential compensation details - Admin/HR access only
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Salary
          </button>
        )}
        {isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Salary Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Monthly Wage</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(monthlyWage)}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Yearly Wage</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(yearlyWage)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Total Monthly</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(monthlyWage + totalMonthlyAllowances)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Salary Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Basic Salary Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Base Salary
            </label>
            {isEditing ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="baseSalary"
                  value={formData.baseSalary}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 font-semibold">
                {formatCurrency(formData.baseSalary)}
              </div>
            )}
          </div>

          {/* Pay Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pay Schedule
            </label>
            {isEditing ? (
              <select
                name="paySchedule"
                value={formData.paySchedule}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Semi-monthly">Semi-monthly</option>
                <option value="Monthly">Monthly</option>
              </select>
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.paySchedule}
              </div>
            )}
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            {isEditing ? (
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.currency}
              </div>
            )}
          </div>

          {/* Effective Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effective Date
            </label>
            {isEditing ? (
              <input
                type="date"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.effectiveDate ? new Date(formData.effectiveDate).toLocaleDateString() : 'Not set'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Salary Components */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Salary Components</h4>
        
        <div className="space-y-4">
          {/* Component rows */}
          {[
            { key: 'houseRentAllowance', label: 'House Rent Allowance', percentage: '50% of Basic' },
            { key: 'standardAllowance', label: 'Standard Allowance', percentage: '60% of Basic' },
            { key: 'performanceBonus', label: 'Performance Bonus', percentage: '33.3% of Basic' },
            { key: 'leaveTravelAllowance', label: 'Leave Travel Allowance', percentage: '23.3% of Basic' },
            { key: 'fixedAllowance', label: 'Fixed Allowance', percentage: '20% of Basic' }
          ].map((component) => (
            <div key={component.key} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 bg-white rounded-md border">
              <div>
                <p className="font-medium text-gray-900">{component.label}</p>
                <p className="text-sm text-gray-500">{component.percentage}</p>
              </div>
              
              <div className="text-right md:text-center">
                {isEditing ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name={component.key}
                      value={formData[component.key]}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(formData[component.key])}
                  </span>
                )}
              </div>
              
              <div className="text-right md:text-center">
                <span className="text-sm text-gray-500">per month</span>
              </div>
              
              <div className="text-right">
                <span className="text-sm font-medium text-green-600">
                  {((formData[component.key] / monthlyWage) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-blue-900">Total Monthly Compensation:</span>
            <span className="text-xl font-bold text-blue-900">
              {formatCurrency(monthlyWage + totalMonthlyAllowances)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Important Notes</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Salary information is confidential and should not be shared</li>
          <li>• All amounts are shown before tax deductions</li>
          <li>• Changes require approval from HR leadership</li>
          <li>• Performance bonuses may vary based on company and individual performance</li>
        </ul>
      </div>
    </div>
  )
}

export default SalaryInfo