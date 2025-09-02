import { Loader2 } from "lucide-react";
import useLoaderStore from "../store/loader";

export default function Loader() {
  const { isLoading, variant } = useLoaderStore();

  if (!isLoading) return null;

  const messages = {
    login: "Logging in...",
    logout: "Logging out...",
    register: "Creating your account...",
    store: "Creating your store...",
    updateStore: "Updating store...",
    product: "Adding new product...",
    updateProduct: "Updating product...",
    removeProduct: "Removing product...",
    usedProduct: "Adding used product...",
    updateUsedProduct: "Updating used product...",
    removeUsedProduct: "Removing used product...",
    fetching: "Fetching product...",
    zone: "Adding new zone...",
    updateZone: "Updating delivery zone...",
    removeZone: "Removing delivery zone...",
    orders: "Fetching your orders...",
    cart: "Updating cart...",
    default: "Loading...",
  };

  const colors = {
    login: "text-blue-500",
    logout: "text-cyan-500",
    register: "text-green-500",
    store: "text-cyan-500",
    updateStore: "text-cyan-500",
    fetching: "text-sky-500",
    product: "text-green-500",
    updateProduct: "text-green-500",
    removeProduct: "text-green-500",
    usedProduct: "text-green-500",
    updateUsedProduct: "text-green-500",
    removeUsedProduct: "text-green-500",
    zone: "text-purple-500",
    updateZone: "text-purple-500",
    removeZone: "text-purple-500",
    orders: "text-orange-500",
    cart: "text-pink-500",
    default: "text-gray-500",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className={`flex items-center space-x-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg ${colors[variant]}`}>
        <Loader2 className="animate-spin h-6 w-6" />
        <span className="font-medium">{messages[variant]}</span>
      </div>
    </div>
  );
}