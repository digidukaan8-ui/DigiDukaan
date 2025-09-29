import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Recaptcha } from '../../components'
import { useState } from 'react';
import { toast } from 'react-hot-toast'
import useLoaderStore from '../../store/loader';
import { sendMessage } from '../../api/user'

export default function Contact() {
  const [captchaToken, setCaptchaToken] = useState("");
  const { startLoading, stopLoading } = useLoaderStore();

  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const onSubmit = async (data) => {
    startLoading('message');
    if (!captchaToken) {
      toast.error("Please complete the captcha");
      return;
    }
    try {
      const result = await sendMessage({ ...data, captchaToken });
      if (result.success) {
        toast.success('Message sent successfully!');
        reset();
      }
    } finally {
      stopLoading();
    }
  }

  return (
    <div className="min-h-screen pb-20 pt-40 flex justify-center items-center bg-gray-100 text-black dark:bg-neutral-950 dark:text-white">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ willChange: "transform, opacity" }}
        className="w-full max-w-lg mx-5 p-6 rounded-lg shadow-md border border-black dark:border-white bg-white dark:bg-neutral-900 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
          Contact Us
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              autoComplete='name'
              className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-neutral-950 dark:border-gray-400 text-black dark:text-white"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete='email'
              className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-neutral-950 dark:border-gray-400 text-black dark:text-white"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="message" className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              placeholder="Write your message..."
              className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-neutral-950 dark:border-gray-400 text-black dark:text-white"
              {...register('message', { required: 'Message is required' })}
            ></textarea>
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
          </div>

          <div className='flex justify-center items-center'>
            <Recaptcha onVerify={handleCaptchaVerify} />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-sky-500 text-white border border-black dark:border-white rounded hover:bg-sky-600 transition-all"
            >
              Send Message
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}