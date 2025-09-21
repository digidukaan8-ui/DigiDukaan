import { X, ShoppingCart, Heart, Star, MessageCircle } from "lucide-react";
import { addToCart, addToWishlist, removeFromWishlist, addToViewed } from "../api/product";
import useCartStore from "../store/cart";
import useAuthStore from "../store/auth";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import useLoaderStore from "../store/loader";
import useWishlistStore from "../store/wishlist";
import { useEffect } from "react";

export default function QuickView({ product, type, isOpen, onClose }) {
  if (!isOpen || !product) return null;
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoaderStore();
  const { wishlist } = useWishlistStore();

  const hasDiscount = product.discount?.percentage || product.discount?.amount;
  const finalPrice = hasDiscount
    ? product.discount?.percentage
      ? product.price - (product.price * product.discount.percentage) / 100
      : product.price - product.discount.amount
    : product.price;

  const rating = product.rating || 0;
  const productIds = useWishlistStore((state) => state.wishlist.productIds);
  const isWishlisted = productIds.includes(product._id);

  useEffect(() => {
    if (!product?._id) return;

    const addToRecentlyViewed = async () => {
      try {
        await addToViewed(product._id);
      } catch (err) {
        console.error("Error adding to viewed:", err);
      }
    };

    addToRecentlyViewed();
  }, [product?._id]);

  const handleWishList = async () => {
    if (!user?._id || !user?.name) {
      navigate(`/login`);
      toast.error("Login First");
      return;
    } else if (user?.role === "seller" || user?.role === "admin") {
      toast.error("Only for buyer");
      return;
    }

    if (isWishlisted) {
      startLoading("removeFromWishlist");
      try {
        const result = await removeFromWishlist(wishlist._id, product._id);
        if (result.success) {
          useWishlistStore.getState().removeFromWishlist(product._id);
          toast.success("Product removed from wishlist");
        }
      } finally {
        stopLoading();
      }
    } else {
      startLoading("addToWishlist");
      try {
        const result = await addToWishlist(product._id);
        if (result.success) {
          useWishlistStore.getState().addToWishlist(
            result.data._id,
            product._id
          );
          toast.success("Product added to wishlist");
        }
      } finally {
        stopLoading();
      }
    }
  };

  const handleCart = async (id) => {
    if (!user?._id || !user?.name) {
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

  const handleCartBtn = (id) => {
    let productId = useCartStore.getState().getIdFromCart() || [];
    if (productId.includes(id)) {
      return true;
    } else {
      return false;
    }
  }

  const handleChatSeller = () => {
    if (!user?._id || !user?.name) {
      navigate(`/login`);
      toast.error("Login First");
      return;
    } else if (user?.role === "seller" || user?.role === "admin") {
      toast.error("Only for buyer");
      return;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-30 p-4">
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

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{finalPrice.toFixed(2)}
              </span>
              {hasDiscount > 0 && (
                <span className="line-through text-gray-500 dark:text-gray-400">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex justify-center items-center gap-3 mt-4">
              {type === "new" ? (
                <button
                  onClick={() => handleCart(product._id)}
                  disabled={handleCartBtn(product._id)}
                  className="w-full border border-black dark:border-white flex items-center cursor-pointer justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
              ) : (
                <button
                  onClick={handleChatSeller}
                  className={`flex items-center justify-center cursor-pointer border border-black dark:border-white w-60 gap-2 py-2 px-4 rounded-full font-semibold text-sm transition-all
                      ${isWishlisted
                      ? "bg-gray-400 text-gray-600 dark:bg-neutral-900 dark:text-gray-400 cursor-not-allowed"
                      : "bg-sky-500 text-white hover:bg-sky-600"}`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Start Chat
                </button>
              )}
              <button
                onClick={() => handleWishList()}
                className={`w-10 h-10 flex items-center justify-center cursor-pointer rounded-full border border-black dark:border-white transition-colors
                ${isWishlisted
                    ? "bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400"
                    : "bg-gray-100 text-gray-600 dark:bg-neutral-900 dark:text-gray-300 hover:bg-white dark:hover:bg-neutral-900"
                  }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}