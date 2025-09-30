import { useForm, useFieldArray } from "react-hook-form";
import { FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createStore, updateStore } from "../../api/store";
import useLoaderStore from "../../store/loader";
import useAuthStore from "../../store/auth";
import useStore from "../../store/store";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

export default function StoreForm() {
  const location = useLocation();
  const { initialData } = location.state || {};
  const [imagePreview, setImagePreview] = useState(initialData?.img?.url || "");
  const { startLoading, stopLoading } = useLoaderStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { store } = useStore();
  const [hide, setHide] = useState(() => {
    return Object.keys(initialData || {}).length > 0;
  });

  const { register, control, handleSubmit, reset, setValue, formState } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category?.join(", ") || "",
      img: initialData?.img || "",
      addresses:
        initialData?.addresses || [
          {
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            pincode: "",
          },
        ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should not exceed 2MB");
        e.target.value = "";
        return;
      }
      setImagePreview(URL.createObjectURL(file));
      setHide(true);
      setValue("img", file, { shouldDirty: true });
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setValue("img", "");
    setHide(false);
  };

  const cleanCategory = (raw) => {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const onFormSubmit = async (data) => {
    let imgData = data.img;

    if (initialData && !data.img?.name) {
      imgData = initialData.img;
    }

    if (!initialData || Object.keys(initialData).length === 0) {
      const storeData = {
        ...data,
        img: imgData,
        category: cleanCategory(data.category),
        userId: user._id,
      };
      startLoading("store");
      try {
        const result = await createStore(storeData);
        if (result.data.userId === user._id) {
          useStore.getState().addDetails(result.data);
          toast.success("Store created successfully");
          navigate('/seller/store');
        }
        setImagePreview("");
        reset();
      } finally {
        stopLoading();
      }
    } else {
      const storeData = {
        ...data,
        img: imgData,
        category: cleanCategory(data.category),
        storeId: store._id,
      };
      startLoading("updateStore");
      try {
        const result = await updateStore(storeData);
        if (result.data.userId === user._id) {
          useStore.getState().updateStoreDetails(result.data);
          toast.success("Store updated successfully");
          navigate('/seller/store');
        }
        setImagePreview("");
        reset();
      } finally {
        stopLoading();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pb-20 pt-40 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm p-6"
        >
          <h2 className="text-2xl text-center font-bold mb-6 text-gray-900 dark:text-gray-100">
            {initialData ? "Edit Store" : "Create New Store"}
          </h2>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
            <div>
              <label htmlFor="name" className="block mb-1.5 font-medium text-sm text-gray-700 dark:text-gray-300">
                Store Name
              </label>
              <input
                id="name"
                {...register("name", { required: true })}
                placeholder="Enter store name"
                autoComplete="organization"
                className="w-full border border-gray-300 dark:border-neutral-700 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-neutral-800 dark:text-white outline-none transition text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block mb-1.5 font-medium text-sm text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                {...register("description", { required: true })}
                placeholder="Enter store description"
                rows="3"
                className="w-full border border-gray-300 dark:border-neutral-700 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-neutral-800 dark:text-white outline-none transition text-sm"
              ></textarea>
            </div>

            <div>
              <label htmlFor="category" className="block mb-1.5 font-medium text-sm text-gray-700 dark:text-gray-300">
                Store Categories
              </label>
              <input
                id="category"
                {...register("category", { required: true })}
                placeholder="e.g. Grocery, Electronics, Clothing"
                className="w-full border border-gray-300 dark:border-neutral-700 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-neutral-800 dark:text-white outline-none transition text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Comma separated categories
              </p>
            </div>

            <div>
              <label htmlFor="img" className="block mb-1.5 font-medium text-sm text-gray-700 dark:text-gray-300">
                Store Image
              </label>

              <input
                id="img"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`w-full border border-gray-300 dark:border-neutral-700 p-2.5 rounded-lg bg-gray-50 dark:bg-neutral-800 dark:text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-600 dark:file:text-blue-400 file:cursor-pointer ${hide ? "hidden" : ""}`}
                required={!initialData}
              />

              {!imagePreview ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No image selected</p>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative inline-block mt-2"
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-neutral-700"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition"
                  >
                    <FiX size={14} />
                  </button>
                </motion.div>
              )}
            </div>

            <div className="pt-2">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-gray-200">
                Store Addresses
              </h3>
              <AnimatePresence>
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 mb-3 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-800/50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-xs text-gray-600 dark:text-gray-400">
                        Address {index + 1}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-600 transition"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        {...register(`addresses.${index}.addressLine1`, {
                          required: true,
                        })}
                        placeholder="Address Line 1"
                        className="w-full border border-gray-300 dark:border-neutral-700 p-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-white text-sm"
                      />
                      <input
                        {...register(`addresses.${index}.addressLine2`)}
                        placeholder="Address Line 2 (optional)"
                        className="w-full border border-gray-300 dark:border-neutral-700 p-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-white text-sm"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          {...register(`addresses.${index}.city`, {
                            required: true,
                          })}
                          placeholder="City"
                          className="border border-gray-300 dark:border-neutral-700 p-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-white text-sm"
                        />
                        <input
                          {...register(`addresses.${index}.state`, {
                            required: true,
                          })}
                          placeholder="State"
                          className="border border-gray-300 dark:border-neutral-700 p-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-white text-sm"
                        />
                        <input
                          {...register(`addresses.${index}.pincode`, {
                            required: true,
                          })}
                          placeholder="Pincode"
                          className="border border-gray-300 dark:border-neutral-700 p-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                type="button"
                onClick={() =>
                  append({
                    addressLine1: "",
                    addressLine2: "",
                    city: "",
                    state: "",
                    pincode: "",
                  })
                }
                className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline"
              >
                <FiPlus size={16} /> Add Another Address
              </button>
            </div>

            <div className="flex justify-center pt-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!formState.isDirty || formState.isSubmitting}
                className={`px-8 py-2.5 rounded-lg font-medium text-sm transition ${!formState.isDirty
                    ? "bg-gray-300 dark:bg-neutral-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
              >
                {initialData ? "Update Store" : "Create Store"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}