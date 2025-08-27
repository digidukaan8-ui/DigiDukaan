import { FiShoppingCart, FiStar } from "react-icons/fi";

export default function Card({ product, onAddToCart, showCart = true }) {
  const hasDiscount = product.discount?.percentage || product.discount?.amount;
  const finalPrice = hasDiscount
    ? product.discount?.percentage
      ? product.price - (product.price * product.discount.percentage) / 100
      : product.price - product.discount.amount
    : product.price;

  const rating = product.rating || 0;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-md shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col overflow-hidden max-w-[300px] relative">
      
      <div className="relative w-full h-52">
        <img
          src={product.img?.[0]?.url}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow">
            -{product.discount?.percentage || product.discount?.amount}
            {product.discount?.percentage ? "%" : "₹"}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-grow p-4 relative border-t border-t-black dark:border-t-white">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
          {product.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
          {product.description}
        </p>

        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar
              key={i}
              className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            />
          ))}
          <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
            {rating.toFixed(1)}
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-sky-600 dark:text-sky-400">
            ₹{finalPrice}
          </span>
          {hasDiscount && (
            <span className="line-through text-gray-500 dark:text-gray-400 text-sm">
              ₹{product.price}
            </span>
          )}
        </div>

        {showCart && (
          <button
            onClick={() => onAddToCart?.(product)}
            disabled={product.stock <= 0}
            className="mt-4 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
          >
            <FiShoppingCart className="h-5 w-5" />
            {product.stock > 0 ? "Add to Cart" : "Unavailable"}
          </button>
        )}

        <span
          className={`absolute bottom-4 right-4 text-xs font-semibold px-2 py-1 rounded shadow border border-black dark:border-white ${
            product.stock > 0
              ? "bg-emerald-600 text-white"
              : "bg-gray-500 text-white"
          }`}
        >
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </span>
      </div>
    </div>
  );
}