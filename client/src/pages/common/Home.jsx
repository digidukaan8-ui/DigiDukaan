import useCategoryProductStore from "../../store/categoryProducts";
import Card from "../../components/Card";
import { useState } from "react";
import { Location, QuickView } from '../../components/index';
import useAuthStore from "../../store/auth";

const Home = () => {
  const categories = useCategoryProductStore((state) => state.categories);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  let { user } = useAuthStore();

  if (!user) {
    user = { role: "buyer" };
  } else if (!user.role) {
    user.role = "buyer";
  }

  return (
    <>
      {user.role === "buyer" &&
        (
          <>
            <Location />
            
            <div className="space-y-8 bg-gray-100 dark:bg-neutral-950 pb-8">
              {categories.map((categoryObj, index) => {
                const [categoryName, products] = Object.entries(categoryObj)[0];

                return (
                  <div key={index} className="px-4">
                    <h2 className="text-xl sm:text-2xl font-bold capitalize text-gray-900 dark:text-white mb-4">
                      {categoryName}
                    </h2>
                    <div className="flex gap-5 sm:gap-8 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent -mx-4 px-4">
                      {products.map((product) => (
                        <div key={product._id} className="flex-shrink-0 w-[300px]">
                          <Card
                            product={product}
                            userRole="buyer"
                            onQuickView={() => setQuickViewProduct(product)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <QuickView
              product={quickViewProduct}
              isOpen={!!quickViewProduct}
              onClose={() => setQuickViewProduct(null)}
            />
          </>
        )}
      {(user.role === "seller" || user.role === "admin") &&
        (
          <div className="w-full min-h-screen bg-gray-100 dark:bg-neutral-950 flex justify-center items-center text-black dark:text-white">
            <p>Login using a buyer account to view this page</p>
          </div>
        )}
    </>
  );
};

export default Home;
