import { ShoppingCart, Star, Edit2, Trash2, Eye, Heart, Truck, AlertTriangle, MoreVertical, Layers } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeProduct, changeAvailability, removeFromWishlist, addToWishlist } from "../api/product";
import useLoaderStore from "../store/loader";
import { toast } from "react-hot-toast";
import useProductStore from "../store/product";
import useAuthStore from "../store/auth";
import useWishlistStore from "../store/wishlist";
import { addToCart } from "../api/product";
import useCartStore from "../store/cart";

export default function Card({ product, userRole = "buyer", onQuickView }) {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoaderStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSellerMenuOpen, setIsSellerMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const { wishlist } = useWishlistStore();

  const hasDiscount = product.discount?.percentage || product.discount?.amount;
  const finalPrice = hasDiscount
    ? product.discount?.percentage
      ? product.price - (product.price * product.discount.percentage) / 100
      : product.price - product.discount.amount
    : product.price;

  const rating = product.rating || 0;
  const discountValue = product.discount?.percentage || product.discount?.amount;
  const discountType = product.discount?.percentage ? "%" : "₹";
  const productIds = useWishlistStore((state) => state.wishlist.productIds);
  const isWishlisted = productIds?.includes(product._id);
  const isAvailable = product.isAvailable;
  const stock = product.stock;

  const handleCardClick = (product) => {
    navigate(`/product?productId=${product._id}`);
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
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

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAvailable || stock <= 0) {
      toast.error("Product is currently unavailable or out of stock.");
      return;
    }

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
      const result = await addToCart(product._id, 1);
      if (result?.success) {
        useCartStore.getState().addToCart(result.data);
        toast.success("Product added to cart");
      }
    } finally {
      stopLoading();
    }
  };

  const handleCartBtn = (id) => {
    let productId = useCartStore.getState().getIdFromCart() || [];
    if (productId.includes(id) && isAvailable && stock > 0) {
      return true;
    }
    return false;
  }

  const handleEdit = (e, product) => {
    e.stopPropagation();
    if (userRole !== "seller") return;
    setIsSellerMenuOpen(false);
    navigate("/seller/new-product", { state: { initialData: product } });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (userRole !== "seller") return;
    setIsSellerMenuOpen(false);
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
    if (userRole !== "seller") return;
    setIsSellerMenuOpen(false);
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
    if (userRole !== "seller") return;
    setIsSellerMenuOpen(false);
    navigate("/seller/add-variants", { state: { product } });
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    onQuickView();
  };

  const toggleSellerMenu = (e) => {
    e.stopPropagation();
    setIsSellerMenuOpen(prev => !prev);
  };

  const getSellerButtonClass = (color) => {
    return `flex cursor-pointer items-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 w-full text-sm transform hover:scale-[1.02] active:scale-95
        ${color === 'edit'
        ? 'bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-800/50'
        : ''
      }
        ${color === 'delete'
        ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/50'
        : ''
      }
        ${color === 'variants'
        ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800/50'
        : ''
      }
        ${color === 'avail'
        ? (isAvailable
          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-800/50'
          : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800/50')
        : ''
      }
    `;
  };

  return (
    <div
      className={`bg-white dark:bg-neutral-900 rounded-2xl shadow-md hover:shadow-xl overflow-hidden flex flex-col w-full max-w-[320px] relative border border-gray-200 dark:border-neutral-800 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsSellerMenuOpen(false);
      }}
      onClick={() => handleCardClick(product)}
    >
      <div className="relative w-full h-64 overflow-hidden bg-gray-100 dark:bg-neutral-950">
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

          {(!isAvailable || stock <= 0) && (
            <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-40">
              <div className="text-white bg-red-600/90 transform -rotate-12 flex flex-col items-center justify-center px-8 py-6 border-4 border-white border-dashed rounded-xl shadow-2xl">
                <AlertTriangle className="h-10 w-10 mb-2" />
                <span className="text-2xl text-center font-extrabold uppercase tracking-widest">
                  {!isAvailable ? "Not Available" : "Out of Stock"}
                </span>
              </div>
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {hasDiscount > 0 && (
              <span className="bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                {discountType === "₹" && "₹"}{discountValue}{discountType === "%" && "%"} OFF
              </span>
            )}
            {isAvailable && stock > 0 && stock <= 5 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                Only {stock} left
              </span>
            )}
          </div>

          {userRole === "buyer" && isAvailable && stock > 0 && (
            <div className="absolute top-3 right-3 z-[60]">
              <button
                onClick={(e) => handleWishlistToggle(e)}
                className={`p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white/95 dark:bg-neutral-800/95 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400"
                  }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
          )}

          {userRole === "seller" && (
            <div className="absolute top-3 right-3 z-[60]" onClick={e => e.stopPropagation()}>
              <button
                onClick={toggleSellerMenu}
                className={`p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 transform hover:scale-110
                ${isSellerMenuOpen
                    ? "bg-sky-600 dark:bg-sky-700 text-white"
                    : "bg-white/95 dark:bg-neutral-800/95 text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400"
                  }`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {isSellerMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-2 space-y-1.5 border border-gray-200 dark:border-neutral-800 z-[65]"
                  onMouseLeave={() => setIsSellerMenuOpen(false)}
                >
                  <button onClick={(e) => handleEdit(e, product)} className={getSellerButtonClass('edit')}>
                    <Edit2 className="h-4 w-4" /> Edit Product
                  </button>
                  <button onClick={(e) => toggleAvailability(e, product._id, !isAvailable)} className={getSellerButtonClass('avail')}>
                    <AlertTriangle className="h-4 w-4" /> {isAvailable ? "Mark Unavailable" : "Mark Available"}
                  </button>
                  <button onClick={(e) => manageVariants(e, product)} className={getSellerButtonClass('variants')}>
                    <Layers className="h-4 w-4" /> Manage Variants
                  </button>
                  <button onClick={(e) => handleDelete(e, product._id)} className={getSellerButtonClass('delete')}>
                    <Trash2 className="h-4 w-4" /> Delete Product
                  </button>
                </div>
              )}
            </div>
          )}

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-6 transition-opacity duration-300 z-50 ${isHovered ? "opacity-100" : "opacity-0"
              }`}
          >
            <button
              onClick={(e) => handleQuickView(e)}
              className={`bg-white dark:bg-neutral-900 cursor-pointer text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all duration-300 font-medium text-sm flex items-center gap-2 transform border border-gray-200 dark:border-neutral-800 ${isHovered ? "translate-y-0" : "translate-y-5"
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
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-2.5 py-1 rounded-full border border-sky-200 dark:border-sky-800/50">
              {product.brand}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{product.category.name}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">{product.description}</p>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {rating > 0 ? rating.toFixed(1) : "New"}
          </span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{finalPrice.toFixed(2)}
            </span>
            {hasDiscount > 0 && (
              <>
                <span className="line-through text-gray-500 dark:text-gray-400 text-sm">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                  Save ₹{(product.price - finalPrice).toFixed(2)}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
            <Truck size={14} className="text-sky-500 dark:text-sky-400" />
            <span>{product.deliveryCharge > 0 ? `Delivery: ₹${product.deliveryCharge}` : "Free Delivery"}</span>
          </div>

          {userRole === "seller" && (
            <div className="mb-3">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full">
                Stock: {stock}
              </span>
            </div>
          )}

          {userRole === "buyer" && (
            <button
              onClick={handleAddToCart}
              disabled={handleCartBtn(product._id) || !isAvailable || stock <= 0}
              className="w-full flex items-center cursor-pointer justify-center gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 border border-gray-200 dark:border-neutral-800"
            >
              <ShoppingCart className="h-5 w-5" />
              {handleCartBtn(product._id) ? "Added to Cart" : (!isAvailable || stock <= 0 ? "Out of Stock" : "Add to Cart")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}