"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";

export default function UsedProductForm() {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      category: "",
      subCategory: "",
      condition: "",
      price: "",
      isNegotiable: false,
      brand: "",
      attributes: [{ key: "", value: "" }],
      billAvailable: false,
      img: [{ url: "", publicId: "" }],
      video: { url: "", publicId: "" },
    },
  });

  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({
    control,
    name: "attributes",
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "img",
  });

  const onSubmit = async (data) => {
    console.log("Form Data:", data);

    try {
      const res = await fetch("/api/used-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("✅ Product added successfully!");
        reset();
      } else {
        alert("❌ Failed to add product");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Error submitting form");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Add Used Product
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <input
            {...register("title", { required: true })}
            placeholder="Product Title"
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          />

          {/* Slug */}
          <input
            {...register("slug")}
            placeholder="Slug (unique identifier)"
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          />

          {/* Description */}
          <textarea
            {...register("description", { required: true })}
            placeholder="Description"
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          />

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <input
              {...register("category", { required: true })}
              placeholder="Category"
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              {...register("subCategory")}
              placeholder="Subcategory"
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Condition */}
          <select
            {...register("condition", { required: true })}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select Condition</option>
            <option value="new">New</option>
            <option value="like new">Like New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>

          {/* Price */}
          <input
            type="number"
            {...register("price", { required: true })}
            placeholder="Price"
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          />

          {/* Negotiable */}
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register("isNegotiable")} />
            <span className="text-gray-700 dark:text-gray-200">Negotiable</span>
          </label>

          {/* Brand */}
          <input
            {...register("brand")}
            placeholder="Brand"
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          />

          {/* Attributes */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Attributes
            </h3>
            {attributeFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 mb-2">
                <input
                  {...register(`attributes.${index}.key`, { required: true })}
                  placeholder="Key"
                  className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <input
                  {...register(`attributes.${index}.value`, { required: true })}
                  placeholder="Value"
                  className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded-lg"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendAttribute({ key: "", value: "" })}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg"
            >
              + Add Attribute
            </button>
          </div>

          {/* Images */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Images
            </h3>
            {imageFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 mb-2">
                <input
                  {...register(`img.${index}.url`, { required: true })}
                  placeholder="Image URL"
                  className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <input
                  {...register(`img.${index}.publicId`, { required: true })}
                  placeholder="Public ID"
                  className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded-lg"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendImage({ url: "", publicId: "" })}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg"
            >
              + Add Image
            </button>
          </div>

          {/* Video */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Video
            </h3>
            <input
              {...register("video.url")}
              placeholder="Video URL"
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white mb-2"
            />
            <input
              {...register("video.publicId")}
              placeholder="Video Public ID"
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Bill Available */}
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register("billAvailable")} />
            <span className="text-gray-700 dark:text-gray-200">Bill Available</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
