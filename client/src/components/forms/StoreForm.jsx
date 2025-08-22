import { useForm, useFieldArray } from "react-hook-form";
import { FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createStore } from "../../api/store";
import useLoaderStore from "../../store/loader";
import useAuthStore from "../../store/auth";
import useStore from "../../store/store";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

export default function StoreForm() {
  const location = useLocation();
  const { initialData } = location.state || {};
  const [imagePreview, setImagePreview] = useState(initialData?.img || "");
  const { startLoading, stopLoading } = useLoaderStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { register, control, handleSubmit, reset, setValue } = useForm({
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
      setValue("img", file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setValue("img", "");
  };

  const cleanCategory = (raw) => {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const onFormSubmit = async (data) => {
    const storeData = {
      ...data,
      category: cleanCategory(data.category),
      userId: user._id,
    };

    if (!initialData || Object.keys(initialData).length === 0) {
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
      } catch (error) {
        console.error("Error creating store: ", error);
        throw error;
      } finally {
        stopLoading();
      }
    } else {
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pb-20 px-4 pt-40">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto bg-white dark:bg-neutral-900 px-6 py-8 rounded-lg border border-black dark:border-white shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
          {initialData ? "Edit Store" : "Add New Store"}
        </h2>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label
              htmlFor="name"
              className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300"
            >
              Store Name
            </label>
            <input
              id="name"
              {...register("name", { required: true })}
              placeholder="Enter store name"
              autoComplete="organization"
              className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label
              htmlFor="description"
              className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              {...register("description", { required: true })}
              placeholder="Enter description"
              rows="3"
              className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
            ></textarea>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label
              htmlFor="category"
              className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300"
            >
              Store Category (comma separated)
            </label>
            <input
              id="category"
              {...register("category", { required: true })}
              placeholder="e.g. Grocery, Electronics"
              className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label
              htmlFor="img"
              className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300"
            >
              Store Image
            </label>
            {!imagePreview ? (
              <input
                id="img"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
                required={!initialData}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative inline-block"
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <FiX size={16} />
                </button>
              </motion.div>
            )}
          </motion.div>

          <div>
            <h3 className="text-lg text-center font-semibold mb-3 text-gray-900 dark:text-gray-200">
              Addresses
            </h3>
            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 mb-4 border border-black dark:border-white rounded-lg relative bg-gray-100 dark:bg-neutral-950/40"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">
                      Address {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <input
                      {...register(`addresses.${index}.addressLine1`, {
                        required: true,
                      })}
                      placeholder="Address Line 1"
                      className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
                    />
                    <input
                      {...register(`addresses.${index}.addressLine2`)}
                      placeholder="Address Line 2 (optional)"
                      className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        {...register(`addresses.${index}.city`, {
                          required: true,
                        })}
                        placeholder="City"
                        className="border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
                      />
                      <input
                        {...register(`addresses.${index}.state`, {
                          required: true,
                        })}
                        placeholder="State"
                        className="border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
                      />
                      <input
                        {...register(`addresses.${index}.pincode`, {
                          required: true,
                        })}
                        placeholder="Pincode"
                        className="border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
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
              className="flex items-center gap-2 text-sky-500 font-medium text-sm hover:underline mt-2"
            >
              <FiPlus /> Add Another Address
            </button>
          </div>

          <div className="flex justify-center items-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              type="submit"
              className="w-fit bg-sky-600 text-white py-3 px-6 border rounded font-medium text-sm hover:bg-sky-700 transition"
            >
              {initialData ? "Update Details" : "Save Details"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}