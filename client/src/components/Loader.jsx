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
    removeProduct: "text-cyan-500",
    changeAval: "text-cyan-500",
    usedProduct: "text-cyan-500",
    updateUsedProduct: "text-cyan-500",
    removeUsedProduct: "text-cyan-500",
    fetchLoc: "text-purple-500",
    fetchLocIp: "text-purple-500",
    zone: "text-purple-500",
    updateZone: "text-purple-500",
    removeZone: "text-purple-500",
    message: "text-sky-500",
    orders: "text-sky-500",
    addToWishlist: "text-sky-500",
    removeFromWishlist: "text-sky-500",
    addToCart: "text-purple-500",
    updateCart: "text-purple-500",
    removeCart: "text-purple-500",
    fetchCart: "text-purple-500",
    fetchAddress: "text-purple-500",
    addAddress: "text-purple-500",
    updateAddress: "text-purple-500",
    getAddress: "text-purple-500",
    changeAvatar: "text-purple-500",
    removeAvatar: "text-purple-500",
    updateProfile: "text-purple-500",
    default: "text-gray-500",
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex flex-col items-center space-y-3 p-6 rounded-2xl shadow-xl bg-white dark:bg-neutral-900 ${colors[variant]}`}
          >
            <Loader2 className="animate-spin h-10 w-10" />
            <span className="font-medium text-base">
              {messages[variant] || messages.default}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}