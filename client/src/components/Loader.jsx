import { Loader2 } from "lucide-react";
import useLoaderStore from "../store/loader";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Loader() {
  const { isLoading, variant } = useLoaderStore();

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [isLoading]);

  const messages = {
    login: "Logging in...",
    sendOTP: "Sending OTP...",
    verifyOTP: "Verifying OTP...",
    resetPassword: "Reseting Password...",
    logout: "Logging out...",
    register: "Creating your account...",
    store: "Creating your store...",
    updateStore: "Updating store...",
    product: "Adding new product...",
    updateProduct: "Updating product...",
    removeProduct: "Removing product...",
    usedProduct: "Adding used product...",
    changeAval: "Changing product availability...",
    updateUsedProduct: "Updating used product...",
    removeUsedProduct: "Removing used product...",
    fetching: "Fetching product...",
    fetchLoc: "Fetching location through GPS...",
    fetchLocIp: "Fetching location through IP...",
    zone: "Adding new zone...",
    updateZone: "Updating delivery zone...",
    removeZone: "Removing delivery zone...",
    message: "Sending your message...",
    orders: "Fetching your orders...",
    addToWishlist: "Adding to wishlist...",
    removeFromWishlist: "Removing from wishlist...",
    addToCart: "Adding product to cart...",
    updateCart: "Updating cart details...",
    removeCart: "Removing product from cart...",
    fetchCart: "Fetching cart details...",
    fetchAddress: "Fetching Addresses...",
    addAddress: "Adding Address...",
    updateAddress: "Updating Address...",
    removeAddress: "Removing Address...",
    changeAvatar: "Changing Avatar...",
    removeAvatar: "Removing Avatar...",
    updateProfile: "Updating Profile...",
    creatingOrder: "Creating Order...",
    redirecting: "Redirecting...",
    confirmingPayment: "Confirming Payment...",
    fetchStoreCharges: "Fetching Store Charges...",
    fetchOrder: "Fetching Orders...",
    default: "Loading...",
  };

  const colors = {
    login: "text-blue-500",
    sendOTP: "text-blue-500",
    verifyOTP: "text-blue-500",
    resetPassword: "text-blue-500",
    logout: "text-cyan-500",
    register: "text-cyan-500",
    store: "text-cyan-500",
    updateStore: "text-cyan-500",
    fetching: "text-sky-500",
    product: "text-cyan-500",
    updateProduct: "text-cyan-500",
    removeProduct: "text-red-500",
    changeAval: "text-cyan-500",
    usedProduct: "text-cyan-500",
    updateUsedProduct: "text-cyan-500",
    removeUsedProduct: "text-red-500",
    fetchLoc: "text-purple-500",
    fetchLocIp: "text-purple-500",
    zone: "text-purple-500",
    updateZone: "text-purple-500",
    removeZone: "text-red-500",
    message: "text-sky-500",
    orders: "text-sky-500",
    addToWishlist: "text-pink-500",
    removeFromWishlist: "text-red-500",
    addToCart: "text-purple-500",
    updateCart: "text-purple-500",
    removeCart: "text-red-500",
    fetchCart: "text-purple-500",
    fetchAddress: "text-purple-500",
    addAddress: "text-purple-500",
    updateAddress: "text-purple-500",
    removeAddress: "text-red-500",
    changeAvatar: "text-purple-500",
    removeAvatar: "text-red-500",
    updateProfile: "text-purple-500",
    creatingOrder: "text-blue-500",
    redirecting: "text-blue-500",
    confirmingPayment: "text-emerald-500",
    fetchStoreCharges: "text-cyan-500",
    fetchOrder: "text-cyan-500",
    default: "text-gray-500",
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex flex-col items-center gap-4 p-6 rounded-2xl shadow-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 ${colors[variant] || colors.default}`}
          >
            <Loader2 className="animate-spin h-10 w-10" />
            <span className="font-semibold text-base text-gray-800 dark:text-gray-200">
              {messages[variant] || messages.default}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}