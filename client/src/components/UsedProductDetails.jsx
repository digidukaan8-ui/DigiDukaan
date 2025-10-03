import { useState, useEffect } from "react";
import { Heart, Share2, Edit, Trash2, MessageCircle, ShoppingCart, ChevronLeft, ChevronRight, Play, Truck, Package, CheckCircle, XCircle, FileText, AlertTriangle, IndianRupee } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/auth";
import useUsedProductStore from "../store/usedProduct";
import { toast } from "react-hot-toast";
import { removeUsedProduct, addToWishlist, removeFromWishlist, addToViewed, getProductById } from "../api/product";
import useUsedCategoryProductStore from "../store/categoryUsedProduct";
import useWishlistStore from "../store/wishlist";
import useLoaderStore from '../store/loader'
import { payNow, verifyPayment } from "../api/payment";
import { getPriceForUsedProduct } from "../utils/category";
import useStores from "../store/stores";

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
    const [searchParams, setSearchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");

    useEffect(() => {
        if (!product) {
            const fetchProduct = async () => {
                startLoading("fetching");
                try {
                    const result = await getProductById(id);
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

    useEffect(() => {
        if (!product?._id) return;

        const addToRecentlyViewed = async () => {
            if (!user?._id || !user?.name || user?.role === "seller" || user?.role === "admin") {
                return;
            }
            try {
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

    useEffect(() => {
        if (!orderId) return;
        if (product.paid) return;
        const fetchPaymentDetail = async () => {
            startLoading('confirmingPayment')
            try {
                const result = await verifyPayment(orderId, product?._id);
                if (result.success) {
                    useUsedProductStore.getState().updateUsedProduct(result.product);
                    toast.success("Payment confirmed");
                    searchParams.delete('orderId');
                    setSearchParams(searchParams);
                }
            } finally {
                stopLoading();
            }
        }
        fetchPaymentDetail();
    }, [orderId]);

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
        paid,
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
                    navigate("/seller/store");
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
        navigate(`/buyer/chat?storeId=${storeId}`, {
            state: {
                img: store[0]?.img?.url,
                name: store[0]?.name,
                seller: store[0]?.userId
            }
        });
    };

    const getConditionColor = (condition) => {
        switch (condition?.toLowerCase()) {
            case 'new':
                return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/50';
            case 'like new':
                return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
            case 'used':
                return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50';
            case 'refurbished':
                return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/50';
            default:
                return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800/50';
        }
    };

    if (!user) {
        user = { role: "buyer" };
    } else if (!user.role) {
        user.role = "buyer";
    }

    const showSellerWarning = user.role === "seller" && (isSold || !paid);

    let warningMessage = "";
    if (isSold) {
        warningMessage = "This product is NOT VISIBLE to buyers because it is already SOLD.";
    } else if (!paid) {
        warningMessage = `Payment of ₹${getPriceForUsedProduct(category.name, subCategory.name)} is pending. This product will become visible to buyers once the payment is complete.`;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 pt-28 pb-10">
            <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">

                {showSellerWarning && (
                    <div className="p-4 mb-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 shadow-sm flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                            {warningMessage}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <div className="flex flex-col">
                        <div className="relative w-full mx-auto rounded-2xl overflow-hidden shadow-md bg-white dark:bg-neutral-900 mb-4 flex items-center justify-center">
                            {video?.url ? (
                                <video
                                    src={video.url}
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
                            {video?.url && (
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
                                {condition && (
                                    <span className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getConditionColor(condition)}`}>
                                        <CheckCircle className="w-4 h-4" />
                                        {condition}
                                    </span>
                                )}
                                {isSold && (
                                    <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                                        <XCircle className="w-4 h-4" />
                                        SOLD
                                    </span>
                                )}
                                {billAvailable && (
                                    <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                                        <FileText className="w-4 h-4" />
                                        Bill Available
                                    </span>
                                )}
                                {delivery?.shippingLocations?.length > 0 && (
                                    <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
                                        <Truck className="w-4 h-4" />
                                        Shipping Available
                                    </span>
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
                            {isNegotiable && (
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                    💬 Price Negotiable
                                </p>
                            )}
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

                        {delivery && (
                            <div className="bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-2xl p-5 shadow-sm">
                                <h2 className="text-xl font-bold mb-3">Delivery Options</h2>
                                <div className="space-y-3">
                                    {(delivery.type === 'pickup' || delivery.type === 'both') && delivery.pickupLocation && (
                                        <div className="flex items-start gap-3 bg-gray-50 dark:bg-neutral-950 px-3 py-3 rounded-lg border border-black dark:border-white">
                                            <Package className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-1">Pickup Available</span>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    {delivery.pickupLocation.address}, {delivery.pickupLocation.city},
                                                    {delivery.pickupLocation.state} - {delivery.pickupLocation.pincode}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {(delivery.type === 'shipping' || delivery.type === 'both') && delivery.shippingLocations?.length > 0 && (
                                        <div className="bg-gray-50 dark:bg-neutral-950 px-3 py-3 rounded-lg border border-black dark:border-white">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Truck className="w-5 h-5 text-sky-600" />
                                                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Shipping Available</span>
                                            </div>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {delivery.shippingLocations.map((loc, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-t border-gray-200 dark:border-neutral-800">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {loc.areaName} ({loc.shippingArea})
                                                        </span>
                                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                            ₹{loc.shippingCharge}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

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
                                <button
                                    disabled={isSold}
                                    onClick={(e) => handleChatSeller(e, product.storeId)}
                                    className={`flex items-center justify-center cursor-pointer w-full gap-2 py-3.5 px-6 rounded-xl font-semibold text-base transition-all shadow-sm hover:shadow-md
                                        ${isSold
                                            ? "bg-gray-300 text-gray-600 dark:bg-neutral-800 dark:text-gray-400 cursor-not-allowed border border-black dark:border-white"
                                            : "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 border border-black dark:border-white"}`}
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {isSold ? "Product Sold" : "Chat with Seller"}
                                </button>

                                <div className="flex justify-center items-center gap-3 pt-2">
                                    <button
                                        onClick={() => handleWishList()}
                                        className={`w-12 h-12 flex items-center justify-center cursor-pointer rounded-full transition-all hover:scale-110 border border-black dark:border-white
                                            ${isWishlisted
                                                ? "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400"
                                                : "bg-gray-100 text-gray-600 dark:bg-neutral-950 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-800"
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
                                        onClick={() => handleUpdate(product)}
                                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer bg-sky-600 text-white font-semibold text-sm transition-all hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 shadow-sm hover:shadow-md border border-black dark:border-white"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Product
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer bg-red-600 text-white font-semibold text-sm transition-all hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 shadow-sm hover:shadow-md border border-black dark:border-white"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Product
                                    </button>
                                    {!paid && (
                                        <button
                                            onClick={payAmount}
                                            className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer bg-yellow-600 text-white font-semibold text-sm transition-all hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 shadow-sm hover:shadow-md border border-black dark:border-white"
                                        >
                                            <IndianRupee className="w-4 h-4" />
                                            Pay Amount
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsedProductDetail;