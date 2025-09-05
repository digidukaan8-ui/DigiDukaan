import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Star, ShoppingCart, ChevronLeft, ChevronRight, Play } from 'lucide-react';

export default function ProductDetail({ product }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Fallback if no product is passed
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Product Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400">The product you're looking for doesn't exist.</p>
        </motion.div>
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
  } = product;

  const finalPrice = discount?.type === "percentage"
    ? price - (price * discount.value) / 100
    : discount?.type === "amount"
    ? price - discount.value
    : price;

  const savings = price - finalPrice;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

  const nextImage = () => {
    if (img && img.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % img.length);
    }
  };

  const prevImage = () => {
    if (img && img.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + img.length) % img.length);
    }
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 pt-20">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-100/30 to-blue-50/20 dark:from-neutral-800/20 dark:to-neutral-700/10 pointer-events-none"></div>
      
      <div className="relative z-10 pt-16 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12"
          >
            <div className="space-y-4">
              <div className="relative group">
                <motion.div
                  className="relative bg-gray-100 dark:bg-neutral-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-neutral-700/50 overflow-hidden"
                  onMouseMove={handleMouseMove}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  style={{
                    width: '100%',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 z-10"></div>
                  
                  {video ? (
                    <video
                      src={typeof video === "string" ? video : video.url}
                      controls
                      className="w-full h-full object-contain relative z-20"
                      style={{
                        transform: `translate(${mousePosition.x * 3}px, ${mousePosition.y * 3}px)`
                      }}
                    />
                  ) : (
                    <motion.img
                      key={selectedImageIndex}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      src={img?.[selectedImageIndex]?.url}
                      alt={title}
                      className="w-full h-full object-contain relative z-20"
                      style={{
                        transform: `translate(${mousePosition.x * 5}px, ${mousePosition.y * 5}px)`
                      }}
                    />
                  )}

                  {img && img.length > 1 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-neutral-700/90 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-neutral-700/90 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </motion.button>
                    </>
                  )}

                  {discount?.value && (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      className="absolute top-4 right-4 z-30"
                    >
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        {discount.type === "percentage" ? `${discount.value}% OFF` : `₹${discount.value} OFF`}
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {img?.map((image, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedImageIndex === idx 
                          ? 'border-blue-500 shadow-md' 
                          : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300'
                      }`}
                      style={{
                        width: '64px',
                        height: '64px'
                      }}
                    >
                      <img
                        src={image?.url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                  {video && (
                    <motion.div 
                      whileHover={{ scale: 1.03, y: -1 }}
                      className="flex-shrink-0 bg-black flex items-center justify-center border-2 border-gray-200 dark:border-neutral-700 cursor-pointer rounded-lg"
                      style={{
                        width: '64px',
                        height: '64px'
                      }}
                    >
                      <Play className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 mb-2"
                >
                  {brand && (
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full border border-blue-200/50 dark:border-blue-700/50">
                      {brand}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                      >
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(4.8)</span>
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight"
                >
                  {title}
                </motion.h1>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 dark:bg-neutral-800 rounded-2xl p-6 border border-gray-200/50 dark:border-neutral-700/50"
              >
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ₹{finalPrice.toLocaleString()}
                  </span>
                  {finalPrice !== price && (
                    <span className="text-xl text-gray-400 line-through">
                      ₹{price.toLocaleString()}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="text-green-600 dark:text-green-400 font-semibold mb-2 text-sm"
                  >
                    You save ₹{savings.toLocaleString()}!
                  </motion.p>
                )}
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {deliveryCharge > 0 
                    ? `+ Delivery ₹${deliveryCharge}` 
                    : "🚚 Free Delivery"}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  About this product
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                  {description}
                </p>
              </motion.div>

              {attributes && attributes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attributes.map((attr, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.05 }}
                        className="flex justify-between items-center bg-gray-50 dark:bg-neutral-800 px-3 py-2 rounded-lg border border-gray-200/50 dark:border-neutral-700/50"
                      >
                        <span className="text-gray-600 dark:text-gray-400 text-xs">{attr.key}</span>
                        <span className="font-semibold text-gray-900 dark:text-white text-xs">{attr.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tags && tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-2"
                >
                  {tags.map((tag, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + idx * 0.05 }}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium border border-blue-200/30 dark:border-blue-700/30"
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={`flex items-center gap-2 font-semibold text-sm ${
                  stock > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${stock > 0 ? "bg-green-500" : "bg-red-500"} animate-pulse`}></div>
                {stock > 0 ? `In Stock (${stock} available)` : "Out of Stock"}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all text-sm"
                    >
                      -
                    </motion.button>
                    <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all text-sm"
                    >
                      +
                    </motion.button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={stock === 0}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      addedToCart
                        ? 'bg-green-500 text-white'
                        : stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                      isLiked
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl bg-gray-100 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {addedToCart && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 font-semibold text-sm z-50"
          >
            <ShoppingCart className="w-4 h-4" />
            Added to Cart!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}