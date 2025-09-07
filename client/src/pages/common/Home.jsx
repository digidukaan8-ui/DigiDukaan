import useCategoryProductStore from "../../store/categoryProducts";
import Card from "../../components/Card";
import { useState } from "react";
import { Location, QuickView } from '../../components/index';

const Home = () => {
  const categories = useCategoryProductStore((state) => state.categories);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <>
      <Location />
      <div className="space-y-8 bg-gray-100 dark:bg-neutral-950 pb-8">
        {categories.map((categoryObj, index) => {
          const [categoryName, products] = Object.entries(categoryObj)[0];

          return (
            <div key={index} className="px-6">
              <h2 className="text-2xl font-bold capitalize text-gray-900 dark:text-white">
                {categoryName}
              </h2>
              <div className="flex gap-6 overflow-x-auto pt-6 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                {products.map((product) => (
                  <Card key={product._id} product={product} userRole="buyer" onQuickView={() => setQuickViewProduct(product)} />
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
  );
};

export default Home;
