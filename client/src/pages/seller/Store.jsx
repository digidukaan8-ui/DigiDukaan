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
        <div className="text-center p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-gray-200 dark:border-neutral-800 max-w-md">
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPlus className="text-sky-600 dark:text-sky-400 text-3xl" />
          </div>
          <p className="text-xl text-gray-800 dark:text-gray-200 font-semibold mb-4">
            No Store Found
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add your store details to get started
          </p>
          <button
            onClick={() => navigate("/seller/store-details")}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Add Store Details
          </button>
        </div>
      </div>
    );
  }

  const productsToShow = activeTab === "new" ? groupedNewProducts : groupedUsedProducts;
  const hasProducts = productsToShow.length > 0;

  const warningMessage = activeTab === "new"
    ? "New products marked as 'Not Available' or having zero stock will not be displayed to buyers."
    : "Used products with 'Payment Due' or marked as 'Sold' will not be displayed to general buyers.";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pb-20 pt-24 md:pt-28">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        <div className="flex flex-wrap justify-center gap-3 pb-6">
          {["new", "used"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                searchParams.set("show", tab);
                setSearchParams(searchParams, { replace: true });
              }}
              className={`text-sm sm:text-base cursor-pointer px-6 py-3 rounded-xl font-semibold transition-all duration-200 ease-in-out shadow-sm border border-black dark:border-white ${activeTab === tab
                ? "bg-sky-600 dark:bg-sky-700 text-white shadow-md scale-105"
                : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                }`}
            >
              {tab === "new" ? "New Products" : "Used Products"}
            </button>
          ))}
        </div>

        <div className={`flex items-start gap-3 p-4 rounded-xl shadow-sm border border-black dark:border-white ${activeTab === "new"
          ? "bg-yellow-50 dark:bg-yellow-900/10"
          : "bg-red-50 dark:bg-red-900/10"
          }`}>
          <FiAlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${activeTab === "new" ? "text-yellow-600 dark:text-yellow-500" : "text-red-600 dark:text-red-500"}`} />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {warningMessage}
          </p>
        </div>

        <div className="mt-8">
          {!hasProducts ? (
            <div className="p-10 md:p-16 text-center bg-white dark:bg-neutral-900 rounded-2xl shadow-md border border-gray-200 dark:border-neutral-800">
              <div className="w-20 h-20 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTag className="text-gray-400 dark:text-gray-600 text-3xl" />
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 font-semibold mb-2">
                No {activeTab} products found
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start adding products to your store
              </p>
              <button
                onClick={() => navigate(activeTab === "new" ? "/seller/new-product" : "/seller/used-product")}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                Add Your First {activeTab === "new" ? "New" : "Used"} Product
              </button>
            </div>
          ) : (
            productsToShow.map(([categoryName, productsList]) => (
              <div key={categoryName} className="mb-12">
                <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-sm mb-6 border border-black dark:border-white">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center">
                      <FiTag className="text-sky-600 dark:text-sky-400 text-lg" />
                    </div>
                    <span>{categoryName}</span>
                    <span className="ml-auto text-sm font-normal bg-gray-100 dark:bg-neutral-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-400">
                      {productsList.length} {productsList.length === 1 ? 'item' : 'items'}
                    </span>
                  </h2>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start items-baseline gap-6 md:gap-8">
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