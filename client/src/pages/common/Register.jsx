import { useForm } from 'react-hook-form'
import { registerUser } from '../../api/user.js'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import useLoaderStore from '../../store/loader.js'
import { Recaptcha } from '../../components/index.js'
import { useState } from 'react'

const Register = () => {
  const { startLoading, stopLoading } = useLoaderStore();
  const [captchaToken, setCaptchaToken] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      phone: "+91"
    }
  })

  const password = watch('password');

  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token);
  };

  const onSubmit = async (data) => {
    startLoading('register');
    const { confirmPassword, ...cleanData } = data;
    if (!captchaToken) {
      toast.error("Please complete the captcha");
      stopLoading();
      return;
    }

    const finalData = {
      ...cleanData,
      captchaToken
    };
    try {
      const result = await registerUser(finalData);
      if (result.success) {
        reset();
        setTimeout(() => {
          navigate('/login')
          toast.success('Registered successfully!');
        }, 500);
      }
    } finally {
      stopLoading();
    }
  }

  return (
    <div className="min-h-screen pb-20 pt-40 flex justify-center items-center bg-gray-50 dark:bg-neutral-950 px-4">
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md p-6 rounded-lg shadow-sm border border-black dark:border-white bg-white dark:bg-neutral-900 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Create Account</h2>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">Sign up to get started</p>

        <div>
          <label htmlFor="name" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <input
            id="name"
            name="name"
            placeholder="Enter your name"
            autoComplete="name"
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 3, message: 'Minimum 3 letters' },
              maxLength: { value: 15, message: 'Maximum 15 letters' },
              pattern: {
                value: /^[A-Za-z\s]+$/,
                message: 'Only letters and spaces allowed',
              },
            })}
            className="w-full px-3 py-2 border border-black dark:border-white rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="username" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <input
            id="username"
            name="username"
            placeholder="Enter username"
            autoComplete="username"
            {...register('username', {
              required: 'Username is required',
              minLength: { value: 5, message: 'Minimum 5 characters' },
              maxLength: { value: 10, message: 'Maximum 10 characters' },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Only letters, numbers, and _ allowed',
              },
            })}
            className="w-full px-3 py-2 border border-black dark:border-white rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
          />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format',
              },
            })}
            className="w-full px-3 py-2 border border-black dark:border-white rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
                maxLength: { value: 20, message: 'Maximum 20 characters' },
              })}
              className="w-full px-3 py-2 border border-black dark:border-white rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: value => value === password || 'Passwords do not match',
              })}
              className="w-full px-3 py-2 border border-black dark:border-white rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+919876543210"
            {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: /^\+91[6-9]\d{9}$/,
                message: 'Invalid phone number format (+91 followed by 10 digits)',
              },
            })}
            className="w-full px-3 py-2 border border-black dark:border-white rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="role" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
          <select
            id="role"
            name="role"
            {...register('role', { required: 'Role is required' })}
            className="w-full px-3 py-2 border border-black dark:border-white rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
          >
            <option value="">Select role</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
        </div>

        <div className='flex justify-center items-center pt-2'>
          <Recaptcha onVerify={handleCaptchaVerify} />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm border border-black dark:border-white cursor-pointer"
        >
          Create Account
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
          >
            Login
          </button>
        </p>
      </motion.form>
    </div>
  )
}

export default Register;