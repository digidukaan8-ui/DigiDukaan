import { useState, useEffect } from 'react';
import { Heart, Share2, Star, ShoppingCart, ChevronLeft, ChevronRight, Play, Edit, Trash2, Plus, Minus, AlertTriangle, Truck } from 'lucide-react';
import useAuthStore from '../store/auth';
import useProductStore from '../store/product';
import { useNavigate } from 'react-router-dom';
import useLoaderStore from '../store/loader';
import { removeProduct, changeAvailability, getProductById, addToWishlist, removeFromWishlist, addToCart, addToViewed } from '../api/product';
import { toast } from 'react-hot-toast';
import useCategoryProductStore from '../store/categoryProducts';
import useCartStore from '../store/cart';
import useWishlistStore from '../store/wishlist';

const ProductDetail = ({ id }) => {
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  let { user } = useAuthStore();
  const { wishlist } = useWishlistStore();
  const { startLoading, stopLoading } = useLoaderStore();
  const [product, setProduct] = useState(
    useProductStore.getState().getProduct(id) ||
    useCategoryProductStore.getState().getProductById(id)
  );

  useEffect(() => {
    if (!product) {
      const fetchProduct = async () => {
        startLoading("fetching");
        try {
          const result = await getProductById(id);
          if (result.success) {
            setProduct(result.data);
            useProductStore.getState().addProduct(result.data);
          }
        } finally {
          stopLoading();
        }
      };
      fetchProduct();
    }
  }, [id, product, startLoading, stopLoading]);

  useEffect(() => {
    if (!product?._id) return;

    const addToRecentlyViewed = async () => {
      try {
        if (!user?._id || !user?.name || user?.role === "seller" || user?.role === "admin") {
          return;
        }
        await addToViewed(product._id);
      } catch (err) {
        console.error("Error adding to viewed:", err);
      }
    };

    addToRecentlyViewed();
  }, [product?._id, user?.role, user?._id, user?.name]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-950">
        <div className="text-center p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-black dark:border-white max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-red-500 dark:text-red-400" />
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

  const productIds = useWishlistStore((state) => state.wishlist.productIds);
  const isWishlisted = productIds.includes(product._id);
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
      const result = await addToCart(id, quantity);
      if (result.success) {
        useCartStore.getState().addToCart(result.data);
        toast.success("Product added to cart");
      }
    } finally {
      stopLoading();
    }
  };

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

  const handleUpdateDetails = (product) => {
    if (!user?._id || !user?.name) {
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
    if (!user?._id || !user?.name) {
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
        setProduct(prev => ({ ...prev, isAvailable: result.data.isAvailable }));
        useProductStore.getState().updateProduct(result.data);
        toast.success("Availability changed successfully");
      }
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async (id) => {
    if (!user?._id || !user?.name) {
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
          navigate("/seller/store");
        }
      } finally {
        stopLoading();
      }
    }
  };

  const handleManageVariant = () => {
    if (!user?._id || !user?.name) {
      navigate(`/login`);
      toast.error("Login First");
      return;
    } else if (user?.role === "buyer" || user?.role === "admin") {
      toast.error("Only for seller");
      return;
    }
    alert("Add new variant");
  };

  const handleCartBtn = (id) => {
    let productId = useCartStore.getState().getIdFromCart() || [];
    if (productId.includes(id) && isAvailable) {
      return true;
    }
    return false;
  }

  if (!user) {
    user = { role: "buyer" };
  } else if (!user.role) {
    user.role = "buyer";
  }

  const showSellerWarning = user.role === "seller" && (!isAvailable || stock <= 0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 pt-28 pb-10">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">

        {showSellerWarning && (
          <div className="p-4 mb-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 shadow-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
              This product is NOT VISIBLE to buyers because it is currently {!isAvailable ? 'Unavailable' : 'Out of Stock'}.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col">
            <div className="relative w-full mx-auto rounded-2xl overflow-hidden shadow-md bg-white dark:bg-neutral-900 mb-4 flex items-center justify-center">
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-neutral-900/90 text-gray-800 dark:text-gray-200 rounded-full shadow-md hover:bg-white dark:hover:bg-neutral-900 transition-all hover:scale-110 z-10 border border-black dark:border-white"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-neutral-900/90 text-gray-800 dark:text-gray-200 rounded-full shadow-md hover:bg-white dark:hover:bg-neutral-900 transition-all hover:scale-110 z-10 border border-black dark:border-white"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </>
              )}
            </div>

            <div className="flex justify-start w-full overflow-x-auto gap-2 px-1 pb-2">
              {img?.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${selectedImageIndex === idx
                    ? 'border-sky-500 ring-2 ring-sky-500 shadow-md'
                    : 'border-gray-200 dark:border-neutral-800'
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
                  className={`w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-white dark:bg-neutral-900 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all hover:scale-105 
                                    ${selectedImageIndex === -1 ? 'border-sky-500 ring-2 ring-sky-500 shadow-md' : 'border-gray-200 dark:border-neutral-800'}`}
                  onClick={() => setSelectedImageIndex(-1)}
                >
                  <Play className="w-6 h-6 md:w-8 md:h-8 text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.round(rating || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-neutral-600'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {rating || '0'} ratings
                  </span>
                </div>
                {user.role === "seller" && (
                  <>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${stock > 10
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/50'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800/50'
                        }`}
                    >
                      Stock: {stock}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${isAvailable
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/50'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800/50'
                        }`}
                    >
                      {isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-2xl p-5 space-y-4 shadow-sm">
              {hasDiscount > 0 && (
                <span className="inline-block bg-gradient-to-r from-sky-500 to-sky-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md">
                  {discountType === "₹" && "₹"}{discountValue}{discountType === "%" && "%"} OFF
                </span>
              )}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">₹{finalPrice.toFixed(2)}</span>
                {hasDiscount > 0 && (
                  <>
                    <span className="line-through text-gray-500 dark:text-gray-400 text-lg">₹{price.toFixed(2)}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                      Save ₹{(price - finalPrice).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex justify-start items-center gap-2">
                <Truck /> {deliveryCharge > 0 ? `+ ₹${deliveryCharge.toLocaleString()} delivery charge` : 'Free Delivery'}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-xl font-bold mb-3">About this item</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {brand && (
                <div className="bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-xl px-4 py-2.5 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Brand:</span>{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{brand}</span>
                </div>
              )}
              {category?.name && (
                <div className="bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-xl px-4 py-2.5 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Category:</span>{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{category.name}</span>
                </div>
              )}
              {subCategory?.name && (
                <div className="bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-xl px-4 py-2.5 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sub-Category:</span>{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{subCategory.name}</span>
                </div>
              )}
            </div>

            {attributes && attributes.length > 0 && (
              <div className="bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-xl font-bold mb-3">Specifications</h2>
                <div className="grid grid-cols-2 gap-2">
                  {attributes.map((attr, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 dark:bg-neutral-950 px-3 py-2.5 rounded-lg border border-black dark:border-white"
                    >
                      <span className="text-xs text-gray-600 dark:text-gray-400 block mb-0.5">{attr.key}</span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tags && tags.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400 rounded-full text-xs font-medium border border-sky-200 dark:border-sky-800/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.role === "buyer" && (
              <div className="bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-base">Quantity:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 cursor-pointer rounded-full bg-gray-100 dark:bg-neutral-950 text-gray-700 dark:text-gray-300 flex items-center justify-center font-medium hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors border border-black dark:border-white"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      className="w-10 h-10 cursor-pointer rounded-full bg-gray-100 dark:bg-neutral-950 text-gray-700 dark:text-gray-300 flex items-center justify-center font-medium hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors border border-black dark:border-white"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={handleCartBtn(product._id) || stock === 0 || !isAvailable}
                    className={`flex items-center justify-center cursor-pointer w-full gap-2 py-3.5 px-6 rounded-xl font-semibold text-base transition-all shadow-sm hover:shadow-md
                      ${stock === 0 || !isAvailable
                        ? "bg-gray-300 text-gray-600 dark:bg-neutral-800 dark:text-gray-400 cursor-not-allowed border border-black dark:border-white"
                        : "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 border border-black dark:border-white"}`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {stock === 0 || !isAvailable ? 'Out of Stock' : handleCartBtn(product._id) ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                  <button
                    disabled={stock === 0 || !isAvailable}
                    className={`flex items-center justify-center cursor-pointer w-full gap-2 py-3.5 px-6 rounded-xl font-semibold text-base transition-all shadow-sm hover:shadow-md
                      ${stock === 0 || !isAvailable
                        ? "bg-gray-300 text-gray-600 dark:bg-neutral-800 dark:text-gray-400 cursor-not-allowed border border-black dark:border-white"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 border border-black dark:border-white"}`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Buy Now
                  </button>
                </div>

                <div className="flex justify-center items-center gap-3 pt-2">
                  <button
                    onClick={() => handleWishList(product._id)}
                    className={`w-12 h-12 flex items-center justify-center cursor-pointer rounded-full transition-all hover:scale-110
                      ${isWishlisted
                        ? "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/50"
                        : "bg-gray-100 text-gray-600 dark:bg-neutral-950 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-black dark:border-white"
                      }`}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>

                  <button
                    className="w-12 h-12 flex items-center justify-center cursor-pointer rounded-full bg-gray-100 text-gray-600 dark:bg-neutral-950 border border-black dark:border-white dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-800 transition-all hover:scale-110"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {user.role === "seller" && (
              <div className="bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-bold">Seller Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateDetails(product)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer bg-sky-600 text-white font-semibold text-sm transition-all hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 shadow-sm hover:shadow-md border border-black dark:border-white"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Product
                  </button>
                  <button
                    onClick={() => handleToggleAvailability(product._id, !product.isAvailable)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer font-semibold text-sm transition-all shadow-sm hover:shadow-md border border-black dark:border-white ${isAvailable
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600'
                      : 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                      }`}
                  >
                    {isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                  <button
                    onClick={handleManageVariant}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer bg-purple-600 text-white font-semibold text-sm transition-all hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 shadow-sm hover:shadow-md border border-black dark:border-white"
                  >
                    Manage Variant
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer bg-red-600 text-white font-semibold text-sm transition-all hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 shadow-sm hover:shadow-md border border-black dark:border-white"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Product
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;