import { useForm, useFieldArray } from "react-hook-form";
import { FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { useState } from "react";

export default function StoreForm({ initialData = null, onSubmit }) {
  const [imagePreview, setImagePreview] = useState(initialData?.img || "");

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      storeCategory: initialData?.storeCategory?.join(", ") || "",
      img: initialData?.img || "",
      addresses: initialData?.addresses || [
        { addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" },
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
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => setImagePreview("");

  const onFormSubmit = (data) => {
    const storeData = {
      ...data,
      storeCategory: data.storeCategory
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      img: imagePreview,
    };
    if (onSubmit) onSubmit(storeData);
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 py-20 px-4">
      <div className="max-w-xl mx-auto bg-white dark:bg-neutral-900 px-6 py-8 rounded-lg border border-black dark:border-white shadow-lg">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
          {initialData ? "Edit Store" : "Add New Store"}
        </h2>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
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
              className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              {...register("description")}
              placeholder="Enter description"
              autoComplete="off"
              rows="3"
              className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="storeCategory"
              className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300"
            >
              Store Category (comma separated)
            </label>
            <input
              id="storeCategory"
              {...register("storeCategory")}
              placeholder="e.g. Grocery, Electronics"
              autoComplete="off"
              className="w-full border p-3 rounded focus:ring-2 focus:ring-sky-500 bg-gray-100 dark:bg-neutral-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300"
            >
              Store Image
            </label>
            {!imagePreview ? (
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white"
                required={!initialData}
              />
            ) : (
              <div className="relative inline-block">
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
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg text-center font-semibold mb-3 text-gray-900 dark:text-gray-200">
              Addresses
            </h3>
            {fields.map((field, index) => (
              <div
                key={field.id}
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
                    autoComplete="address-line1"
                    className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />

                  <input
                    {...register(`addresses.${index}.addressLine2`)}
                    placeholder="Address Line 2 (optional)"
                    autoComplete="address-line2"
                    className="w-full border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      {...register(`addresses.${index}.city`, { required: true })}
                      placeholder="City"
                      autoComplete="address-level2"
                      className="border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white focus:ring-2 focus:ring-sky-500"
                    />
                    <input
                      {...register(`addresses.${index}.state`, { required: true })}
                      placeholder="State"
                      autoComplete="address-level1"
                      className="border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white focus:ring-2 focus:ring-sky-500"
                    />
                    <input
                      {...register(`addresses.${index}.pincode`, { required: true })}
                      placeholder="Pincode"
                      autoComplete="postal-code"
                      className="border p-3 rounded bg-gray-100 dark:bg-neutral-950 dark:text-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            ))}

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
            <button
              type="submit"
              className="w-fit bg-sky-600 text-white py-2 px-4 border rounded font-medium text-sm hover:bg-sky-700 transition"
            >
              {initialData ? "Update Store" : "Save Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}