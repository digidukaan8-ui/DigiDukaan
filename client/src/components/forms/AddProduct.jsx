import { useForm, useFieldArray } from "react-hook-form";
import { FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddProductForm({ initialData = null, onSubmit }) {
  const [imagePreviews, setImagePreviews] = useState(initialData?.images || []);
  const [videoPreview, setVideoPreview] = useState(initialData?.video || "");

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      subCategory: initialData?.subCategory || "",
      brand: initialData?.brand || "",
      price: initialData?.price || "",
      discount: initialData?.discount || { type: "percentage", value: "" },
      tags: initialData?.tags || "",
      attributes: initialData?.attributes || [{ key: "", value: "" }],
    },
  });

  const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } =
    useFieldArray({
      control,
      name: "attributes",
    });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];

    files.forEach((file) => {
      if (file.size <= 2 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result);
          if (newImages.length === files.length) {
            setImagePreviews((prev) => [...prev, ...newImages].slice(0, 5));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 20 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => setVideoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => setVideoPreview("");

  const onFormSubmit = (data) => {
    const productData = {
      ...data,
      images: imagePreviews,
      video: videoPreview,
      attributes: data.attributes.filter(
        (attr) => attr.key.trim() && attr.value.trim()
      ),
    };
    if (onSubmit) onSubmit(productData);
    reset();
    setImagePreviews([]);
    setVideoPreview("");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white dark:bg-neutral-900 px-6 py-8 rounded-lg border border-black dark:border-white shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
          {initialData ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Product Title
            </label>
            <input
              id="title"
              autoComplete="off"
              {...register("title", { required: true })}
              placeholder="Enter product title"
              className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="description" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              autoComplete="off"
              {...register("description")}
              placeholder="Enter product description"
              rows="3"
              className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="category" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Category
              </label>
              <input
                id="category"
                autoComplete="off"
                {...register("category", { required: true })}
                placeholder="Enter category"
                className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="subCategory" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Sub Category
              </label>
              <input
                id="subCategory"
                autoComplete="off"
                {...register("subCategory")}
                placeholder="Enter sub category"
                className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="brand" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Brand Name
              </label>
              <input
                id="brand"
                autoComplete="off"
                {...register("brand", { required: true })}
                placeholder="Enter brand name"
                className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="price" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Price
              </label>
              <input
                id="price"
                type="number"
                autoComplete="off"
                {...register("price", { required: true })}
                placeholder="Enter price"
                className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="discount" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Discount
              </label>
              <div className="flex gap-2">
                <select
                  {...register("discount.type")}
                  className="border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
                >
                  <option value="percentage">%</option>
                  <option value="flat">₹</option>
                </select>
                <input
                  id="discount"
                  type="number"
                  autoComplete="off"
                  {...register("discount.value")}
                  placeholder="Value"
                  className="w-0 flex-1 border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Tags
              </label>
              <input
                id="tags"
                autoComplete="off"
                {...register("tags")}
                placeholder="Comma separated tags"
                className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="img" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Product Images (Max 5, 2MB each)
            </label>
            <input
              id="img"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
            />
            <div className="flex gap-3 flex-wrap mt-3">
              <AnimatePresence>
                {imagePreviews.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <img
                      src={img}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <FiX size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <label htmlFor="video" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Product Video (Max 20MB)
            </label>
            {!videoPreview ? (
              <input
                id="video"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative mt-2"
              >
                <video
                  src={videoPreview}
                  controls
                  className="w-60 h-40 rounded border"
                />
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <FiX size={14} />
                </button>
              </motion.div>
            )}
          </div>

          <div>
            <h3 className="text-lg text-center font-semibold mb-3 text-gray-900 dark:text-gray-200">
              Attributes
            </h3>
            <AnimatePresence>
              {attributeFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 mb-4 border border-black dark:border-white rounded-lg relative bg-gray-100 dark:bg-neutral-950/40"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">
                      Attribute {index + 1}
                    </span>
                    {attributeFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttribute(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="flex justify-center items-center gap-5">
                    <input
                      id={`attr-key-${index}`}
                      autoComplete="off"
                      {...register(`attributes.${index}.key`)}
                      placeholder="Attribute Key (e.g. Color)"
                      className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white focus:ring-2 focus:ring-sky-500"
                    />
                    <input
                      id={`attr-value-${index}`}
                      autoComplete="off"
                      {...register(`attributes.${index}.value`)}
                      placeholder="Attribute Value (e.g. Red)"
                      className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => appendAttribute({ key: "", value: "" })}
              className="flex items-center gap-2 text-sky-500 font-medium text-sm hover:underline mt-2"
            >
              <FiPlus /> Add Attribute
            </button>
          </div>

          <div className="flex justify-center items-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              type="submit"
              className="w-fit bg-sky-600 text-white py-2 px-4 border rounded font-medium text-sm hover:bg-sky-700 transition"
            >
              {initialData ? "Update Product" : "Save Product"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}