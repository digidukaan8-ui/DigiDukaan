import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useCategoryProductStore from "../../store/categoryProducts";
import useUsedCategoryProductStore from "../../store/categoryUsedProduct";
import { Location, QuickView, Card, UsedProductCard } from "../../components/index";
import useAuthStore from "../../store/auth";
import { getCart, getWishlistProducts } from "../../api/product";
import useCartStore from "../../store/cart";
import useWishlistStore from "../../store/wishlist";
import { ArrowRight } from 'lucide-react';

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
        <>
          <Location />

          <div className="flex justify-center gap-4 pb-5 bg-gray-100 dark:bg-neutral-950">
            {["new", "used"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  searchParams.set("show", tab);
                  setSearchParams(searchParams, { replace: true });
                }}
                className={`text-sm sm:text-base px-5 py-2 rounded-lg border border-black dark:border-white font-semibold transition-colors duration-300 ${activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-neutral-900 text-black dark:text-white"
                  }`}
              >
                {tab === "new" ? "New Products" : "Used Products"}
              </button>
            ))}
          </div>

          <div className="space-y-8 bg-gray-100 dark:bg-neutral-950 pb-20">
            {currentCategories.map((categoryObj, index) => {
              const [categoryName, products] = Object.entries(categoryObj)[0];
              if (!products || products.length === 0) return null;

              return (
                <div key={index} className="px-4">
                  <div
                    onClick={() => navigate(`/category-product?slug=${categoryName}&page=1&show=${activeTab}`)}
                    className="flex w-full justify-between items-baseline text-gray-900 dark:text-white border-b p-4 mb-4 hover:bg-white dark:hover:bg-neutral-900">
                    <h2 className="text-xl sm:text-2xl capitalize font-bold">
                      {categoryName}
                    </h2>
                    <span className="text-xl sm:text-2xl capitalize font-bold">
                      <ArrowRight />
                    </span>
                  </div>
                  <div className="flex gap-5 pt-2 sm:gap-8 overflow-x-auto hide-scrollbar scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent -mx-4 px-4">
                    {products.map((product) => (
                      <div key={product._id} className="flex-shrink-0 w-[300px]">
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
        </>
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