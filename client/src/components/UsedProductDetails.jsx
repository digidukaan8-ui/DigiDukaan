import { useState, useEffect } from "react";
import { Heart, Share2, Edit, Trash2, MessageCircle, ShoppingCart, ChevronLeft, ChevronRight, Play, MapPin, Truck, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/auth";
import useUsedProductStore from "../store/usedProduct";
import { toast } from "react-hot-toast";
import { removeUsedProduct, addToWishlist, removeFromWishlist } from "../api/product";
import useUsedCategoryProductStore from "../store/categoryUsedProduct";
import useWishlistStore from "../store/wishlist";
import useLoaderStore from '../store/loader'

const UsedProductDetail = ({ id }) => {
    const navigate = useNavigate();
    let { user } = useAuthStore();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const { wishlist } = useWishlistStore();
    const { startLoading, stopLoading } = useLoaderStore();
    const [product, setProduct] = useState(
        useUsedProductStore.getState().getUsedProduct(id) ||
        useUsedCategoryProductStore.getState().getUsedProductById(id)
    );

    useEffect(() => {
        if (!product) {
            const fetchProduct = async () => {
                startLoading("fetching");
                try {
                    const result = await getUsedProductById(id);
                    if (result.success) {
                        setProduct(result.data);
                        useUsedProductStore.getState().addProduct(result.data);
                    }
                } finally {
                    stopLoading();
                }
            };
            fetchProduct();
        }
    }, [id, product, startLoading, stopLoading]);

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

    const productIds = useWishlistStore((state) => state.wishlist.productIds);
    const isWishlisted = productIds.includes(product._id);
    const {
        title,
        description,
        category,
        subCategory,
        condition,
        price,
        discount,
        isNegotiable,
        brand,
        attributes,
        billAvailable,
        delivery,
        img,
        video,
        tags,
        isSold,
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

    const handleUpdate = (product) => {
        if (!user?._id || !user?.name) {
            navigate(`/login`);
            toast.error("Login First");
            return;
        } else if (user?.role === "buyer" || user?.role === "admin") {
            toast.error("Only for seller");
            return;
        }
        navigate("/seller/used-product", { state: { initialData: product } });
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
                const result = await removeUsedProduct(id);
                if (result.success) {
                    useUsedProductStore.getState().removeUsedProduct(id);
                    toast.success("Product removed successfully");
                }
            } finally {
                stopLoading();
            }
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

    const getConditionColor = (condition) => {
        switch (condition?.toLowerCase()) {
            case 'new':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200';
            case 'like new':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200';
            case 'used':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200';
            case 'refurbished':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-200';
        }
    };

    if (!user) {
        user = { role: "buyer" };
    } else if (!user.role) {
        user.role = "buyer";
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 pt-32 pb-10">
            <div className="container mx-auto px-4 py-6 sm:py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                    <div className="flex flex-col">
                        <div className="relative w-full mx-auto rounded-lg overflow-hidden shadow-md mb-4 flex items-center justify-center">
                            {video?.url ? (
                                <video
                                    src={video.url}
                                    controls
                                    className="w-full h-auto object-contain max-h-[500px] md:max-h-[60vh]"
                                />
                            ) : (
                                <img
                                    src={img?.[selectedImageIndex]?.url}
                                    alt={title}
                                    className="w-full h-auto object-contain max-h-[500px] md:max-h-[60vh]"
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

                        <div className="flex justify-start w-full mx-auto overflow-x-auto gap-2 px-2">
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
                            {video?.url && (
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
                            <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
                                {title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full border border-black dark:border-white ${getConditionColor(condition)}`}>
                                    {condition}
                                </span>
                                {isSold && (
                                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200 border border-black dark:border-white">
                                        SOLD
                                    </span>
                                )}
                                {billAvailable && (
                                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200 border border-black dark:border-white">
                                        Bill Available
                                    </span>
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
                            {isNegotiable && (
                                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                                    Negotiable
                                </span>
                            )}
                        </div>

                        <div>
                            <h2 className="text-lg md:text-xl font-bold mb-2">About this item</h2>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {description}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-1 text-sm md:text-base">
                            {brand && (
                                <span className='bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-md px-4 py-2'>
                                    Brand: <span className="font-semibold text-gray-800 dark:text-gray-200">{brand}</span>
                                </span>
                            )}
                            {category?.name && (
                                <span className='bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-md px-4 py-2'>
                                    Category: <span className="font-semibold text-gray-800 dark:text-gray-200">{category.name}</span>
                                </span>
                            )}
                            {subCategory?.name && (
                                <span className='bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-md px-4 py-2'>
                                    Sub-Category: <span className="font-semibold text-gray-800 dark:text-gray-200">{subCategory.name}</span>
                                </span>
                            )}
                        </div>

                        {delivery && (
                            <div>
                                <h2 className="text-lg md:text-xl font-bold mb-2">Delivery Options</h2>
                                <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 space-y-3">
                                    {delivery.type === 'pickup' && delivery.pickupLocation && (
                                        <div className="flex items-center gap-2">
                                            <Package className="w-5 h-5 text-sky-600" />
                                            <div className="text-sm">
                                                <span className="font-semibold">Pickup Available</span>
                                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                    {delivery.pickupLocation.address}, {delivery.pickupLocation.city},
                                                    {delivery.pickupLocation.state} - {delivery.pickupLocation.pincode}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {delivery.type === 'shipping' && delivery.shippingLocations?.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-sky-600" />
                                            <div className="text-sm w-full">
                                                <span className="font-semibold">Shipping Available</span>
                                                <ul className="mt-2 space-y-1 w-full">
                                                    {delivery.shippingLocations.map((loc, idx) => (
                                                        <li key={idx} className="flex justify-between items-center py-1">
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {loc.areaName} ({loc.shippingArea})
                                                            </span>
                                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                                Charge: ₹{loc.shippingCharge}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {delivery.type === 'both' && (
                                        <>
                                            {delivery.pickupLocation && (
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-5 h-5 text-sky-600" />
                                                    <div className="text-sm">
                                                        <span className="font-semibold">Pickup Available</span>
                                                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                            {delivery.pickupLocation.address}, {delivery.pickupLocation.city},
                                                            {delivery.pickupLocation.state} - {delivery.pickupLocation.pincode}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {delivery.shippingLocations?.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Truck className="w-5 h-5 text-sky-600" />
                                                    <div className="text-sm w-full">
                                                        <span className="font-semibold">Shipping Available</span>
                                                        <ul className="mt-2 space-y-1 w-full">
                                                            {delivery.shippingLocations.map((loc, idx) => (
                                                                <li key={idx} className="flex justify-between items-center py-1">
                                                                    <span className="text-gray-600 dark:text-gray-400">
                                                                        {loc.areaName} ({loc.shippingArea})
                                                                    </span>
                                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                                        Charge: ₹{loc.shippingCharge}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

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

                        {user.role === "buyer" ? (
                            <div className="border-y border-gray-200 dark:border-neutral-800 py-4 space-y-4">
                                <div className="flex flex-col justify-center items-center sm:items-baseline gap-5">
                                    <div className='flex flex-col justify-between items-center gap-3 w-[300px]'>
                                        <button
                                            disabled={isSold}
                                            onClick={handleChatSeller}
                                            className={`flex items-center justify-center cursor-pointer border border-black dark:border-white w-60 gap-2 py-2 px-4 rounded-full font-semibold text-sm transition-all
                                                ${isSold
                                                    ? "bg-gray-400 text-gray-600 dark:bg-neutral-900 dark:text-gray-400 cursor-not-allowed"
                                                    : "bg-sky-500 text-white hover:bg-sky-600"}`}
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            {isSold ? "Product Sold" : "Start Chat"}
                                        </button>
                                    </div>

                                    <div className='flex justify-center items-center gap-3 w-[300px]'>
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

                                        <button className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-full bg-gray-100 text-gray-600 dark:bg-neutral-900 border border-black dark:border-white dark:text-gray-300 hover:bg-white dark:hover:bg-neutral-900">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap justify-center items-center gap-3 mt-4">
                                <button
                                    onClick={() => handleUpdate(product)}
                                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg cursor-pointer w-40 bg-sky-600 text-white font-semibold text-sm transition-all hover:bg-sky-700 border border-black dark:border-white"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Product
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
};

export default UsedProductDetail;