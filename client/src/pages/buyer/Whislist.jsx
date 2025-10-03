import { useSearchParams } from "react-router-dom";
import { ShoppingBag, Box } from 'lucide-react';
import { QuickView, Card, UsedProductCard } from "../../components/index";
import { getWishlistProducts } from "../../api/product.js";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import useAuthStore from "../../store/auth"; 

function Wishlist() {
  const { isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  const activeTab = searchParams.get("show") || "new";

  const { data: wishlistData = { newProductWishlist: [], usedProductWishlist: [] } } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlistProducts,
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const productsToShow = activeTab === "used" 
    ? wishlistData.usedProductWishlist 
    : wishlistData.newProductWishlist;

  const ProductComponent = activeTab === "used" ? UsedProductCard : Card;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pt-30 pb-20">
      <div className="flex flex-wrap justify-center gap-4 pb-8 pt-4">
        {["new", "used"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSearchParams({ show: tab }, { replace: true })}
            className={`text-base sm:text-lg px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ease-in-out border border-black dark:border-white ${activeTab === tab
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
              }`}
          >
            {tab === "new" ? (
              <span className="flex items-center gap-2 cursor-pointer">
                <ShoppingBag size={16} /> New Products
              </span>
            ) : (
              <span className="flex items-center gap-2 cursor-pointer">
                <Box size={16} /> Used Products
              </span>
            )}
          </button>
        ))}
      </div>
      
      <div className="w-full px-4 sm:px-8">
        {productsToShow.length > 0 ? (
          <div className="flex items-baseline justify-center flex-wrap gap-10 pt-2">
            {productsToShow.map((product) => (
              <div key={product._id} className="flex-shrink-0 w-[320px]">
                <ProductComponent
                  product={product}
                  userRole="buyer"
                  onQuickView={() => setQuickViewProduct(product)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
            <ShoppingBag size={40} className="mb-4" />
            <p className="text-lg font-medium">Your wishlist is empty in the {activeTab} section.</p>
            <p className="text-sm">Start adding products you love!</p>
          </div>
        )}
      </div>

      <QuickView
        product={quickViewProduct}
        type={activeTab}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default Wishlist;