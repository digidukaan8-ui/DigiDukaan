import useStore from "../../store/store";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiMapPin, FiHome, FiEdit3, FiPackage, FiBox, FiFileText, FiGlobe, FiTag, FiTruck, FiAlertTriangle, FiPlus } from "react-icons/fi";
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

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden border border-black dark:border-white p-6 sm:p-8 mb-8">

          <div className="pb-4 border-b border-gray-200 dark:border-neutral-800 mb-6">
            <h1 className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
              {store.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Store management dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-6">

              <div className="w-full aspect-square rounded-xl overflow-hidden shadow-xl border border-black dark:border-white">
                {store?.img ? (
                  <img
                    src={store?.img?.url}
                    alt={`${store?.name} logo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-neutral-700 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 text-lg font-semibold p-4">
                    <FiGlobe className="text-4xl mb-2" />
                    <p>Store Logo</p>
                  </div>
                )}
              </div>


              <div className="flex flex-col gap-3 p-4 bg-gray-100 dark:bg-neutral-950 rounded-lg border border-black dark:border-white shadow-md">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-neutral-700 pb-2 mb-2">Quick Actions</h3>

                <button
                  onClick={() => navigate("/seller/store-details", { state: { initialData: store } })}
                  className="flex items-center justify-center gap-2 cursor-pointer bg-sky-600 hover:bg-sky-700 text-white px-3 py-2.5 rounded-lg shadow border border-black dark:border-white transition duration-200 text-sm font-medium w-full"
                >
                  <FiEdit3 /> Edit Store Details
                </button>

                <button
                  onClick={() => navigate("/seller/new-product")}
                  className="flex items-center justify-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2.5 rounded-lg shadow border border-black dark:border-white transition duration-200 text-sm font-medium w-full"
                >
                  <FiPackage /> Add New Product
                </button>

                <button
                  onClick={() => navigate("/seller/used-product")}
                  className="flex items-center justify-center gap-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-3 py-2.5 rounded-lg shadow border border-black dark:border-white transition duration-200 text-sm font-medium w-full"
                >
                  <FiBox /> Add Used Product
                </button>

                <button
                  onClick={() => navigate("/seller/delivery-zone")}
                  className="flex items-center justify-center gap-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-lg shadow border border-black dark:border-white transition duration-200 text-sm font-medium w-full"
                >
                  <FiTruck /> Manage Delivery Zones
                </button>
              </div>
            </div>

            <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-6">

              <div className="p-4 bg-gray-100 dark:bg-neutral-950 rounded-lg border border-black dark:border-white shadow-inner h-32 overflow-y-auto">
                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <FiFileText className="text-sky-500" /> Store Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  {store.description || "No detailed store description provided yet. Use the 'Edit Details' button to add one!"}
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-black dark:border-white shadow-sm h-32 overflow-y-auto">
                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <FiTag className="text-sky-500" /> Selling Categories
                </h3>
                <div className="flex flex-wrap gap-3 items-center">
                  {store.category && store.category.length > 0 ? (
                    store.category.map((cat, idx) => (
                      <span
                        key={idx}
                        className="bg-sky-500 text-white px-3 py-1 rounded-full border border-black dark:border-white text-sm font-medium shadow-sm whitespace-nowrap"
                      >
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">No categories specified.</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-black dark:border-white shadow-sm">
                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <FiHome className="text-sky-500" /> Store Locations
                </h3>
                {store.addresses && store.addresses.length > 0 ? (
                  <div className="flex space-x-4 overflow-x-scroll pb-2 custom-scrollbar hide-scrollbar">
                    {store.addresses.map((addr, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-80 p-3 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white rounded-xl shadow-sm"
                      >
                        <p className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                          Location {index + 1}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-gray-700 dark:text-gray-300 text-sm">{addr.addressLine2}</p>}
                        <p className="flex items-center text-gray-600 dark:text-gray-400 mt-1 text-xs gap-1">
                          <FiMapPin className="text-sky-500" /> {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No physical addresses listed.</p>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="mt-10">

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
                  <div className="flex space-x-4 overflow-x-scroll pb-4 custom-scrollbar hide-scrollbar">
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
    </div>
  );
}