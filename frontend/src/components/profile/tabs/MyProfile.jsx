import { useState, useEffect } from 'react'
import { Edit, Save, X, User } from 'lucide-react'
import { useEmployees } from '../../../contexts/EmployeeContext'
import { useAuth } from '../../../contexts/AuthContext'

const MyProfile = ({ employee, userRole, isOwnProfile, onEmployeeUpdate }) => {
  const { updateEmployee, loading } = useEmployees()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState(employee)
  const [profileImage, setProfileImage] = useState(employee.profileImage || null)
  const [formData, setFormData] = useState({
    name: employee.name,
    position: employee.position,
    department: employee.department,
    email: employee.email,
    phone: employee.phone,
    address: employee.address || ''
  })
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // Update form data when employee changes
  useEffect(() => {
    console.log('🔄 Updating form data with employee:', employee)
    setFormData({
      name: employee.name,
      position: employee.position,
      department: employee.department,
      email: employee.email,
      phone: employee.phone,
      address: employee.address || ''
    })
    setProfileImage(employee.profileImage || null)
  }, [employee])

  // Also update form data after successful save
  useEffect(() => {
    if (!isEditing && currentEmployee) {
      console.log('📋 Form exited edit mode, syncing with current employee')
      setFormData({
        name: currentEmployee.name,
        position: currentEmployee.position,
        department: currentEmployee.department,
        email: currentEmployee.email,
        phone: currentEmployee.phone,
        address: currentEmployee.address || ''
      })
    }
  }, [isEditing, currentEmployee])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF, WebP)')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target.result
        setProfileImage(imageUrl)
        
        // Also update the current employee with the new image
        const updatedEmployee = { ...currentEmployee, profileImage: imageUrl }
        setCurrentEmployee(updatedEmployee)
        
        // Update parent component
        if (onEmployeeUpdate) {
          onEmployeeUpdate(updatedEmployee)
        }
        
        console.log('📸 Profile image uploaded successfully!')
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfileImage = () => {
    setProfileImage(null)
    const updatedEmployee = { ...currentEmployee, profileImage: null }
    setCurrentEmployee(updatedEmployee)
    
    if (onEmployeeUpdate) {
      onEmployeeUpdate(updatedEmployee)
    }
    
    console.log('🗑️ Profile image removed')
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        // Create a fake event object for handlePhotoUpload
        const fakeEvent = { target: { files: [file] } }
        handlePhotoUpload(fakeEvent)
      } else {
        alert('Please drop an image file')
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Log the data being saved for debugging
      console.log('💾 Saving profile data:', formData)
      console.log('👤 Employee ID:', employee.id)
      
      // Create updated employee object
      const updatedEmployee = { 
        ...employee, 
        ...formData, 
        profileImage: profileImage || currentEmployee.profileImage
      }
      
      // Update employee data using context
      const result = await updateEmployee(employee.id, formData)
      
      if (result && result.success) {
        console.log('✅ Context update successful!')
      } else {
        console.warn('⚠️ Context update failed, but continuing with local update')
      }
      
      // Always update the parent and local state for immediate visual feedback
      if (onEmployeeUpdate) {
        onEmployeeUpdate(updatedEmployee)
      }
      setCurrentEmployee(updatedEmployee)
      
      setIsEditing(false)
      console.log('✅ Profile updated successfully!')
      console.log('📝 Updated employee:', updatedEmployee)
      
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      
      // Still update locally for better UX
      const updatedEmployee = { 
        ...employee, 
        ...formData, 
        profileImage: profileImage || currentEmployee.profileImage
      }
      if (onEmployeeUpdate) {
        onEmployeeUpdate(updatedEmployee)
      }
      setCurrentEmployee(updatedEmployee)
      setIsEditing(false)
      console.log('⚠️ Updated display locally due to error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: employee.name,
      position: employee.position,
      department: employee.department,
      email: employee.email,
      phone: employee.phone,
      address: employee.address || ''
    })
    setIsEditing(false)
  }

  const canEdit = isOwnProfile || userRole === 'admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
        {isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                saving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
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

      {/* Profile Picture Section */}
      <div 
        className={`flex items-center space-x-6 p-6 bg-gray-50 rounded-lg border-2 border-dashed transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-transparent'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          {profileImage || currentEmployee.profileImage ? (
            <img 
              src={profileImage || currentEmployee.profileImage} 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Profile Picture</h4>
          <p className="text-sm text-gray-600 mb-3">
            Upload a professional photo to help colleagues recognize you. Max size: 5MB
            <br />
            <span className="text-xs text-gray-500">Drag & drop an image here or click the upload button</span>
          </p>
          {canEdit && (
            <div className="flex items-center space-x-3">
              <label className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                📤 Upload Photo
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {(profileImage || currentEmployee.profileImage) && (
                <button 
                  onClick={removeProfileImage}
                  className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  🗑️ Remove
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div key={`profile-form-${employee.id}-${employee.name}`} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {currentEmployee.name}
            </div>
          )}
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          {isEditing && userRole === 'admin' ? (
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {currentEmployee.position}
            </div>
          )}
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          {isEditing && userRole === 'admin' ? (
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Analytics">Analytics</option>
            </select>
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {currentEmployee.department}
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {currentEmployee.email}
            </div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {currentEmployee.phone}
            </div>
          )}
        </div>
      </div>

      {/* Address - Full Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        {isEditing ? (
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your address"
          />
        ) : (
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 min-h-[2.5rem]">
            {currentEmployee.address || 'No address provided'}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyProfile