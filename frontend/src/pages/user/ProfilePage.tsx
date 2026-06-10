import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiLock, FiCamera, FiSave, FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { updateUserAvatar } from '../../redux/slices/authSlice'
import { authApi as authService } from '../../services/authService'

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(s => s.auth)
  const fileRef = useRef<HTMLInputElement>(null)

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phoneNumber: user?.phoneNumber ?? '',
  })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authService.updateProfile(profileForm)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }
    setChangingPassword(true)
    try {
      await authService.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      toast.success('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      toast.error('Failed to change password. Check your current password.')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const data = await authService.uploadAvatar(file)
      dispatch(updateUserAvatar(data.avatarUrl))
      toast.success('Avatar updated!')
    } catch {
      toast.error('Failed to upload avatar.')
    } finally {
      setUploading(false)
    }
  }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <div className="container-fluid py-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{initials}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <FiCamera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">{user?.firstName} {user?.lastName}</p>
            <p className="text-gray-500 dark:text-dark-muted text-sm">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              {user?.roles?.[0] ?? 'Customer'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Profile Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 mb-6">
        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
          <FiUser className="w-5 h-5 text-primary-600" /> Personal Information
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">First Name</label>
              <input
                className="input-field"
                value={profileForm.firstName}
                onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))}
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Last Name</label>
              <input
                className="input-field"
                value={profileForm.lastName}
                onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))}
                placeholder="Last name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input-field pl-10 bg-gray-50 dark:bg-dark-bg" value={user?.email ?? ''} disabled />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input-field pl-10"
                value={profileForm.phoneNumber}
                onChange={e => setProfileForm(f => ({ ...f, phoneNumber: e.target.value }))}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <FiSave className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Password Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
          <FiLock className="w-5 h-5 text-primary-600" /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field, i) => {
            const labels = ['Current Password', 'New Password', 'Confirm New Password']
            const keys = ['current', 'new', 'confirm'] as const
            const key = keys[i]
            return (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">{labels[i]}</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPasswords[key] ? 'text' : 'password'}
                    className="input-field pl-10 pr-10"
                    value={passwordForm[field]}
                    onChange={e => setPasswordForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={labels[i]}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(s => ({ ...s, [key]: !s[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords[key] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )
          })}
          <div className="flex justify-end">
            <button type="submit" disabled={changingPassword} className="btn-primary flex items-center gap-2">
              <FiLock className="w-4 h-4" />
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
