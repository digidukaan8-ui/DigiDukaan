import { Star, ShoppingCart, Heart, Truck, Shield, RotateCcw, Tag, Video, Plus, Minus, Share2, Eye, Gift } from "lucide-react";
import { useState } from "react";

const ProductDetails = ({ product }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    if (!product) return <div className="flex items-center justify-center h-64 text-xl">No product found</div>;

    const hasDiscount = product.discount?.percentage || product.discount?.amount;
    const finalPrice = hasDiscount
        ? product.discount?.percentage
            ? product.price - (product.price * product.discount.percentage) / 100
            : product.price - product.discount.amount
        : product.price;

    const discountValue = product.discount?.percentage || product.discount?.amount;
    const discountType = product.discount?.percentage ? "%" : "₹";
    const savingAmount = product.price - finalPrice;

    const handleQuantityChange = (type) => {
        if (type === 'increment' && quantity < product.stock) {
            setQuantity(quantity + 1);
        } else if (type === 'decrement' && quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleAddToCart = () => {
        console.log('Added to cart:', { product: product._id, quantity });
    };

    const handleBuyNow = () => {
        console.log('Buy now:', { product: product._id, quantity });
    };

    const handleWishlistToggle = () => {
        setIsWishlisted(!isWishlisted);
        console.log(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    };

    const handleShare = () => {
        console.log('Share product');
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 pt-30 pb-20 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        
                        <div className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                            <div className="space-y-6">
                                
                                <div className="relative group">
                                    <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
                                        <img
                                            src={product.img?.[selectedImageIndex]?.url}
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    
                                    {hasDiscount && (
                                        <div className="absolute top-4 left-4">
                                            <div className="bg-red-500 text-white px-3 py-2 rounded-full font-bold text-sm shadow-lg">
                                                -{discountValue}{discountType} OFF
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button 
                                            onClick={handleShare}
                                            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all"
                                        >
                                            <Share2 size={20} className="text-gray-700" />
                                        </button>
                                        <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all">
                                            <Eye size={20} className="text-gray-700" />
                                        </button>
                                    </div>
                                </div>

                                {product.img?.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {product.img.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImageIndex(index)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                                                    selectedImageIndex === index 
                                                        ? 'border-blue-500 shadow-lg' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={`Product ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {product.video?.url && (
                                    <div className="relative rounded-2xl overflow-hidden bg-black">
                                        <video
                                            src={product.video.url}
                                            controls
                                            className="w-full h-64 object-cover"
                                        />
                                        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                            <Video size={16} />
                                            Product Video
                                        </div>
                                    </div>
                                )}

                                {product.variants?.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Variants</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {product.variants.map((variant, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedVariant(index)}
                                                    className={`p-4 rounded-xl border-2 transition-all ${
                                                        selectedVariant === index 
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                                                    }`}
                                                >
                                                    {variant.image && (
                                                        <img
                                                            src={variant.image}
                                                            alt={variant.title}
                                                            className="w-full h-16 object-cover rounded-lg mb-2"
                                                        />
                                                    )}
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {variant.title || `Variant ${index + 1}`}
                                                    </div>
                                                    {variant.price && (
                                                        <div className="text-xs text-green-600 mt-1">
                                                            ₹{variant.price}
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                                    <span className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full font-medium">
                                        {product.brand}
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span>{product.category?.name}</span>
                                    {product.subCategory && (
                                        <>
                                            <span className="text-gray-400">→</span>
                                            <span>{product.subCategory.name}</span>
                                        </>
                                    )}
                                </div>
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {product.title}
                                </h1>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            className={
                                                i < Math.floor(product.rating || 0)
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-gray-300 dark:text-gray-600"
                                            }
                                        />
                                    ))}
                                </div>
                                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                    {product.rating || 0}/5
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    {product.reviews?.length || 0} reviews
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                                        ₹{finalPrice.toFixed(2)}
                                    </span>
                                    {hasDiscount && (
                                        <>
                                            <span className="text-xl text-gray-500 line-through">
                                                ₹{product.price.toFixed(2)}
                                            </span>
                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                                Save ₹{savingAmount.toFixed(2)}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    *Inclusive of all taxes
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                                    product.stock > 0 
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                        product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                    {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                                </div>
                                
                                {product.deliveryCharge === 0 ? (
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                                        <Truck size={16} />
                                        Free Delivery
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                        <Truck size={16} />
                                        Delivery: ₹{product.deliveryCharge}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                    {product.description}
                                </p>
                            </div>

                            {product.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <Tag size={12} />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {product.stock > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">Quantity:</span>
                                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                            <button
                                                onClick={() => handleQuantityChange('decrement')}
                                                disabled={quantity <= 1}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="px-4 py-2 font-medium">{quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange('increment')}
                                                disabled={quantity >= product.stock}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Total: ₹{(finalPrice * quantity).toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleAddToCart}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                                        >
                                            <ShoppingCart size={20} />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={handleBuyNow}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                                        >
                                            <Gift size={20} />
                                            Buy Now
                                        </button>
                                        <button
                                            onClick={handleWishlistToggle}
                                            className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 ${
                                                isWishlisted 
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' 
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-red-300 text-gray-600 dark:text-gray-400'
                                            }`}
                                        >
                                            <Heart size={24} className={isWishlisted ? 'fill-current' : ''} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4 pt-6 border-t dark:border-gray-700">
                                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <Shield className="mx-auto mb-2 text-green-600" size={24} />
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">Secure Payment</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">100% Protected</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <Truck className="mx-auto mb-2 text-blue-600" size={24} />
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">Fast Delivery</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">2-3 Business Days</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <RotateCcw className="mx-auto mb-2 text-purple-600" size={24} />
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">Easy Returns</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">15 Days Return</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t dark:border-gray-700">
                        <div className="flex border-b dark:border-gray-700">
                            {['description', 'specifications', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 px-6 py-4 text-center font-medium capitalize transition-colors ${
                                        activeTab === tab 
                                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10' 
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="p-8">
                            {activeTab === 'description' && (
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            {activeTab === 'specifications' && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Product Specifications</h3>
                                    {product.attributes?.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {product.attributes.map((attr, index) => (
                                                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                                                    <div className="font-medium text-gray-900 dark:text-white">{attr.key}</div>
                                                    <div className="text-gray-600 dark:text-gray-400">{attr.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-400">No specifications available.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Customer Reviews</h3>
                                    {product.reviews?.length > 0 ? (
                                        <div className="space-y-4">
                                            {product.reviews.map((review, index) => (
                                                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={16}
                                                                    className={
                                                                        i < (review.rating || 5)
                                                                            ? "text-yellow-400 fill-yellow-400"
                                                                            : "text-gray-300"
                                                                    }
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {review.user || 'Anonymous'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300">
                                                        {typeof review === 'string' ? review : review.comment || 'Great product!'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="text-gray-400 mb-2">No reviews yet</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Be the first to review this product!</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;