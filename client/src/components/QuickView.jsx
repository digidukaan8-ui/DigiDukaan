import { X, ShoppingCart, Heart, Star } from "lucide-react";
import { addToCart } from "../api/product";
import useCartStore from "../store/cart";
import useAuthStore from "../store/auth";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import useLoaderStore from "../store/loader";

export default function QuickView({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoaderStore();

  const hasDiscount = product.discount?.percentage || product.discount?.amount;
  const finalPrice = hasDiscount
    ? product.discount?.percentage
      ? product.price - (product.price * product.discount.percentage) / 100
      : product.price - product.discount.amount
    : product.price;

  const rating = product.rating || 0;

  const handleCart = async (id) => {
    if (!user) {
      navigate(`/login`);
      toast.error("Login First");
      return;
    } else if (user?.role === "seller" || user?.role === "admin") {
      toast.error("Only for buyer");
      return;
    }
    startLoading("addToCart");
    try {
      const result = await addToCart(id, 1);
      if (result.success) {
        useCartStore.getState().addToCart(result.data);
        toast.success("Product added to cart");
      }
    } finally {
      onClose();
      stopLoading();
    }
  };

  const handleWishList = (id) => {
    if (!user) {
      navigate(`/login`);
      toast.error("Login First");
      return;
    } else if (user?.role === "seller" || user?.role === "admin") {
      toast.error("Only for buyer");
      return;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative border border-black dark:border-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 transition"
        >
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="flex justify-center items-center h-60">
            <img
              src={product.img?.[0]?.url}
              alt={product.title}
              className="w-full h-50 object-cover rounded-lg border border-black dark:border-white"
            />
          </div>

          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {product.title}
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {rating > 0 ? rating.toFixed(1) : "New"}
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
              {product.description}
            </p>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{finalPrice.toFixed(2)}
              </span>
              {hasDiscount > 0 && (
                <span className="line-through text-gray-500 dark:text-gray-400">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleCart(product._id)}
                className="flex items-center gap-2 flex-1 justify-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition border border-black dark:border-white">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
              <button
                onClick={() => handleWishList(product._id)}
                className="p-3 rounded-lg border border-black dark:border-white hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                <Heart className="h-5 w-5 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}