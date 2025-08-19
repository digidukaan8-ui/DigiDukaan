import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function AddProduct() {
  const [darkMode, setDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    subCategory: "",
    price: "",
    discountPercentage: "",
    discountAmount: "",
    stock: "",
    brand: "",
    isAvailable: true,
    tags: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen`}>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center p-6 relative">

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 shadow-md"
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-yellow-400" />
          ) : (
            <Moon className="w-4 h-4 text-gray-700" />
          )}
        </button>

        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            Add New Product
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm 
                focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm 
                focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm 
                focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              ></textarea>
            </div>

            {/* Category + SubCategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm 
                  focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  SubCategory
                </label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm 
                  focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Price + Discount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm 
                  focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Discount %
                </label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm 
                  focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Discount Amount
                </label>
                <input
                  type="number"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm 
                  focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Stock + Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm 
                  focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm 
                  focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 shadow-sm 
                focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Availability */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Available
              </label>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md 
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Add Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
