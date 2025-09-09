import { useState } from 'react';
import { Heart, Share2, Star, ShoppingCart, ChevronLeft, ChevronRight, Play, Edit, Trash2, Plus, Minus } from 'lucide-react';
import useAuthStore from '../store/auth';
import useProductStore from '../store/product';
import { useNavigate } from 'react-router-dom';
import useLoaderStore from '../store/loader';
import { removeProduct, changeAvailability } from '../api/product';
import { toast } from 'react-hot-toast';
import useCategoryProductStore from '../store/categoryProducts';
import useCartStore from '../store/cart';

const ProductDetail = ({ id }) => {
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  let { user } = useAuthStore();
  const { startLoading, stopLoading } = useLoaderStore();
  let product = useProductStore.getState().getProduct(id);
  if (!product) {
    product = useCategoryProductStore.getState().getProductById(id);
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-950">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const {
    title,
    brand,
    description,
    price,
    discount,
    stock,
    attributes,
    img,
    video,
    tags,
    deliveryCharge,
    category,
    subCategory,
    rating,
    isAvailable,
  } = product;

  const hasDiscount = discount?.percentage || discount?.amount;
  const finalPrice = hasDiscount
    ? discount?.percentage
      ? price - (price * discount.percentage) / 100
      : price - discount.amount
    : price;
  const discountValue = product.discount?.percentage || product.discount?.amount;
  const discountType = product.discount?.percentage ? "%" : "₹";

  const nextImage = () => setSelectedImageIndex((prev) => (prev + 1) % img.length);
  const prevImage = () => setSelectedImageIndex((prev) => (prev - 1 + img.length) % img.length);

  const handleAddToCart = async (id) => {
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
      const result = await addToCart(id, quantity);
      if (result.success) {
        useCartStore.getState().addToCart(result.data);
        toast.success("Product added to cart");
      }
    } finally {
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
    setIsLiked(!isLiked);
  };

  const handleUpdateDetails = (product) => {
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

  const handleToggleAvailability = async (id, available) => {
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

  const handleDelete = async (id) => {
    if (!user) {
      navigate(`/login`);
      toast.error("Login First");
      return;
    } else if (user?.role === "buyer" || user?.role === "admin") {
      toast.error("Only for seller");
      return;
    }
    if (confirm("Are you sure you want to delete this product?")) {
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

  const handleManageVariant = () => {
    if (!user) {
      navigate(`/login`);
      toast.error("Login First");
      return;
    } else if (user?.role === "buyer" || user?.role === "admin") {
      toast.error("Only for seller");
      return;
    }
    alert("Add new variant");
  };

  if (!user) {
    user = { role: "buyer" };
  } else if (!user.role) {
    user.role = "buyer";
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 pt-32 pb-10">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
          <div className="flex flex-col">
            <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-md mb-4 flex items-center justify-center">
              {video ? (
                <video
                  src={typeof video === 'string' ? video : video.url}
                  controls
                  className="w-full h-auto object-contain max-h-[70vh]"
                />
              ) : (
                <img
                  src={img?.[selectedImageIndex]?.url}
                  alt={title}
                  className="w-full h-auto object-contain max-h-[70vh]"
                />
              )}

              {img && img.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/70 dark:bg-neutral-900/70 text-gray-800 dark:text-gray-200 rounded-full shadow-md hover:bg-white dark:hover:bg-neutral-900 transition-colors z-10"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/70 dark:bg-neutral-900/70 text-gray-800 dark:text-gray-200 rounded-full shadow-md hover:bg-white dark:hover:bg-neutral-900 transition-colors z-10"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </>
              )}
            </div>

            <div className="flex justify-start w-full max-w-2xl mx-auto overflow-x-auto gap-2 px-2">
              {img?.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-transform hover:scale-105 ${selectedImageIndex === idx
                    ? 'border-sky-500 ring-2 ring-sky-500'
                    : 'border-gray-300 dark:border-neutral-700'
                    }`}
                >
                  <img
                    src={image?.url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {video && (
                <div
                  className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-white dark:bg-neutral-900 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-neutral-700 cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedImageIndex(-1)}
                >
                  <Play className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:pr-10 space-y-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-1">
                {title}
              </h1>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 md:w-5 md:h-5 ${i < Math.round(rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-neutral-600'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-sky-600 dark:text-sky-400">
                  {rating || '0'} ratings
                </span>
                {user.role === "seller" && (
                  <>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full border border-black dark:border-white ${stock > 10
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                        }`}
                    >
                      Stock: {stock}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full border border-black dark:border-white ${isAvailable
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                        }`}
                    >
                      {isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="border-y border-gray-200 dark:border-neutral-800 py-4 space-y-4">
              {hasDiscount > 0 && (
                <span className="bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
                  -{discountType === "₹" && "₹"}{discountValue}
                  {discountType === "%" && "%"} OFF
                </span>
              )}
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{finalPrice.toFixed(2)}</span>
                {hasDiscount > 0 && (
                  <span className="line-through text-gray-500 dark:text-gray-400 text-base">₹{price.toFixed(2)}</span>
                )}
                {hasDiscount > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Save ₹{(price - finalPrice).toFixed(2)}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {deliveryCharge > 0 ? `+ ₹${deliveryCharge.toLocaleString()} delivery charge` : 'Free Delivery'}
              </p>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-bold mb-2">About this item</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-1 text-sm md:text-base text-white-600 dark:text-white">
              {brand && <span className='bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-md px-4 py-2'>Brand: <span className="font-semibold text-gray-800 dark:text-gray-200">{brand}</span></span>}
              {category?.name && <span className='bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-md px-4 py-2'>Category: <span className="font-semibold text-gray-800 dark:text-gray-200">{category.name}</span></span>}
              {subCategory?.name && <span className='bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-md px-4 py-2'>Sub-Category: <span className="font-semibold text-gray-800 dark:text-gray-200">{subCategory.name}</span></span>}
            </div>

            {attributes && attributes.length > 0 && (
              <div>
                <h2 className="text-lg md:text-xl font-bold mb-2">Specifications</h2>
                <div className="flex flex-wrap gap-2">
                  {attributes.map((attr, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-md border border-black dark:border-white"
                    >
                      <span className="text-xs text-gray-600 dark:text-gray-400">{attr.key}:</span>
                      <span className="text-xs font-semibold">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tags && tags.length > 0 && (
              <div>
                <h2 className="text-lg md:text-xl font-bold mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 rounded-full text-xs border border-black dark:border-white"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.role === "buyer" && (
              <div className="border-y border-gray-200 dark:border-neutral-800 py-4 space-y-4">
                <div className="flex items-center justify-around w-[300px] gap-5">
                  <span className="font-medium text-sm md:text-base">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 cursor-pointer rounded-full bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 flex items-center justify-center text-sm font-medium hover:bg-gray-300 dark:hover:bg-neutral-800 transition-colors border border-black dark:border-white"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      className="w-8 h-8 cursor-pointer rounded-full bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 flex items-center justify-center text-sm font-medium hover:bg-gray-300 dark:hover:bg-neutral-800 transition-colors border border-black dark:border-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center sm:items-baseline gap-5">
                  <div className='flex flex-col justify-between items-center gap-3 w-[300px]'>
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      disabled={stock === 0 || !isAvailable}
                      className={`flex items-center justify-center cursor-pointer border border-black dark:border-white w-60 gap-2 py-2 px-4 rounded-full font-semibold text-sm transition-all
                    ${stock === 0 || !isAvailable
                          ? "bg-gray-400 text-gray-600 dark:bg-neutral-900 dark:text-gray-400 cursor-not-allowed"
                          : "bg-sky-500 text-white hover:bg-sky-600"}`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      disabled={stock === 0 || !isAvailable}
                      className={`flex items-center justify-center cursor-pointer border border-black dark:border-white w-60 gap-2 py-2 px-4 rounded-full font-semibold text-sm transition-all
                    ${stock === 0 || !isAvailable
                          ? "bg-gray-400 text-gray-600 dark:bg-neutral-900 dark:text-gray-400 cursor-not-allowed"
                          : "bg-sky-500 text-white hover:bg-sky-600"}`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy Now
                    </button>
                  </div>

                  <div className='flex justify-center items-center gap-3 w-[300px]'>
                    <button
                      onClick={() => handleWishList(product._id)}
                      className={`w-10 h-10 flex items-center justify-center cursor-pointer rounded-full border border-black dark:border-white transition-colors
                      ${isLiked
                          ? "bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-gray-100 text-gray-600 dark:bg-neutral-900 dark:text-gray-300 hover:bg-white dark:hover:bg-neutral-900"
                        }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                    </button>

                    <button
                      className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-full bg-gray-100 text-gray-600 dark:bg-neutral-900 border border-black dark:border-white dark:text-gray-300 hover:bg-white dark:hover:bg-neutral-900"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {user.role === "seller" && (
              <div className="flex flex-wrap justify-center items-center gap-3 mt-4">
                <button
                  onClick={() => handleUpdateDetails(product)}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg cursor-pointer w-40 bg-sky-600 text-white font-semibold text-sm transition-all hover:bg-sky-700 border border-black dark:border-white"
                >
                  <Edit className="w-4 h-4" />
                  Edit Product
                </button>
                <button
                  onClick={() => handleToggleAvailability(product._id, !product.isAvailable)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg cursor-pointer w-40 font-semibold text-sm transition-all border border-black dark:border-white ${isAvailable
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                  {isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button
                  onClick={handleManageVariant}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg cursor-pointer w-40 bg-purple-600 text-white font-semibold text-sm transition-all hover:bg-purple-700 border border-black dark:border-white"
                >
                  Manage Variant
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg cursor-pointer w-40 bg-red-600 text-white font-semibold text-sm transition-all hover:bg-red-700 border border-black dark:border-white"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Product
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;