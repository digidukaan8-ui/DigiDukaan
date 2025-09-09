import { ShoppingCart, Star, Edit2, Trash2, Eye, Heart, Truck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeProduct, changeAvailability } from "../api/product";
import useLoaderStore from "../store/loader";
import { toast } from "react-hot-toast";
import useProductStore from "../store/product";
import useAuthStore from "../store/auth";
import { addToCart } from "../api/product";
import useCartStore from "../store/cart";

export default function Card({ product, userRole = "buyer", onQuickView }) {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoaderStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { user } = useAuthStore();

  const hasDiscount = product.discount?.percentage || product.discount?.amount;
  const finalPrice = hasDiscount
    ? product.discount?.percentage
      ? product.price - (product.price * product.discount.percentage) / 100
      : product.price - product.discount.amount
    : product.price;

  const rating = product.rating || 0;
  const discountValue = product.discount?.percentage || product.discount?.amount;
  const discountType = product.discount?.percentage ? "%" : "₹";

  const handleCardClick = (product) => {
    navigate(`/product?productId=${product._id}`);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate(`/login`);
      toast.error("Login First");
      return;
    } else if (user?.role === "seller" || user?.role === "admin") {
      toast.error("Only for buyer");
      return;
    }
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
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
      const result = await addToCart(product._id, 1);
      if (result.success) {
        useCartStore.getState().addToCart(result.data);
        toast.success("Product added to cart");
      }
    } finally {
      stopLoading();
    }
  };

  const handleEdit = (e, product) => {
    e.stopPropagation();
    if (!user) {
      navigate(`/login`);
      toast.error("Login First");
      return;
    } else if (user?.role === "buyer" || user?.role === "admin") {
      toast.error("Only for seller");
      return;
    }
    navigate("/seller/new-product", { state: { initialData: product } });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!user) {
      navigate(`/login`);
      toast.error("Login First");
      return;
    } else if (user?.role === "buyer" || user?.role === "admin") {
      toast.error("Only for seller");
      return;
    }
    if (window.confirm("Are you sure you want to delete this product?")) {
      startLoading("removeProduct");
      try {
        const result = await removeProduct(id);
        if (result.success) {
          useProductStore.getState().removeProduct(id);
          toast.success("Product removed successfully");
        }
      } finally {
        stopLoading();
      }
    }
  };

  const toggleAvailability = async (e, id, available) => {
    e.stopPropagation();
    if (!user) {
      navigate(`/login`);
      toast.error("Login First");
      return;
    } else if (user?.role === "buyer" || user?.role === "admin") {
      toast.error("Only for seller");
      return;
    }
    startLoading("changeAval");
    try {
      const result = await changeAvailability(id, available);
      if (result.success) {
        useProductStore.getState().updateProduct(result.data);
        toast.success("Availability changed successfully");
      }
    } finally {
      stopLoading();
    }
  };

  const manageVariants = (e, product) => {
    e.stopPropagation();
    navigate("/seller/add-variants", { state: { product } });
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    onQuickView();
  };

  return (
    <div
      className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden flex flex-col w-[300px] relative border border-black dark:border-white transition-all duration-300 cursor-pointer group transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleCardClick(product)}
    >
      <div className="relative w-full h-64 overflow-hidden border-b border-b-black dark:border-b-white">
        <div className="relative w-full h-full">
          <img
            src={product.img?.[0]?.url}
            alt={product.title}
            className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? "scale-110" : "scale-100"}`}
            onLoad={() => setImageLoaded(true)}
            style={{ display: imageLoaded ? "block" : "none" }}
          />
          {!imageLoaded && (
            <div className="w-full h-full bg-gray-200 dark:bg-neutral-800 animate-pulse flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-300 dark:bg-neutral-700 rounded-full animate-pulse"></div>
            </div>
          )}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {hasDiscount > 0 && (
              <span className="bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
                -{discountType === "₹" && "₹"}{discountValue}
                {discountType === "%" && "%"} OFF
              </span>
            )}
            {product.stock <= 0 && (
              <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Out of Stock</span>
            )}
            {product.isAvailable && product.stock > 0 && product.stock <= 5 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
                Only {product.stock} left
              </span>
            )}
          </div>
          {userRole === "buyer" && (
            <div className="absolute top-4 right-4">
              <button
                onClick={(e) => handleWishlistToggle(e)}
                className={`p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500"
                  }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
          )}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-center pb-6 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
              }`}
          >
            <button
              onClick={(e) => handleQuickView(e)}
              className={`bg-white/95 cursor-pointer text-gray-800 px-4 py-2 rounded-full shadow-lg hover:bg-white transition-all z-50 duration-300 font-medium text-sm flex items-center gap-2 transform ${isHovered ? "translate-y-0" : "translate-y-5"
                }`}
            >
              <Eye size={16} />
              Quick View
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-grow p-5">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
              {product.brand}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{product.category.name}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">{product.description}</p>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                />
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-400 font-medium">{rating > 0 ? rating.toFixed(1) : "New"}</span>
          </div>
        </div>
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{finalPrice.toFixed(2)}</span>
            {hasDiscount > 0 && (
              <span className="line-through text-gray-500 dark:text-gray-400 text-base">₹{product.price.toFixed(2)}</span>
            )}
            {hasDiscount > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Save ₹{(product.price - finalPrice).toFixed(2)}</span>
            )}
          </div>
          {product.deliveryCharge > 0 ? (
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
              <Truck size={14} className="text-sky-500" />
              <span>Delivery: ₹{product.deliveryCharge}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
              <Truck size={14} className="text-sky-500" />
              <span>Delivery: Free</span>
            </div>
          )}
          {userRole === "buyer" && (
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full flex items-center cursor-pointer justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              <ShoppingCart className="h-5 w-5" />
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          )}
          {userRole === "seller" && (
            <div className="flex flex-col gap-2">
              <div className="flex w-full justify-around items-center gap-3">
                <span className="w-full cursor-auto text-center px-4 py-2.5 text-sm font-semibold rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 shadow-sm border border-emerald-200 dark:border-emerald-800">
                  Stock: {product.stock}
                </span>

                <span
                  className={`w-full cursor-auto text-center px-4 py-2.5 text-sm font-semibold rounded-md shadow-sm border 
                  ${product.isAvailable
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800"
                      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800"
                    }`}
                >
                  {product.isAvailable ? "Available" : "Not Available"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleEdit(e, product)}
                  className="flex cursor-pointer items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex-1 justify-center transform hover:scale-105 active:scale-95 border"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => handleDelete(e, product._id)}
                  className="flex cursor-pointer items-center gap-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex-1 justify-center transform hover:scale-105 active:scale-95 border"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => toggleAvailability(e, product._id, !product.isAvailable)}
                  className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 border rounded-xl text-[11px] font-medium flex-1 justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${product.isAvailable
                    ? "bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400"
                    : "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400"
                    }`}
                >
                  {product.isAvailable ? "Mark Unavailable" : "Mark Available"}
                </button>
                <button
                  onClick={(e) => manageVariants(e, product)}
                  className="flex cursor-pointer items-center gap-2 bg-sky-100 dark:bg-sky-900/30 text-[11px] hover:bg-sky-200 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-400 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex-1 justify-center transform hover:scale-105 active:scale-95 border"
                >
                  Manage Variants
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}