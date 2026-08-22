import { useState } from 'react'
import { Edit, Save, X, Lock } from 'lucide-react'

const PrivateInfo = ({ employee, userRole, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    dateOfBirth: employee.dateOfBirth || '',
    nationality: employee.nationality || '',
    maritalStatus: employee.maritalStatus || '',
    gender: employee.gender || '',
    emergencyContactName: employee.emergencyContact?.name || '',
    emergencyContactRelationship: employee.emergencyContact?.relationship || '',
    emergencyContactPhone: employee.emergencyContact?.phone || ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = () => {
    console.log('Saving private info:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      dateOfBirth: employee.dateOfBirth || '',
      nationality: employee.nationality || '',
      maritalStatus: employee.maritalStatus || '',
      gender: employee.gender || '',
      emergencyContactName: employee.emergencyContact?.name || '',
      emergencyContactRelationship: employee.emergencyContact?.relationship || '',
      emergencyContactPhone: employee.emergencyContact?.phone || ''
    })
    setIsEditing(false)
  }

  const canEdit = isOwnProfile || userRole === 'admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-gray-400" />
            Private Information
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            This information is confidential and only visible to you and HR administrators
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

      {/* Personal Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Personal Details</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            {isEditing ? (
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </div>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            {isEditing ? (
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.gender || 'Not provided'}
              </div>
            )}
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nationality
            </label>
            {isEditing ? (
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter nationality"
              />
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.nationality || 'Not provided'}
              </div>
            )}
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marital Status
            </label>
            {isEditing ? (
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.maritalStatus || 'Not provided'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Emergency Contact</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Name */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Emergency contact name"
              />
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.emergencyContactName || 'Not provided'}
              </div>
            )}
          </div>

          {/* Relationship */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship
            </label>
            {isEditing ? (
              <input
                type="text"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Relationship (e.g., Spouse, Parent)"
              />
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.emergencyContactRelationship || 'Not provided'}
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Emergency contact phone"
              />
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900">
                {formData.emergencyContactPhone || 'Not provided'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <Lock className="h-4 w-4 inline mr-1" />
          This information is kept strictly confidential and is only accessible to you and authorized HR personnel. 
          It is used for emergency purposes and legal compliance only.
        </p>
      </div>
    </div>
  )
}

export default PrivateInfo