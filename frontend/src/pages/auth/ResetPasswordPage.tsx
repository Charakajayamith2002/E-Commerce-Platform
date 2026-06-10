import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiLock, FiCheck } from 'react-icons/fi'
import { authApi } from '../../services/authService'
import { toast } from 'react-toastify'

interface ResetForm { newPassword: string; confirmPassword: string }

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>()
  const password = watch('newPassword')

  const onSubmit = async (data: ResetForm) => {
    const email = searchParams.get('email')
    const token = searchParams.get('token')
    if (!email || !token) { toast.error('Invalid reset link'); return }
    setIsLoading(true)
    try {
      await authApi.resetPassword({ email, token, newPassword: data.newPassword })
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch {
      toast.error('Failed to reset password. Link may be expired.')
    } finally {
      setIsLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
          <p className="text-gray-500 dark:text-dark-muted">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="card p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reset Password</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" {...register('newPassword', { required: true, minLength: { value: 8, message: 'Min 8 chars' } })}
                className="input-field pl-11" placeholder="••••••••" />
            </div>
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" {...register('confirmPassword', { validate: (v) => v === password || 'Passwords do not match' })}
                className="input-field pl-11" placeholder="••••••••" />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Reset Password'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/login" className="text-primary-600 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  )
}
