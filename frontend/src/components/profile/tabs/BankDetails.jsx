import { useState } from 'react'
import { Edit, Save, X, CreditCard, Shield, Eye, EyeOff } from 'lucide-react'

const BankDetails = ({ employee, userRole, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showAccountNumber, setShowAccountNumber] = useState(false)
  const [formData, setFormData] = useState({
    accountNumber: employee.bankDetails?.accountNumber || '',
    bankName: employee.bankDetails?.bankName || '',
    routingNumber: employee.bankDetails?.routingNumber || '',
    accountType: employee.bankDetails?.accountType || 'Checking',
    accountHolderName: employee.name || ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = () => {
    console.log('Saving bank details:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      accountNumber: employee.bankDetails?.accountNumber || '',
      bankName: employee.bankDetails?.bankName || '',
      routingNumber: employee.bankDetails?.routingNumber || '',
      accountType: employee.bankDetails?.accountType || 'Checking',
      accountHolderName: employee.name || ''
    })
    setIsEditing(false)
  }

  const canEdit = isOwnProfile || userRole === 'admin'

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.length < 4) return accountNumber
    return '**** **** **** ' + accountNumber.slice(-4)
  }

  const displayAccountNumber = showAccountNumber 
    ? formData.accountNumber 
    : maskAccountNumber(formData.accountNumber)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-gray-400" />
            Bank Account Details
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Secure banking information for payroll processing
          </p>
        </div>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
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

      {/* Bank Account Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Account Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Holder Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Full name as it appears on the account"
              />
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.accountHolderName || 'Not provided'}
              </div>
            )}
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter bank name"
              />
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.bankName || 'Not provided'}
              </div>
            )}
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            {isEditing ? (
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Checking">Checking</option>
                <option value="Savings">Savings</option>
              </select>
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.accountType || 'Not provided'}
              </div>
            )}
          </div>

          {/* Routing Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Routing Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="routingNumber"
                value={formData.routingNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="9-digit routing number"
                maxLength="9"
              />
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.routingNumber || 'Not provided'}
              </div>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Account number"
              />
            ) : (
              <div className="flex">
                <div className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-l-md text-gray-900">
                  {displayAccountNumber || 'Not provided'}
                </div>
                {formData.accountNumber && (
                  <button
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-200 rounded-r-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {showAccountNumber ? (
                      <EyeOff className="h-4 w-4 text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <Shield className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Security Notice</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Your banking information is encrypted and stored securely</li>
              <li>• Only authorized personnel can access this information</li>
              <li>• Never share your account details via email or unsecured channels</li>
              <li>• Contact HR immediately if you notice any unauthorized changes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Important Information</h4>
        <p className="text-sm text-blue-700">
          Changes to banking information may take 1-2 pay cycles to take effect. 
          Please ensure all information is accurate before submitting. Contact the payroll team 
          if you have questions about direct deposit setup.
        </p>
      </div>
    </div>
  )
}

export default BankDetails