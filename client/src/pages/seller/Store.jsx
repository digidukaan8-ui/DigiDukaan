import useStore from "../../store/store";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiTag, FiAlertTriangle, FiPlus } from "react-icons/fi";
import Card from "../../components/Card";
import UsedProductCard from "../../components/UsedProductCard";
import { useEffect, useState, useMemo } from "react";
import { getProduct, getUsedProduct } from "../../api/product";
import useLoaderStore from "../../store/loader";
import useProductStore from "../../store/product";
import useUsedProductStore from "../../store/usedProduct";
import { QuickView } from "../../components/index";
import { categories as newProductCategories, usedProductCategories, } from "../../utils/category";

const groupProductsByCategory = (products, categoryList) => {
  const grouped = {};
  const categoryNames = categoryList.map(cat => cat.name);

  categoryNames.forEach(name => {
    grouped[name] = [];
  });

  products.forEach(product => {
    const categoryName = product.category?.name;
    if (categoryName && grouped.hasOwnProperty(categoryName)) {
      grouped[categoryName].push(product);
    }
  });

  return Object.entries(grouped).filter(([, prods]) => prods.length > 0);
};


export default function Store() {
  const { store } = useStore();
  const { startLoading, stopLoading } = useLoaderStore();
  const navigate = useNavigate();
  const { products } = useProductStore();
  const { usedProducts } = useUsedProductStore();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!searchParams.get("show")) {
      searchParams.set("show", "new");
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const activeTab = searchParams.get("show") || "new";

  useEffect(() => {
    if (store) {
      if (products.length === 0) {
        const fetchNewProducts = async () => {
          startLoading("fetching");
          try {
            const data = await getProduct(store._id);
            if (data.length > 0) {
              data.forEach(product => useProductStore.getState().addProduct(product));
            }
          } finally {
            stopLoading();
          }
        };
        fetchNewProducts();
      }

      if (usedProducts.length === 0) {
        const fetchUsedProducts = async () => {
          startLoading("fetching");
          try {
            const data = await getUsedProduct(store._id);
            if (data.length > 0) {
              data.forEach(product => useUsedProductStore.getState().addUsedProduct(product));
            }
          } finally {
            stopLoading();
          }
        };
        fetchUsedProducts();
      }
    }
  }, [store]);

  const groupedNewProducts = useMemo(() => {
    if (activeTab === "new") {
      return groupProductsByCategory(products, newProductCategories);
    }
    return [];
  }, [products, activeTab]);

  const groupedUsedProducts = useMemo(() => {
    if (activeTab === "used") {
      return groupProductsByCategory(usedProducts, usedProductCategories);
    }
    return [];
  }, [usedProducts, activeTab]);


  if (!store) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100 dark:bg-neutral-950">
        <p
          onClick={() => navigate("/seller/store-details")}
          className="text-lg cursor-pointer text-black dark:text-white font-semibold hover:underline"
        >
          <FiPlus /> Add your store details to get started
        </p>
      </div>
    );
  }

  const productsToShow = activeTab === "new" ? groupedNewProducts : groupedUsedProducts;
  const hasProducts = productsToShow.length > 0;

  const warningMessage = activeTab === "new"
    ? "New products marked as 'Not Available' or having zero stock will not be displayed to buyers."
    : "Used products with 'Payment Due' or marked as 'Sold' will not be displayed to general buyers.";

  const warningIconColor = activeTab === "new" ? "text-yellow-600" : "text-red-600";
  const warningBgColor = activeTab === "new" ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-red-50 dark:bg-red-900/20";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pb-20 pt-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-wrap justify-center gap-4 pb-3">
          {["new", "used"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                searchParams.set("show", tab);
                setSearchParams(searchParams, { replace: true });
              }}
              className={`text-base sm:text-lg cursor-pointer px-6 py-2 rounded-lg border border-black dark:border-white font-semibold transition-all duration-300 ease-in-out ${activeTab === tab
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-neutral-900 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800"
                }`}
            >
              {tab === "new" ? "New Products" : "Used Products"}
            </button>
          ))}
        </div>

        <div className={`flex items-center gap-3 mt-4 p-4 rounded-lg shadow-sm border border-black dark:border-white ${warningBgColor}`}>
          <FiAlertTriangle className={`w-6 h-6 ${warningIconColor}`} />
          <p className={`text-sm font-medium text-gray-800 dark:text-gray-200`}>
            {warningMessage}
          </p>
        </div>

        <div className="mt-8">
          {!hasProducts ? (
            <div className="p-10 text-center bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-black dark:border-white">
              <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
                No {activeTab} products found in your store yet.
              </p>
              <button
                onClick={() => navigate(activeTab === "new" ? "/seller/new-product" : "/seller/used-product")}
                className="mt-4 text-sky-600 dark:text-sky-400 hover:underline font-semibold"
              >
                Click here to add your first {activeTab} product!
              </button>
            </div>
          ) : (
            productsToShow.map(([categoryName, productsList]) => (
              <div key={categoryName} className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 border-b-2 border-sky-500 pb-2 flex items-center gap-3">
                  <FiTag className="text-sky-500" /> {categoryName} ({productsList.length})
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start items-baseline gap-10">
                  {productsList.map((product) =>
                    activeTab === "new" ? (
                      <Card
                        key={product._id}
                        product={product}
                        userRole="seller"
                        onQuickView={() => setQuickViewProduct(product)}
                      />
                    ) : (
                      <UsedProductCard
                        key={product._id}
                        product={product}
                        userRole="seller"
                        onQuickView={() => setQuickViewProduct(product)}
                      />
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>
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