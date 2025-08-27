import { useForm, useFieldArray } from "react-hook-form";
import { FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addProduct } from "../../api/product";
import { useLocation, useNavigate } from "react-router-dom";
import useStore from '../../store/store';
import useLoaderStore from "../../store/loader";
import useProductStore from "../../store/product";
import toast from "react-hot-toast";

export default function AddProductForm() {
  const location = useLocation();
  const { initialData } = location.state || {};
  const { startLoading, stopLoading } = useLoaderStore();
  const { store } = useStore();
  const navigate = useNavigate();
  const [imagePreviews, setImagePreviews] = useState(initialData?.images || []);
  const [videoPreview, setVideoPreview] = useState(initialData?.video || "");
  const [imgFile, setImgFile] = useState([]);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
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
      stock: initialData?.stock || "",
    },
  });

  const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } =
    useFieldArray({
      control,
      name: "attributes",
    });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    files.forEach((file) => {
      if (file.size <= 2 * 1024 * 1024) {
        validFiles.push(file);

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) =>
            [...prev, reader.result].slice(0, 5)
          );
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Image size should not exceed 2MB");
      }
    });

    setImgFile((prev) => [...prev, ...validFiles].slice(0, 5));
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImgFile((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 20 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => setVideoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      toast.error("Video size should not exceed 20MB");
      e.target.value = "";
    }
  };

  const cleanTags = (raw) => {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const removeVideo = () => setVideoPreview("");

  const onFormSubmit = async (data) => {
    const productData = {
      ...data,
      storeId: store._id,
      img: imgFile,
      video: videoPreview,
      attributes: data.attributes.filter(
        (attr) => attr.key.trim() && attr.value.trim()
      ),
      tags: cleanTags(data.tags)
    };
    if (!initialData || Object.keys(initialData).length === 0) {
      startLoading("product");
      try {
        const result = await addProduct(productData);
        if (result.data.storeId === store._id) {
          useProductStore.getState().addProduct(result.data);
          toast.success("Product added successfully");
          navigate('/seller/store');
        }
      } finally {
        stopLoading();
      }
    } else {
    }
    reset();
    setImagePreviews([]);
    setVideoPreview("");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pb-20 px-4 pt-40">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Product Title
              </label>
              <input
                id="title"
                autoComplete="off"
                {...register("title", {
                  required: "Title is required",
                  maxLength: {
                    value: 70,
                    message: "Title cannot exceed 70 characters",
                  },
                })}
                placeholder="Enter product title"
                className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="brand" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Brand Name
              </label>
              <input
                id="brand"
                autoComplete="off"
                {...register("brand")}
                placeholder="Enter brand name"
                className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              autoComplete="off"
              {...register("description", {
                required: "Description is required",
                validate: (value) =>
                  value.split(/\s+/).length <= 300 ||
                  "Description cannot exceed 300 words",
              })}
              placeholder="Enter product description (max 300 words)"
              rows="3"
              className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
            ></textarea>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="category" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Category
              </label>
              <input
                id="category"
                autoComplete="off"
                {...register("category", { required: "Category is required" })}
                placeholder="Enter category"
                className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
              />
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
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
              <label htmlFor="stock" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Stock
              </label>
              <input
                id="stock"
                autoComplete="off"
                {...register("stock", { required: "Stock is required" })}
                placeholder="Enter stock"
                className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
            </div>
            <div>
              <label htmlFor="price" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Price
              </label>
              <input
                id="price"
                type="number"
                autoComplete="off"
                {...register("price", { required: "Price is required" })}
                placeholder="Enter price"
                className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
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
                      {...register(`attributes.${index}.key`, { required: "Key is required" })}
                      placeholder="Attribute Key (e.g. Color)"
                      className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white focus:ring-2 focus:ring-sky-500"
                    />
                    <input
                      id={`attr-value-${index}`}
                      autoComplete="off"
                      {...register(`attributes.${index}.value`, { required: "Value is required" })}
                      placeholder="Attribute Value (e.g. Red)"
                      className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  {errors.attributes?.[index]?.key && (
                    <p className="text-red-500 text-sm mt-1">{errors.attributes[index].key.message}</p>
                  )}
                  {errors.attributes?.[index]?.value && (
                    <p className="text-red-500 text-sm mt-1">{errors.attributes[index].value.message}</p>
                  )}
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