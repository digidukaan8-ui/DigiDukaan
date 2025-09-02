import { useForm, useFieldArray } from "react-hook-form";
import { FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addProduct, updateProduct } from "../../api/product";
import { useLocation, useNavigate } from "react-router-dom";
import useStore from "../../store/store";
import useLoaderStore from "../../store/loader";
import useProductStore from "../../store/product";
import toast from "react-hot-toast";
import { categories, getSubCategories } from "../../utils/category";

export default function NewProductForm() {
  const location = useLocation();
  const { initialData } = location.state || {};
  const { startLoading, stopLoading } = useLoaderStore();
  const { store } = useStore();
  const navigate = useNavigate();
  const [imagePreviews, setImagePreviews] = useState(
    initialData?.img || []
  );
  const [videoPreview, setVideoPreview] = useState(initialData?.video?.url || "");
  const [imgFile, setImgFile] = useState([]);
  const [removedImg, setRemovedImg] = useState([]);
  const [videoFile, setVideoFile] = useState(initialData?.video?.url || null);
  const [canUpdate, setCanUpdate] = useState(false);
  const defaultCategory = initialData?.category?.name || categories[0]?.name || "";
  const defaultSubCategories = getSubCategories(defaultCategory) || [];
  const defaultSubCategory = initialData?.subCategory?.name || defaultSubCategories[0]?.name || "";
  const [subCategories, setSubCategories] = useState(getSubCategories(defaultCategory) || []);

  const { register, control, handleSubmit, setValue, reset, watch, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: defaultCategory,
      subCategory: defaultSubCategory,
      brand: initialData?.brand || "",
      price: initialData?.price || "",
      discount: initialData?.discount
        ? initialData.discount.percentage !== null
          ? { type: "percentage", value: initialData.discount.percentage }
          : { type: "amount", value: initialData.discount.amount }
        : { type: "percentage", value: "" },
      tags: initialData?.tags || "",
      attributes: initialData?.attributes || [{ key: "", value: "" }],
      stock: initialData?.stock || "",
      keptImg: initialData?.img || [],
      video: initialData?.video?.url || "",
    },
  });

  const watchedValues = watch();
  const watchedCategory = watch("category");

  useEffect(() => {
    const subs = getSubCategories(watchedCategory) || [];
    setSubCategories(subs);

    const currentSub = watch("subCategory");
    if (!subs.includes(currentSub)) {
      setValue("subCategory", subs[0] || "");
    }
  }, [watchedCategory, setValue, watch]);

  useEffect(() => {
    let changed = false;
    if (isDirty) changed = true;

    const initialImgCount = initialData?.img?.length || 0;
    if (
      imagePreviews.length !== initialImgCount ||
      removedImg.length > 0 ||
      imgFile.length > 0
    ) {
      changed = true;
    }

    const initialVideo = initialData?.video?.url || "";
    if (videoPreview !== initialVideo) {
      changed = true;
    }

    setCanUpdate(changed);
  }, [watchedValues, isDirty, imagePreviews, removedImg, imgFile, videoPreview, initialData]);

  const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } =
    useFieldArray({
      control,
      name: "attributes",
    });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (imagePreviews.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images");
      return;
    }

    const validFiles = [];

    files.forEach((file) => {
      if (file.size <= 2 * 1024 * 1024) {
        validFiles.push(file);

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [
            ...prev,
            {
              name: file.name,
              url: reader.result,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Image size should not exceed 2MB");
      }
    });

    setImgFile((prev) => [...prev, ...validFiles].slice(0, 5));
    e.target.value = "";
  };

  const removeImage = (img, id) => {
    setImagePreviews((prev) => prev.filter((item) => item !== img));

    if (id) {
      setRemovedImg((old) => [...old, img]);
    }

    setImgFile((prev) => prev.filter((item) => item.name !== img.name));
  };


  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Video size should not exceed 20MB");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setVideoPreview(reader.result);
    reader.readAsDataURL(file);
    setVideoFile(file);
  };

  const removeVideo = () => {
    setVideoPreview("");
    setVideoFile(null);
  };

  const cleanTags = (raw) => {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const onFormSubmit = async (data) => {
    if (imagePreviews.length < 1) {
      toast.error("At least one image is required");
      return;
    }
    if (!initialData || Object.keys(initialData).length === 0) {
      const productData = {
        ...data,
        storeId: store._id,
        img: imgFile,
        video: videoFile,
        attributes: data.attributes.filter(
          (attr) => attr.key.trim() && attr.value.trim()
        ),
        tags: cleanTags(data.tags),
        deliveryCharge: Number(data.deliveryCharge) || 0,
      };
      startLoading("product");
      try {
        const result = await addProduct(productData);
        if (result.data.storeId === store._id) {
          useProductStore.getState().addProduct(result.data);
          toast.success("Product added successfully");
          navigate("/seller/store");
          reset();
          setImagePreviews([]);
          setVideoPreview("");
        }
      } finally {
        stopLoading();
      }
    } else {
      if (!Array.isArray(data.tags)) {
        data.tags = cleanTags(data.tags);
      }
      const discount = {
        percentage: data.discount.type === "percentage" ? Number(data.discount.value) : null,
        amount: data.discount.type === "amount" ? Number(data.discount.value) : null,
      };

      const keepImg = data.keptImg.filter(
        (img) =>
          !removedImg.some(
            (removed) =>
              removed.url === img.url || removed.publicId === img.publicId
          )
      );

      const productData = {
        ...data,
        productId: initialData?._id,
        img: imgFile,
        video: videoFile,
        attributes: data.attributes.filter(
          (attr) => attr.key.trim() && attr.value.trim()
        ),
        tags: data.tags,
        deliveryCharge: Number(data.deliveryCharge) || 0,
        discount,
        removedImg,
        keptImg: keepImg,
      };
      startLoading("updateProduct");
      try {
        const result = await updateProduct(productData);
        if (result.data.storeId === store._id) {
          useProductStore.getState().updateProduct(result.data);
          toast.success("Product Updated successfully");
          navigate("/seller/store");
          reset();
          setImagePreviews([]);
          setVideoPreview("");
        }
      } finally {
        stopLoading();
      }
    }
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
              <select
                id="category"
                {...register("category", { required: "Category is required" })}
                className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
              >
                {categories.map((cat, index) => (
                  <option key={`${cat.name}-${index}`} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label
                htmlFor="subCategory"
                className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300"
              >
                Sub Category
              </label>
              {subCategories.length > 0 ? (
                <select
                  id="subCategory"
                  {...register("subCategory", { required: "Sub Category is required" })}
                  className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
                >
                  {subCategories.map((sub, index) => (
                    <option key={`${sub}-${index}`} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No subcategories available for this category</p>
              )}
              {errors.subCategory && (
                <p className="text-red-500 text-sm mt-1">{errors.subCategory.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="discount"
                className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300"
              >
                Discount
              </label>
              <div className="flex gap-2">
                <select
                  {...register("discount.type")}
                  className="border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
                >
                  <option value="percentage">%</option>
                  <option value="amount">₹</option>
                </select>

                <input
                  id="discount"
                  type="number"
                  step="any"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

            <div>
              <label htmlFor="deliveryCharge" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Delivery Charge
              </label>
              <input
                id="deliveryCharge"
                type="number"
                autoComplete="off"
                {...register("deliveryCharge")}
                placeholder="Enter delivery charge"
                className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
              />
              {errors.deliveryCharge && <p className="text-red-500 text-sm mt-1">{errors.deliveryCharge.message}</p>}
              <p className="pl-0.5 text-xs text-gray-600 dark:text-gray-400 mt-1">
                Charged per product.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="img" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
              Product Images (Min 1, Max 5, 2MB each)
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
                      src={img.url}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img, img._id)}
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
              Product Video (Optional, Max 1, 20MB)
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
                      id={`attr-key-${field.id}`}
                      autoComplete="off"
                      {...register(`attributes.${index}.key`)}
                      placeholder="Attribute Key (e.g. Color)"
                      className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white focus:ring-2 focus:ring-sky-500"
                    />
                    <input
                      id={`attr-value-${field.id}`}
                      autoComplete="off"
                      {...register(`attributes.${index}.value`)}
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
              whileHover={{ scale: canUpdate ? 1.05 : 1 }}
              type="submit"
              disabled={!canUpdate}
              className={`w-fit py-2 px-4 border rounded font-medium text-sm transition
              ${canUpdate
                  ? "bg-sky-600 text-white hover:bg-sky-700"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
            >
              {initialData ? "Update Product" : "Save Product"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div >
  );
}