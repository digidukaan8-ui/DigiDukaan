import { Heart, Truck, MessageCircle, Edit2, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeUsedProduct } from "../api/product";
import useLoaderStore from "../store/loader";
import { toast } from "react-hot-toast";
import useUsedProductStore from "../store/usedProduct";

export default function UsedProductCard({ product, userRole = "buyer", onQuickView }) {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoaderStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const hasDiscount = product.discount?.percentage || product.discount?.amount;
  const finalPrice = hasDiscount
    ? product.discount?.percentage
      ? product.price - (product.price * product.discount.percentage) / 100
      : product.price - product.discount.amount
    : product.price;

  const discountValue = product.discount?.percentage || product.discount?.amount;
  const discountType = product.discount?.percentage ? "%" : "₹";

  const handleCardClick = () => navigate(`/used-product?productId=${product._id}`);

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (userRole === "buyer") {
      setIsWishlisted(!isWishlisted);
      console.log(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    }
  };

  const handleChatSeller = (e) => {
    e.stopPropagation();
    if (userRole === "buyer") alert("Open chat modal here!");
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate("/seller/used-product", { state: { initialData: product } });
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    startLoading("removeUsedProduct");
    try {
      const result = await removeUsedProduct(product._id);
      if (result.success) {
        useUsedProductStore.getState().removeUsedProduct(product._id);
        toast.success("Used product removed successfully");
      }
    } finally {
      stopLoading();
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    onQuickView();
  };

  return (
    <div
      className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden flex flex-col w-full max-w-[320px] relative border border-black dark:border-white transition-all duration-300 cursor-pointer group transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative w-full h-64 overflow-hidden border-b border-b-black dark:border-b-white">
        <div className="relative w-full h-full">
          <img
            src={product.img?.[0]?.url}
            alt={product.title}
            className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            onLoad={() => setImageLoaded(true)}
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />

          {!imageLoaded && (
            <div className="w-full h-full bg-gray-200 dark:bg-neutral-800 animate-pulse flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-300 dark:bg-neutral-700 rounded-full animate-pulse"></div>
            </div>
          )}

          <div className="absolute top-4 left-4">
            {hasDiscount && (
              <span className="bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
                -{discountType === "₹" && "₹"}{discountValue}
                {discountType === "%" && "%"} OFF
              </span>
            )}
          </div>

          {userRole === "buyer" && (
            <div className="absolute top-4 right-4">
              <button
                onClick={handleWishlistToggle}
                className={`p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500'
                  }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-center pb-6 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <button
              onClick={handleQuickView}
              className={`bg-white/95 text-gray-800 px-4 py-2 rounded-full shadow-lg hover:bg-white transition-all duration-300 font-medium text-sm flex items-center gap-2 transform ${isHovered ? 'translate-y-0' : 'translate-y-5'
                }`}
            >
              <Eye size={16} />
              Quick View
            </button>
          </div>

          {product.deliveryCharge === 0 && (
            <div className="absolute bottom-4 left-4">
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Truck size={12} />
                Free Delivery
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-grow p-5">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {product.condition && (
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                {product.condition}
              </span>
            )}
            {product.isNegotiable && (
              <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                Negotiable
              </span>
            )}
            {product.billAvailable && (
              <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                Bill Available
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{finalPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="line-through text-gray-500 dark:text-gray-400 text-base">
                ₹{product.price.toFixed(2)}
              </span>
            )}
            {hasDiscount && (
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                Save ₹{(product.price - finalPrice).toFixed(2)}
              </span>
            )}
          </div>

          {product.deliveryCharge > 0 && (
            <div className="flex items-center gap-1 mb-3 text-xs text-gray-600 dark:text-gray-400">
              <Truck size={12} />
              <span>Delivery: ₹{product.deliveryCharge}</span>
            </div>
          )}

          {userRole === "buyer" && (
            <button
              onClick={handleChatSeller}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              <MessageCircle className="h-5 w-5" />
              Chat with Seller
            </button>
          )}

          {userRole === "seller" && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleEditClick}
                className="flex cursor-pointer items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex-1 justify-center transform hover:scale-105 active:scale-95 border"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex cursor-pointer items-center gap-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex-1 justify-center transform hover:scale-105 active:scale-95 border"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}