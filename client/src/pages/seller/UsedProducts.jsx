import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";

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
      img: [],
      video: "",
    },
  });

  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({ control, name: "attributes" });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({ control, name: "img" });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState("");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFields.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} is larger than 2MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
        appendImage({ url: reader.result, file });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert("Video size must be less than 20MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setVideoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    reset();
    setImagePreviews([]);
    setVideoPreview("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center mb-6">
          Add Used Product
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title + Brand + Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                  Title *
                </label>
                <input
                  {...register("title", { required: true })}
                  placeholder="Enter product title"
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                  Brand
                </label>
                <input
                  {...register("brand")}
                  placeholder="Brand"
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                Description * (Max 500 words)
              </label>
              <textarea
                {...register("description", { required: true, maxLength: 3000 })}
                placeholder="Enter product description"
                rows={4}
                className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category + Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Category *
              </label>
              <input
                {...register("category", { required: true })}
                placeholder="Category"
                className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Subcategory
              </label>
              <input
                {...register("subCategory")}
                placeholder="Subcategory"
                className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Condition + Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Condition *
              </label>
              <select
                {...register("condition", { required: true })}
                className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select condition</option>
                <option value="new">New</option>
                <option value="like new">Like New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Price *
              </label>
              <input
                type="number"
                {...register("price", { required: true })}
                placeholder="Price"
                className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Attributes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Attributes
            </label>
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
                  className="p-2 bg-red-500 text-white rounded-lg"
                >
                  <FiX />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendAttribute({ key: "", value: "" })}
              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm"
            >
              <FiPlus size={16} /> Add Attribute
            </button>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Images (Max 5, 2MB each)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreviews.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      removeImage(i);
                      setImagePreviews(imagePreviews.filter((_, idx) => idx !== i));
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Video + Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Video (Max 20MB)
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-green-500 file:text-white hover:file:bg-green-600"
              />
              {videoPreview && (
                <video controls className="w-full max-h-48 mt-2 rounded-lg border">
                  <source src={videoPreview} />
                </video>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("isNegotiable")}
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-gray-700 dark:text-gray-200">Negotiable</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("billAvailable")}
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-gray-700 dark:text-gray-200">Bill Available</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}