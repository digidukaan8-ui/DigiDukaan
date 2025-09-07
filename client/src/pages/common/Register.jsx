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
  } = useForm()

  const password = watch('password');

  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token);
  };

  const onSubmit = async (data) => {
    startLoading('register');
    const { confirmPassword, ...cleanData } = data;
    if (!captchaToken) {
      toast.error("Please complete the captcha");
      return;
    }

    const finalData = {
      ...cleanData,
      mobile: `+91${cleanData.mobile}`,
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
    <div className="min-h-screen py-20 flex justify-center items-center bg-gray-100 text-black dark:bg-neutral-950 dark:text-white">
      <motion.form
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ willChange: "transform, opacity" }}
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm mx-5 p-6 rounded-lg shadow-md border border-black bg-white dark:bg-neutral-900 dark:border-white space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">Register</h2>

        <div>
          <label htmlFor="name">Name</label>
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
            className="w-full mt-1 p-2 border rounded bg-gray-100 dark:bg-neutral-950"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="username">Username</label>
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
            className="w-full mt-1 p-2 border rounded bg-gray-100 dark:bg-neutral-950"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
        </div>

        <div>
          <label htmlFor="email">Email</label>
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
            className="w-full mt-1 p-2 border rounded bg-gray-100 dark:bg-neutral-950"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
              maxLength: { value: 20, message: 'Maximum 20 characters' },
            })}
            className="w-full mt-1 p-2 border rounded bg-gray-100 dark:bg-neutral-950"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: 'Please confirm password',
              validate: value => value === password || 'Passwords do not match',
            })}
            className="w-full mt-1 p-2 border rounded bg-gray-100 dark:bg-neutral-950"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
        </div>

        <div>
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            {...register('role', { required: 'Role is required' })}
            className="w-full mt-1 p-2 border rounded bg-gray-100 dark:bg-neutral-950"
          >
            <option value="">Select role</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
        </div>

        <div>
          <label htmlFor="mobile">Mobile Number</label>
          <div className="flex items-center space-x-2">
            <span className="p-2 border rounded bg-gray-100 dark:bg-neutral-950 select-none">+91</span>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              placeholder="1234567890"
              autoComplete="tel"
              maxLength={10}
              {...register('mobile', {
                required: 'Mobile number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Must be 10 digits',
                },
              })}
              className="w-full p-2 border rounded bg-gray-100 dark:bg-neutral-950"
            />
          </div>
          {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile.message}</p>}
        </div>

        <div className='flex justify-center items-center'>
          <Recaptcha onVerify={handleCaptchaVerify} />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-sky-500 text-white border border-black dark:border-white rounded shadow-md hover:bg-sky-600 hover:shadow-xl"
        >
          Register
        </button>
      </motion.form>
    </div >
  )
}

export default Register;