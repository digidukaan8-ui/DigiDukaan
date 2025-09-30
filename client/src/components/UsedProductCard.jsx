import { Heart, Truck, MessageCircle, Edit2, Trash2, Eye, CheckCircle, DollarSign, FileText, MoreVertical, IndianRupee, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeUsedProduct, addToWishlist, removeFromWishlist } from "../api/product";
import useLoaderStore from "../store/loader";
import { toast } from "react-hot-toast";
import useUsedProductStore from "../store/usedProduct";
import useAuthStore from "../store/auth";
import useWishlistStore from "../store/wishlist";
import useStores from "../store/stores";
import { payNow } from "../api/payment";
import { getPriceForUsedProduct } from "../utils/category";

export default function UsedProductCard({ product, userRole = "buyer", onQuickView }) {
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

  const discountValue = product.discount?.percentage || product.discount?.amount;
  const discountType = product.discount?.percentage ? "%" : "₹";
  const productIds = useWishlistStore((state) => state.wishlist.productIds);
  const isWishlisted = productIds?.includes(product._id);

  const isSold = product.isSold;

  const handleCardClick = () => navigate(`/used-product?productId=${product._id}`);

  const handleWishList = async (e) => {
    e.stopPropagation();
    if (!user?._id || !user?.name) {
      navigate(`/login`);
      toast.error("Login First");
      return;
    } else if (user?.role === "seller" || user?.role === "admin") {
      toast.error("Only for buyer");
      return;
    }

    if (isSold) {
      toast.error("Item is already sold!");
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

  const handleChatSeller = (e, storeId) => {
    e.stopPropagation();
    if (!user?._id || !user?.name) {
      navigate(`/login`);
      toast.error("Login First");
      return;
    } else if (user?.role === "seller" || user?.role === "admin") {
      toast.error("Only for buyer");
      return;
    }

    const store = useStores.getState().getStore(storeId);
    navigate(`/chat?storeId=${storeId}`, {
      state: {
        img: store[0]?.img?.url,
        name: store[0]?.name,
        seller: store[0]?.userId
      }
    });
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (userRole !== "seller") return;
    setIsSellerMenuOpen(false);
    navigate("/seller/used-product", { state: { initialData: product } });
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (userRole !== "seller") return;
    setIsSellerMenuOpen(false);
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

  const payAmount = async () => {
    const data = {
      storeId: product?.storeId,
      productId: product?._id
    }
    startLoading("creatingOrder");
    try {
      const result = await payNow(data);
      if (result.success) {
        startLoading('redirecting');
      }
    } finally {
      stopLoading()
    }
  }

  const handleQuickView = (e) => {
    e.stopPropagation();
    onQuickView();
  };

  const toggleSellerMenu = (e) => {
    e.stopPropagation();
    setIsSellerMenuOpen(prev => !prev);
  };

  const getSellerButtonClass = (color) => {
    return `flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors duration-200 w-full text-sm transform hover:scale-[1.02] 
      ${color === 'edit'
        ? 'bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:hover:bg-sky-700 border border-black dark:border-white'
        : ''
      }
      ${color === 'delete'
        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-700 border border-black dark:border-white'
        : ''
      }
      ${color === 'pay'
        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-700 border border-black dark:border-white'
        : ''
      }
        `;
  };

  let overlayStatus = null;
  if (isSold) {
    overlayStatus = { text: "SOLD", color: "bg-green-900/70" };
  } else if (!product?.paid) {
    const amount = getPriceForUsedProduct(product.category?.name, product.subCategory?.name);
    overlayStatus = { text: `PAYMENT DUE ₹ ${amount}`, color: "bg-yellow-600/70" };
  }

  return (
    <div
      className={`bg-white dark:bg-neutral-900 rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden flex flex-col w-full max-w-[320px] relative border border-black dark:border-white transition-all duration-300 cursor-pointer group transform hover:-translate-y-2`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsSellerMenuOpen(false);
      }}
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

          {overlayStatus && (
            <div className={`absolute inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-40`}>
              <div className={`text-white ${overlayStatus.color} transform -rotate-12 flex flex-col items-center justify-center p-6 border-4 border-white border-dashed rounded-xl shadow-2xl`}>
                <AlertTriangle className="h-10 w-10 mb-2" />
                <span className="text-xl w-62 text-center font-extrabold uppercase tracking-widest">
                  {overlayStatus.text}
                </span>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 z-10">
            {hasDiscount > 0 && (
              <span className="bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                -{discountType === "₹" && "₹"}{discountValue}
                {discountType === "%" && "%"} OFF
              </span>
            )}
          </div>

          {product.deliveryCharge === 0 && (
            <div className="absolute bottom-4 left-4 z-10">
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Truck size={12} />
                Free Delivery
              </span>
            </div>
          )}

          {userRole === "buyer" && !isSold && (
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={(e) => handleWishList(e)}
                className={`p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-110 
                                    ${isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500'
                  }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}

          {userRole === "seller" && (
            <div className="absolute top-4 right-4 z-[60]" onClick={e => e.stopPropagation()}>
              <button
                onClick={toggleSellerMenu}
                className={`p-2.5 rounded-full shadow-lg cursor-pointer backdrop-blur-sm transition-all duration-300 
                                    ${isSellerMenuOpen
                    ? "bg-sky-600 text-white"
                    : "bg-white/90 text-gray-700 hover:bg-sky-500/90 hover:text-white"
                  }`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {isSellerMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-2xl p-3 space-y-2 border border-black dark:border-white z-[65]"
                  onMouseLeave={() => setIsSellerMenuOpen(false)}
                >
                  <button onClick={handleEditClick} className={getSellerButtonClass('edit')}>
                    <Edit2 className="h-4 w-4" /> Edit Listing
                  </button>
                  <button onClick={handleDeleteClick} className={getSellerButtonClass('delete')}>
                    <Trash2 className="h-4 w-4" /> Delete Listing
                  </button>
                  {!product?.paid && (
                    <button onClick={payAmount} className={getSellerButtonClass('pay')}>
                      <IndianRupee className="h-4 w-4" /> Pay Amount
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-center pb-6 transition-opacity duration-300 z-50 ${isHovered ? 'opacity-100' : 'opacity-0'
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
        </div>
      </div>

      <div className="flex flex-col flex-grow p-5">
        <div className="mb-3">
          <div className="flex flex-wrap gap-2 mb-2">
            {product.condition && (
              <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full shadow-sm hover:scale-105 transition-transform">
                <CheckCircle className="w-3 h-3" />
                {product.condition}
              </span>
            )}
            {product.isNegotiable && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full shadow-sm hover:scale-105 transition-transform">
                <DollarSign className="w-3 h-3" />
                Negotiable
              </span>
            )}
            {product.billAvailable && (
              <span className="flex items-center gap-1 text-xs font-semibold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full shadow-sm hover:scale-105 transition-transform">
                <FileText className="w-3 h-3" />
                Bill Available
              </span>
            )}
            {product?.delivery?.shippingLocations?.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full shadow-sm hover:scale-105 transition-transform">
                <Truck className="w-3 h-3" />
                Shipping Available
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
            {hasDiscount > 0 && (
              <span className="line-through text-gray-500 dark:text-gray-400 text-base">
                ₹{product.price.toFixed(2)}
              </span>
            )}
            {hasDiscount > 0 && (
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
              onClick={(e) => handleChatSeller(e, product.storeId)}
              disabled={isSold}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
            >
              <MessageCircle className="h-5 w-5" />
              {isSold ? "SOLD" : "Chat with Seller"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}