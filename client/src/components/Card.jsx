import React from "react";

function Card({ product }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
      <div className="w-full h-48 overflow-hidden">
        <img
          src={product.img?.[0]?.url}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
          {product.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {product.description}
        </p>
        <p className="mt-2 font-semibold text-sky-600 dark:text-sky-400">
          ₹{product.price}
        </p>
        {product.brand && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Brand: {product.brand}
          </p>
        )}
        <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
          Stock: {product.stock}
        </p>
      </div>
    </div>
  );
}

export default Card;
