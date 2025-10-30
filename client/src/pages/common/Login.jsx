import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { loginUser, sendOtp, verifyOtp, resetPassword } from '../../api/user.js'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import useLoaderStore from '../../store/loader.js'
import { Recaptcha } from '../../components/index.js'

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
  const [captchaToken, setCaptchaToken] = useState("");

  const otpValue = watch('otp') || '';
  const isOtpValidLength = otpValue.length === 6;

  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token);
  };

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
    if (!captchaToken) {
      toast.error("Please complete the captcha");
      return;
    }
    startLoading("sendOTP")
    try {
      const result = await sendOtp({ email: data.email, captchaToken })
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
    <div className='min-h-screen pb-10 pt-30 flex justify-center items-center bg-gray-50 dark:bg-neutral-950 px-4'>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md p-6 rounded-lg shadow-sm border border-black dark:border-white bg-white dark:bg-neutral-900 space-y-4 relative">
        {(showForgotEmail || showOtp || otpVerified) && (
          <button onClick={goBack} className="absolute top-4 left-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition cursor-pointer">
            <FaArrowLeft size={18} />
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-4"
          >
            {!showForgotEmail && !showOtp && !otpVerified && (
              <>
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Login to your account</p>
                </div>
                <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email" 
                      autoComplete='email' 
                      className="w-full px-3 py-2 border border-black dark:border-white rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm" 
                      {...register('email', { required: 'Email is required' })} 
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div className="relative">
                    <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input 
                      id="password" 
                      type={showLoginPassword ? "text" : "password"} 
                      placeholder="Enter your password" 
                      className="w-full px-3 py-2 border border-black dark:border-white rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm pr-10" 
                      {...register('password', { required: 'Password is required' })} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowLoginPassword(!showLoginPassword)} 
                      className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
                    >
                      {showLoginPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type='button' 
                      onClick={() => setShowForgotEmail(true)} 
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm border border-black dark:border-white cursor-pointer"
                  >
                    Login
                  </button>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              </>
            )}
            {showForgotEmail && !showOtp && !otpVerified && (
              <>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Forgot Password</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your email to receive OTP</p>
                </div>
                <form onSubmit={handleSubmit(getOtp)} className="space-y-4">
                  <div>
                    <label htmlFor="forgotEmail" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input 
                      id="forgotEmail" 
                      type="email" 
                      placeholder="Enter your email" 
                      autoComplete='email' 
                      className="w-full px-3 py-2 border border-black dark:border-white rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm" 
                      {...register('email', { required: 'Email is required' })} 
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div className='flex justify-center items-center pt-2'>
                    <Recaptcha onVerify={handleCaptchaVerify} />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm border border-black dark:border-white cursor-pointer"
                  >
                    Send OTP
                  </button>
                </form>
              </>
            )}
            {showOtp && !otpVerified && (
              <>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Enter OTP</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Check your email for the code</p>
                </div>
                <form onSubmit={handleSubmit(onOtpSubmit)} className="space-y-4">
                  <div>
                    <input 
                      id="otp" 
                      type="text" 
                      placeholder="Enter 6-digit OTP" 
                      maxLength={6}
                      className="w-full px-3 py-2 border border-black dark:border-white rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-center tracking-widest" 
                      {...register('otp', { required: 'OTP is required' })} 
                    />
                    {errors.otp && <p className="text-red-500 text-xs mt-1 text-center">{errors.otp.message}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      disabled={resendCountdown > 0} 
                      type="button" 
                      onClick={resendOtpBtn} 
                      className="flex-1 py-2.5 px-4 bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm border border-black dark:border-white cursor-pointer"
                    >
                      {resendCountdown > 0 ? `Resend (${resendCountdown}s)` : 'Resend OTP'}
                    </button>
                    <button 
                      type="submit" 
                      disabled={!isOtpValidLength} 
                      className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm border border-black dark:border-white cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </form>
              </>
            )}
            {otpVerified && (
              <>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Set New Password</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create a strong password</p>
                </div>
                <form onSubmit={handleSubmit(onNewPassSubmit)} className="space-y-4">
                  <div className="relative">
                    <label htmlFor="newPassword" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                    <input 
                      id="newPassword" 
                      type={showNewPassword ? "text" : "password"} 
                      placeholder="Enter new password" 
                      {...register('newPassword', { required: 'New password is required' })} 
                      className="w-full px-3 py-2 border border-black dark:border-white rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm pr-10" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPassword(!showNewPassword)} 
                      className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                    >
                      {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                    {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                  </div>
                  <div className="relative">
                    <label htmlFor="confirmPassword" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                    <input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm new password" 
                      {...register('confirmPassword', { 
                        required: 'Confirm password is required', 
                        validate: (value) => value === watch('newPassword') || 'Passwords do not match' 
                      })} 
                      className="w-full px-3 py-2 border border-black dark:border-white rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm pr-10" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
                    >
                      {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                  <input type="hidden" value={watch('email')} {...register('email')} />
                  <button 
                    type="submit" 
                    className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm border border-black dark:border-white cursor-pointer"
                  >
                    Reset Password
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}