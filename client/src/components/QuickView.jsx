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
        if (!user?._id || !user?.name) {
          navigate(`/login`);
          toast.error("Login First");
          return;
        } else if (user?.role === "seller" || user?.role === "admin") {
          return;
        }
        await addToViewed(product._id);
      } catch (err) {
        console.error("Error adding to viewed:", err);
      }
    };
    if (user?.role === "buyer") {
      addToRecentlyViewed();
    }
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[80] p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-3xl overflow-hidden relative border border-black dark:border-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full cursor-pointer bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition z-10"
        >
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="flex justify-center items-center bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
            <img
              src={product.img?.[0]?.url}
              alt={product.title}
              className="w-full h-64 object-contain rounded-lg"
            />
          </div>

          <div className="flex flex-col space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white pr-8">
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
                {rating > 0 ? `${rating.toFixed(1)} / 5` : "No ratings yet"}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {product.description}
            </p>

            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{finalPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base line-through text-gray-400 dark:text-gray-500">
                    ₹{product.price.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                    {product.discount?.percentage
                      ? `${product.discount.percentage}% OFF`
                      : `₹${product.discount.amount} OFF`}
                  </span>
                </>
              )}
            </div>

            {product.attributes && product.attributes.length > 0 && (
              <div className="space-y-1 pt-2">
                {product.attributes.slice(0, 3).map((attr, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {attr.key}:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {user?.role === "buyer" && (<div className="flex items-center gap-2 pt-4">
              {type === "new" ? (
                <button
                  onClick={() => handleCart(product._id)}
                  disabled={handleCartBtn(product._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-semibold transition text-sm border border-black dark:border-white cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {handleCartBtn(product._id) ? "Added to Cart" : "Add to Cart"}
                </button>
              ) : (
                <button
                  onClick={handleChatSeller}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold transition text-sm border border-black dark:border-white cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat with Seller
                </button>
              )}
              <button
                onClick={() => handleWishList()}
                className={`p-2.5 rounded-lg border border-black dark:border-white transition cursor-pointer ${isWishlisted
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700"
                  }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>)}

            {type === "new" && product.stock && (
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                {product.stock > 10 ? "In Stock" : `Only ${product.stock} left`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}