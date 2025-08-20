import useStore from "../../store/store";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiHome, FiEdit3 } from "react-icons/fi";
import Card from "../../components/Card";

export default function StorePage() {
  const { store, products = [] } = useStore(); // assuming products bhi aa rahe hain
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 py-6 px-4">
      <div className="max-w-7xl mx-auto bg-white dark:bg-neutral-900 rounded-lg shadow-lg overflow-hidden border border-black dark:border-white">
        {/* Store Header */}
        <div className="flex justify-between items-start p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {store.name}
          </h1>
          <button
            onClick={() => navigate("/seller/store-details")}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
          >
            <FiEdit3 className="text-xl text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Store Details */}
        <div className="flex flex-col md:flex-row gap-6 px-6 pb-6">
          <div className="flex-shrink-0 w-full md:w-[400px] h-[350px] rounded-lg overflow-hidden shadow-lg">
            {store.img?.url && (
              <img
                src={store.img.url}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex flex-col gap-6 flex-1">
            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base line-clamp-3">
                {store.description}
              </p>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {store.addresses.map((addr, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white rounded-2xl shadow-sm hover:shadow-md transition duration-300"
                >
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
                    <FiHome className="text-sky-500" />
                    Address {index + 1}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">{addr.addressLine1}</p>
                  {addr.addressLine2 && (
                    <p className="text-gray-700 dark:text-gray-300">{addr.addressLine2}</p>
                  )}
                  <p className="flex items-center text-gray-600 dark:text-gray-400 mt-1 gap-1">
                    <FiMapPin className="text-sky-500" /> {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/seller/add-product")}
                className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg shadow"
              >
                Add New Product
              </button>
              <button
                onClick={() => navigate("/seller/add-used-product")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow"
              >
                Add Used Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Products
        </h2>
        {products.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}