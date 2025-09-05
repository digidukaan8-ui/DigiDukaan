import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FaArrowLeft } from 'react-icons/fa'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { loginUser, sendOtp, verifyOtp, resetPassword } from '../../api/user.js'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import useLoaderStore from '../../store/loader.js'

export default function Login() {
  const { startLoading, stopLoading } = useLoaderStore()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm()
  const [showForgotEmail, setShowForgotEmail] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(30)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const otpValue = watch('otp') || ''
  const isOtpValidLength = otpValue.length === 6

  useEffect(() => {
    let timer
    if (showOtp && resendCountdown > 0) {
      timer = setInterval(() => setResendCountdown(prev => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [showOtp, resendCountdown])

  const onLoginSubmit = async (data) => {
    startLoading('login')
    try {
      const result = await loginUser(data)
      if (result.success) {
        reset()
        if (result.data.role === 'seller') {
          setTimeout(() => {
            navigate('/seller/store')
            toast.success('Login successfully!')
          }, 500)
        } else {
          navigate('/')
          toast.success('Login successfully!')
        }
      }
    } finally {
      stopLoading()
    }
  }

  const getOtp = async (data) => {
    startLoading("sendOTP")
    try {
      const result = await sendOtp({ email: data.email })
      if (result.success) {
        toast.success('OTP sent successfully!')
        setShowOtp(true)
        setShowForgotEmail(false)
        setResendCountdown(30)
      }
    } finally {
      stopLoading()
    }
  }

  const onOtpSubmit = async (data) => {
    startLoading("verifyOTP")
    try {
      const result = await verifyOtp({ email: data.email, otp: data.otp })
      if (result.success) {
        toast.success('OTP verified')
        setOtpVerified(true)
      } else {
        toast.error('Invalid OTP')
      }
    } finally {
      stopLoading()
    }
  }

  const resendOtpBtn = async () => {
    startLoading("sendOTP")
    try {
      const email = watch('email')
      if (email) {
        await sendOtp({ email })
        setResendCountdown(30)
        toast.success("OTP resent!")
      }
    } finally {
      stopLoading()
    }
  }

  const onNewPassSubmit = async (data) => {
    startLoading("resetPassword")
    try {
      const result = await resetPassword({ email: data.email, newPassword: data.newPassword })
      if (result.success) {
        toast.success("Password reset successful")
        reset()
        setOtpVerified(false)
        setShowOtp(false)
      }
    } finally {
      stopLoading()
    }
  }

  const goBack = () => {
    setShowOtp(false)
    setOtpVerified(false)
    setShowForgotEmail(false)
    reset()
  }

  return (
    <div className='min-h-screen py-20 flex justify-center items-center bg-gray-100 text-black dark:bg-neutral-950 dark:text-white'>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm mx-5 p-6 rounded-lg shadow-md border border-black bg-white dark:bg-neutral-900 dark:border-white space-y-4 relative">
        {(showForgotEmail || showOtp || otpVerified) && (
          <button onClick={goBack} className="absolute top-4 left-4 text-gray-600 dark:text-white">
            <FaArrowLeft size={20} />
          </button>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={
              !showForgotEmail && !showOtp && !otpVerified
                ? "login"
                : showForgotEmail
                  ? "forgotEmail"
                  : showOtp && !otpVerified
                    ? "otp"
                    : "newpass"
            }
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="space-y-4"
          >
            {!showForgotEmail && !showOtp && !otpVerified && (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
                <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block mb-1 text-sm">Email</label>
                    <input id="email" type="email" placeholder="Enter your email" className="w-full px-4 py-2 border border-gray-400 rounded bg-gray-100 dark:bg-neutral-950" {...register('email', { required: 'Email is required' })} />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div className="relative">
                    <label htmlFor="password" className="block mb-1 text-sm">Password</label>
                    <input id="password" type={showLoginPassword ? "text" : "password"} placeholder="Enter your password" className="w-full px-4 py-2 border border-gray-400 rounded bg-gray-100 dark:bg-neutral-950" {...register('password', { required: 'Password is required' })} />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute cursor-pointer right-3 top-9 text-gray-600 dark:text-gray-300">
                      {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                  </div>
                  <div className="flex justify-end mt-2">
                    <button type='button' onClick={() => setShowForgotEmail(true)} className="text-sm text-sky-600 hover:underline">Forgot Password?</button>
                  </div>
                  <div className="flex justify-center">
                    <button type="submit" className="w-full py-2 px-6 border border-gray-600 bg-sky-500 text-white rounded hover:bg-sky-600">Login</button>
                  </div>
                </form>
              </>
            )}
            {showForgotEmail && !showOtp && !otpVerified && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-center">Forgot Password</h2>
                <form onSubmit={handleSubmit(getOtp)} className="space-y-4">
                  <div>
                    <label htmlFor="forgotEmail" className="block mb-1 text-sm">Enter Registered Email</label>
                    <input id="forgotEmail" type="email" placeholder="Enter your email" className="w-full px-4 py-2 border border-gray-400 rounded bg-gray-100 dark:bg-neutral-950" {...register('email', { required: 'Email is required' })} />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <button type="submit" className="w-full py-2 px-4 border border-gray-600 bg-sky-500 text-white rounded hover:bg-sky-600">Send OTP</button>
                </form>
              </>
            )}
            {showOtp && !otpVerified && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-center">Enter OTP</h2>
                <form onSubmit={handleSubmit(onOtpSubmit)} className="space-y-4">
                  <div>
                    <input id="otp" type="text" placeholder="Enter OTP" className="w-full px-4 py-2 border border-gray-400 rounded bg-gray-100 dark:bg-neutral-950" {...register('otp', { required: 'OTP is required' })} />
                    {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button disabled={resendCountdown > 0} type="button" onClick={resendOtpBtn} className="flex-1 py-2 px-4 border border-gray-600 bg-gray-400 rounded">
                      {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                    </button>
                    <button type="submit" disabled={!isOtpValidLength} className="flex-1 py-2 px-4 border border-gray-600 bg-sky-500 text-white rounded hover:bg-sky-600">Submit</button>
                  </div>
                </form>
              </>
            )}
            {otpVerified && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-center">Set New Password</h2>
                <form onSubmit={handleSubmit(onNewPassSubmit)} className="space-y-4">
                  <div className="relative">
                    <input id="newPassword" type={showNewPassword ? "text" : "password"} placeholder="New Password" {...register('newPassword', { required: 'New password is required' })} className="w-full px-4 py-2 border border-gray-400 rounded bg-gray-100 dark:bg-neutral-950" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute cursor-pointer right-3 top-3 text-gray-600 dark:text-gray-300">
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
                  </div>
                  <div className="relative">
                    <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" {...register('confirmPassword', { required: 'Confirm password is required', validate: (value) => value === watch('newPassword') || 'Passwords do not match' })} className="w-full px-4 py-2 border border-gray-400 rounded bg-gray-100 dark:bg-neutral-950" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute cursor-pointer right-3 top-3 text-gray-600 dark:text-gray-300">
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                  <input type="hidden" value={watch('email')} {...register('email')} />
                  <button type="submit" className="w-full py-2 px-4 border border-gray-600 bg-sky-500 text-white rounded hover:bg-sky-600">Set New Password</button>
                </form>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}