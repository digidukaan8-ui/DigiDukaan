import useStore from "../../store/store";
import { useNavigate,useSearchParams } from "react-router-dom";
import { FiMapPin, FiHome, FiEdit3 } from "react-icons/fi";
import Card from "../../components/Card";
import UsedProductCard from "../../components/UsedProductCard";
import { useEffect, useState } from "react";
import { getProduct, getUsedProduct } from "../../api/product";
import useLoaderStore from "../../store/loader";
import useProductStore from "../../store/product";
import useUsedProductStore from "../../store/usedProduct";
import { QuickView } from "../../components/index";

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
  }, []);

  if (!store) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100 dark:bg-neutral-950">
        <p
          onClick={() => navigate("/seller/store-details")}
          className="text-lg cursor-pointer text-black dark:text-white font-semibold hover:underline"
        >
          Add your store details
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pb-20 pt-30">
      <div className="max-w-[calc(100%-2rem)] mx-auto bg-white dark:bg-neutral-900 rounded-lg shadow-lg overflow-hidden border border-black dark:border-white">
        <div className="flex justify-between items-start p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{store.name}</h1>
          <button
            onClick={() => navigate("/seller/store-details", { state: { initialData: store } })}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
          >
            <FiEdit3 className="text-xl text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 px-6 pb-6">
          <div className="flex-shrink-0 w-60 h-60 rounded-lg overflow-hidden shadow-lg">
            {store.img && <img src={store.img.url} alt={store.name} className="w-full h-full object-cover" />}
          </div>

          <div className="flex flex-col gap-6 flex-1">
            <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base line-clamp-3">{store.description}</p>

            <div className="flex flex-wrap gap-2">
              {store.category.map((cat, idx) => (
                <span
                  key={idx}
                  className="bg-sky-500 text-white px-3 py-1 rounded border border-black dark:border-white text-sm font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {store.addresses.map((addr, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white rounded-2xl shadow-sm hover:shadow-md transition duration-300"
                >
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
                    <FiHome className="text-sky-500" /> Address {index + 1}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">{addr.addressLine1}</p>
                  {addr.addressLine2 && <p className="text-gray-700 dark:text-gray-300">{addr.addressLine2}</p>}
                  <p className="flex items-center text-gray-600 dark:text-gray-400 mt-1 gap-1">
                    <FiMapPin className="text-sky-500" /> {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center sm:justify-normal items-center gap-4 mt-4">
              <button
                onClick={() => navigate("/seller/new-product")}
                className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg shadow border border-black dark:border-white cursor-pointer"
              >
                Add New Product
              </button>
              <button
                onClick={() => navigate("/seller/used-product")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow border border-black dark:border-white cursor-pointer"
              >
                Add Used Product
              </button>
              <button
                onClick={() => navigate("/seller/delivery-zone")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow border border-black dark:border-white cursor-pointer"
              >
                Manage Delivery Zone
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8">
        <div className="flex justify-center gap-4 pb-3 bg-gray-100 dark:bg-neutral-950">
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
        <div className="flex flex-wrap justify-around items-center gap-5 mt-10">
          {activeTab === "new" ? (
            products.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center">No new products yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card
                    key={product._id}
                    product={product}
                    userRole="seller"
                    onQuickView={() => setQuickViewProduct(product)}
                  />
                ))}
              </div>
            )
          ) : usedProducts.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center">No used products yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {usedProducts.map((product) => (
                <UsedProductCard
                  key={product._id}
                  product={product}
                  userRole="seller"
                  onQuickView={() => setQuickViewProduct(product)}
                />
              ))}
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
    </div>
  );
}