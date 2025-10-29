import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useCategoryProductStore from "../../store/categoryProducts";
import useUsedCategoryProductStore from "../../store/categoryUsedProduct";
import { Location, QuickView, Card, UsedProductCard, HomeRecommendation } from "../../components/index";
import useAuthStore from "../../store/auth";
import { getCart, getWishlistProducts } from "../../api/product";
import useCartStore from "../../store/cart";
import useWishlistStore from "../../store/wishlist";
import { ArrowRight, ShoppingBag, Box, Tag } from 'lucide-react';

const Home = () => {
  const categories = useCategoryProductStore((state) => state.categories);
  const usedProductCategories = useUsedCategoryProductStore((state) => state.usedProductCategories);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  let { user, isAuthenticated } = useAuthStore();
  const { cart, isFetched } = useCartStore();
  const { wishlist } = useWishlistStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchParams.get("show")) {
      searchParams.set("show", "new");
      setSearchParams(searchParams, { replace: true });
    }

    if (user && user.role === "buyer" && isAuthenticated) {
      if (cart.length === 0 && !isFetched) fetchCartItems();
      if (!wishlist._id || wishlist.productIds.length === 0) {
        fetchWishlist();
      }
    }
  }, [user]);

  const fetchCartItems = async () => {
    const result = await getCart();
    if (result.success) {
      useCartStore.getState().clearCart();
      useCartStore.getState().setCart(result.data || []);
    }
  };

  const fetchWishlist = async () => {
    const result = await getWishlistProducts();
    if (result.success) {
      useWishlistStore.getState().clearWishlist();
      useWishlistStore.getState().setWishlist(result.data || []);
    }
  };

  const activeTab = searchParams.get("show") || "new";
  const currentCategories = activeTab === "used" ? usedProductCategories : categories;

  if (!user) user = { role: "buyer" };
  else if (!user.role) user.role = "buyer";

  return (
    <>
      {user.role === "buyer" && (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pt-30">
          <Location />

          <div className="flex flex-wrap justify-center gap-4 pb-8 pt-4">
            {["new", "used"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  searchParams.set("show", tab);
                  setSearchParams(searchParams, { replace: true });
                }}
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

          <HomeRecommendation />
          
          <div className="space-y-12 bg-gray-100 dark:bg-neutral-950 pb-20">
            {currentCategories.map((categoryObj, index) => {
              const [categoryName, products] = Object.entries(categoryObj)[0];
              if (!products || products.length === 0) return null;

              return (
                <div key={index} className="px-0 sm:px-4">
                  <div
                    onClick={() => navigate(`/category-product?slug=${categoryName}&page=1&show=${activeTab}`)}
                    className="flex items-center justify-between mx-4 sm:mx-0 p-4 mb-4 border-b border-black dark:border-white cursor-pointer transition-colors"
                  >
                    <h2 className="text-xl sm:text-2xl capitalize font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                      <Tag size={20} className="text-sky-600 dark:text-sky-400" />
                      {categoryName}
                    </h2>
                    {products?.length === 10 && (<span className="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1 hover:gap-2 transition-all duration-300">
                      View All
                      <ArrowRight size={18} />
                    </span>)}
                  </div>

                  <div className="flex items-start justify-start gap-4 sm:gap-6 pt-2 overflow-x-auto hide-scrollbar scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent px-4 sm:px-0">
                    {products.map((product) => (
                      <div key={product._id} className="flex-shrink-0 w-[320px]">
                        {activeTab === "used" ? (
                          <UsedProductCard
                            product={product}
                            userRole="buyer"
                            onQuickView={() => setQuickViewProduct(product)}
                          />
                        ) : (
                          <Card
                            product={product}
                            userRole="buyer"
                            onQuickView={() => setQuickViewProduct(product)}
                          />
                        )}
                      </div>
                    ))}
                    {products?.length === 10 && (<div className="flex-shrink-0 w-[150px] sm:w-[200px] flex items-center justify-center my-auto p-4">
                      <button
                        onClick={() => navigate(`/category-product?slug=${categoryName}&page=1`)}
                        className="flex flex-col items-center justify-center cursor-pointer text-center text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                      >
                        <ArrowRight className="w-10 h-10 mb-2 p-2 border-2 border-sky-500 rounded-full" />
                        <span className="font-semibold text-sm">See More in {categoryName}</span>
                      </button>
                    </div>)}
                  </div>
                </div>
              );
            })}
          </div>

          <QuickView
            product={quickViewProduct}
            type={activeTab}
            isOpen={!!quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        </div>
      )}

      {(user.role === "seller" || user.role === "admin") && (
        <div className="w-full min-h-screen bg-gray-100 dark:bg-neutral-950 flex justify-center items-center text-black dark:text-white">
          <p>Login using a buyer account to view this page</p>
        </div>
      )}
    </>
  );
};

export default Home;