import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../api/user.js'

export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm()

  const [showOtp, setShowOtp] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(30)

  const otpValue = watch('otp') || ''
  const isOtpValidLength = otpValue.length === 6

  useEffect(() => {
    let timer
    if (showOtp && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [showOtp, resendCountdown])

  const onLoginSubmit = async (data) => {
    try {
      const result = await loginUser();
      if (result.success) {
        navigate('');
      }
    } catch (error) {
      console.error('Error in login: ', error);
    }
  }

  const onOtpSubmit = (e) => {
    e.preventDefault()
    const enteredOtp = watch('otp')
    if (enteredOtp === '123456') {
      setOtpVerified(true)
    } else {
      alert('Invalid OTP')
    }
  }

  const resendOtpBtn = () => {
    setResendCountdown(30)
    console.log('OTP resent!')
  }

  const onNewPassSubmit = (data) => {
    console.log('Reset Password:', data)
    reset()
    setOtpVerified(false)
    setShowOtp(false)
  }

  const goBack = () => {
    setShowOtp(false)
    setOtpVerified(false)
    reset()
  }

  return (
    <div className='min-h-screen py-20 flex justify-center items-center bg-gray-100 text-black dark:bg-neutral-950 dark:text-white'>
      <div className="w-full max-w-sm p-6 rounded-lg shadow-md border border-black bg-white dark:bg-neutral-900 dark:border-white space-y-4 relative">
        {(showOtp || otpVerified) && (
          <button onClick={goBack} className="absolute top-4 left-4 text-gray-600 dark:text-white">
            <FaArrowLeft size={20} />
          </button>
        )}

        {!showOtp && !otpVerified && (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">Login</h2>
            <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-neutral-950 text-gray-800 dark:text-white dark:border-gray-400"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-neutral-950 text-gray-800 dark:text-white dark:border-gray-400"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Minimum 8 characters',
                    },
                    maxLength: {
                      value: 20,
                      message: 'Maximum 20 characters',
                    },
                  })}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtp(true)
                    setResendCountdown(30)
                  }}
                  className="text-sm text-sky-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-full py-2 px-6 bg-sky-500 border border-black dark:border-white text-white rounded hover:bg-sky-600 transition-all"
                >
                  Login
                </button>
              </div>
            </form>

            <p className="text-sm mt-6 text-center text-gray-700 dark:text-gray-300">
              New to DigiDukaan?{' '}
              <span onClick={() => navigate('register')} className="text-sky-600 hover:underline">
                Register here
              </span>
            </p>
          </>
        )}

        {showOtp && !otpVerified && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-white">Reset Password</h2>
            <form onSubmit={onOtpSubmit} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                  OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  autoComplete="one-time-code"
                  className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-neutral-950 text-gray-800 dark:text-white dark:border-gray-400"
                  {...register('otp', {
                    required: 'OTP is required',
                    maxLength: { value: 6, message: 'OTP must be 6 digits' },
                  })}
                />
                {errors.otp && <p className="text-red-500 text-sm">{errors.otp.message}</p>}
              </div>
              <p className="text-sm mb-4 text-center text-gray-600 dark:text-gray-300">
                6 digit OTP has been sent to your registered email
              </p>
              <div className='flex flex-col sm:flex-row justify-around items-center w-full gap-2'>
                <button
                  disabled={resendCountdown > 0}
                  onClick={resendOtpBtn}
                  className={`py-2 px-4 border border-black dark:border-white text-white rounded transition-all
                    ${resendCountdown > 0
                      ? 'bg-red-400 dark:bg-red-500 w-full sm:w-fit opacity-50 cursor-not-allowed'
                      : 'bg-gray-400 dark:bg-gray-600 w-full sm:w-[150px] hover:bg-gray-500 dark:hover:bg-gray-700'}`}
                >
                  {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : 'Resend OTP'}
                </button>
                <button
                  type="submit"
                  disabled={!isOtpValidLength}
                  className={`w-full sm:w-[150px] py-2 px-4 border border-black dark:border-white rounded transition-all
                  ${isOtpValidLength ? 'bg-sky-500 hover:bg-sky-600 text-white' : 'bg-red-400 dark:bg-red-500 text-white opacity-50 cursor-not-allowed'}`}
                >
                  Submit OTP
                </button>
              </div>
            </form>
          </>
        )}

        {otpVerified && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-white">Set New Password</h2>
            <form onSubmit={handleSubmit(onNewPassSubmit)} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="New Password"
                  autoComplete="new-password"
                  className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-neutral-950 text-gray-800 dark:text-white dark:border-gray-400"
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters' },
                    maxLength: { value: 20, message: 'Maximum 20 characters' },
                  })}
                />
                {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-neutral-950 text-gray-800 dark:text-white dark:border-gray-400"
                  {...register('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (value) => value === watch('newPassword') || 'Passwords do not match',
                  })}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-sky-500 border border-black dark:border-white text-white rounded hover:bg-sky-600"
              >
                Set New Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}