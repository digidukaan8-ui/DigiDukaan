import { useState } from "react";
import { useForm } from "react-hook-form";
import useDeliveryStore from "../../store/deliveryZone";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { addDeliveryZone, updateDeliveryZone, removeDeliveryZone } from "../../api/store";
import useLoaderStore from "../../store/loader";
import { toast } from "react-hot-toast";
import useStore from "../../store/store";

const DeliveryForm = () => {
  const { deliveryZone, addZone, updateZone, removeZone } = useDeliveryStore();
  const { startLoading, stopLoading } = useLoaderStore();
  const { store } = useStore();
  const { register, handleSubmit, reset, setValue } = useForm();
  const [editId, setEditId] = useState(null);

  const options = ["city", "town", "area", "pincode"];

  const capitalizeFirst = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const onSubmit = async (data) => {
    const correctData = {
      storeId: store._id,
      deliveryArea: capitalizeFirst(data.deliveryArea),
      areaName: capitalizeFirst(data.areaName.trim()),
      deliveryCharge: Number(data.deliveryCharge) || 0,
      deliveryDays: Number(data.deliveryDays) || 0
    };

    if (!correctData.deliveryArea || !correctData.areaName) {
      toast.error("All fields are required");
      return;
    }

    if (editId) {
      startLoading("updateZone");
      try {
        const result = await updateDeliveryZone({ ...correctData, zoneId: editId });
        updateZone(result.data._id, {
          deliveryArea: result.data.deliveryArea,
          areaName: result.data.areaName,
          deliveryCharge: result.data.deliveryCharge,
          deliveryDays: result.data.deliveryDays
        });
        setEditId(null);
        toast.success("Delivery Zone updated successfully");
      } finally {
        stopLoading();
      }
    } else {
      startLoading("zone");
      try {
        const result = await addDeliveryZone(correctData);
        addZone(result.data);
        toast.success("Delivery Zone added successfully");
      } finally {
        stopLoading();
      }
    }

    reset({ deliveryArea: "city", areaName: "", deliveryCharge: "", deliveryDays: "" });
  };

  const handleEdit = (zone) => {
    setValue("deliveryArea", zone.deliveryArea.toLowerCase());
    setValue("areaName", zone.areaName);
    setValue("deliveryCharge", zone.deliveryCharge || 0);
    setValue("deliveryDays", zone.deliveryDays || 0);
    setEditId(zone._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = async (id) => {
    const confirmed = window.confirm("Are you sure you want to remove this delivery zone?");
    if (!confirmed) return;
    startLoading("removeZone");
    try {
      const result = await removeDeliveryZone(id);
      if (result.success) {
        removeZone(id);
      }
      toast.success("Delivery Zone removed successfully");
    } finally {
      stopLoading();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pb-20 pt-40 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="max-w-md mx-auto bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-black dark:border-white p-6 mb-8">
          <div className="flex justify-center items-center gap-2 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editId ? "Edit Zone" : "Add Zone"}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="deliveryArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Area Type
              </label>
              <select
                id="deliveryArea"
                {...register("deliveryArea", { required: true })}
                defaultValue="city"
                autoComplete="off"
                className="w-full rounded-lg px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-black dark:border-white text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition capitalize text-sm"
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="areaName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Area Name
              </label>
              <input
                id="areaName"
                type="text"
                {...register("areaName", { required: true })}
                placeholder="Enter area name"
                autoComplete="address-level2"
                className="w-full rounded-lg px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-black dark:border-white text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="deliveryCharge" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Delivery Charge (₹)
              </label>
              <input
                id="deliveryCharge"
                type="number"
                {...register("deliveryCharge", { required: true })}
                placeholder="Enter delivery charge"
                className="w-full rounded-lg px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-black dark:border-white text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Applied to all deliveries in this zone
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="deliveryDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Delivery within (in days)
              </label>
              <input
                id="deliveryDays"
                type="number"
                {...register("deliveryDays", { required: true })}
                placeholder="Expected delivery within (days)"
                className="w-full rounded-lg px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-black dark:border-white text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Applied to all deliveries in this zone
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm border border-black dark:border-white cursor-pointer"
              >
                {editId ? "Update" : "Add Zone"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    reset({ deliveryArea: "city", areaName: "", deliveryCharge: "", deliveryDays: "" });
                  }}
                  className="px-4 py-2 rounded-lg font-medium bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-black dark:border-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                All Zones
              </h2>
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
              {deliveryZone.length}
            </span>
          </div>

          {deliveryZone.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                <MapPin className="w-7 h-7 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No delivery zones yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {deliveryZone.map((zone) => (
                <div
                  key={zone._id}
                  className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-black dark:border-white hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded capitalize border border-blue-200 dark:border-blue-800">
                      {zone.deliveryArea}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(zone)}
                        className="p-1.5 rounded cursor-pointer bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(zone._id)}
                        className="p-1.5 rounded cursor-pointer bg-white dark:bg-neutral-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 capitalize">
                    {zone.areaName}
                  </h3>

                  <div className="text-green-600 dark:text-green-400 font-semibold text-sm">
                    ₹{zone.deliveryCharge || 0}
                  </div>

                  <div className="text-sky-600 dark:text-sky-400 font-semibold text-sm">
                    Expected Delivery within {zone.deliveryDays || 0} {zone.deliveryDays > 1 ? " days" : " day"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryForm;