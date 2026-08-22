import { useState } from 'react'
import { Shield, Key, Lock, Eye, EyeOff, Smartphone, Mail } from 'lucide-react'

const Security = ({ employee, userRole, isOwnProfile }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const handleChangePassword = (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match')
      return
    }
    // Handle password change logic here
    console.log('Password change requested')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    alert('Password updated successfully')
  }

  // Only show security settings for own profile
  if (!isOwnProfile) {
    return (
      <div className="text-center py-12">
        <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">
          Security settings are only accessible in your own profile.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-gray-400" />
          Security Settings
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage your account security preferences and authentication methods
        </p>
      </div>

      {/* Change Password */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Key className="h-5 w-5 mr-2 text-gray-600" />
          Change Password
        </h4>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-700">
              <strong>Password Requirements:</strong>
            </p>
            <ul className="text-sm text-yellow-600 mt-1 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include at least one number</li>
              <li>• Include at least one special character</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <Smartphone className="h-5 w-5 mr-2 text-gray-600" />
              Two-Factor Authentication
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="twoFactor"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="twoFactor" className="ml-2 text-sm text-gray-700">
              Enable 2FA
            </label>
          </div>
        </div>

        {twoFactorEnabled ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-700">
                Two-factor authentication is enabled. Your account is protected with an additional security layer.
              </p>
            </div>
            <div className="flex space-x-4">
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                View Recovery Codes
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Change Device
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-700">
              Two-factor authentication is not enabled. Enable it for better account security.
            </p>
          </div>
        )}
      </div>

      {/* Login Sessions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Active Sessions</h4>
        
        <div className="space-y-3">
          {[
            {
              device: 'Chrome on Windows',
              location: 'New York, US',
              lastActive: '2 minutes ago',
              current: true
            },
            {
              device: 'Safari on iPhone',
              location: 'New York, US', 
              lastActive: '1 hour ago',
              current: false
            },
            {
              device: 'Firefox on MacOS',
              location: 'San Francisco, US',
              lastActive: '2 days ago',
              current: false
            }
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border">
              <div>
                <p className="font-medium text-gray-900">
                  {session.device}
                  {session.current && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {session.location} • Last active {session.lastActive}
                </p>
              </div>
              {!session.current && (
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-red-600 hover:text-red-800 text-sm font-medium">
            Sign out of all other sessions
          </button>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Mail className="h-5 w-5 mr-2 text-gray-600" />
          Security Notifications
        </h4>
        
        <div className="space-y-4">
          {[
            {
              title: 'Login Alerts',
              description: 'Get notified when someone logs into your account from a new device',
              enabled: true
            },
            {
              title: 'Password Changes',
              description: 'Receive email confirmation when your password is changed',
              enabled: true
            },
            {
              title: 'Security Updates',
              description: 'Get updates about important security features and recommendations',
              enabled: false
            }
          ].map((notification, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{notification.title}</p>
                <p className="text-sm text-gray-600">{notification.description}</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={notification.enabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-red-800 mb-4">Danger Zone</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-900">Download Account Data</p>
              <p className="text-sm text-red-700">Export all your account data and information</p>
            </div>
            <button className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
              Download
            </button>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-red-200">
            <div>
              <p className="font-medium text-red-900">Deactivate Account</p>
              <p className="text-sm text-red-700">Temporarily disable your account access</p>
            </div>
            <button className="px-3 py-2 border border-red-600 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">
              Deactivate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Security