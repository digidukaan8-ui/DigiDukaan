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

  const options = [
    "country", "state", "district", "city", "town", "village",
    "suburb", "area", "taluka", "tehsil", "locality", "street",
    "landmark", "pincode"
  ];

  const capitalizeFirst = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const onSubmit = async (data) => {
    const correctData = {
      storeId: store._id,
      deliveryArea: capitalizeFirst(data.deliveryArea),
      areaName: capitalizeFirst(data.areaName.trim())
    };

    if (!correctData.deliveryArea || !correctData.areaName) {
      toast.error("Both fields are required");
      return;
    }

    if (editId) {
      startLoading("updateZone");
      try {
        const result = await updateDeliveryZone({ ...correctData, id: editId });
        updateZone(result.data._id, { deliveryArea: result.data.deliveryArea, areaName: result.data.areaName });
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

    reset({ deliveryArea: "city", areaName: "" });
  };

  const handleEdit = (zone) => {
    setValue("deliveryArea", zone.deliveryArea.toLowerCase());
    setValue("areaName", zone.areaName);
    setEditId(zone._id);
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
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-100 pt-40 dark:bg-neutral-950 dark:text-gray-100 p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[300px] bg-white dark:bg-neutral-900 p-5 rounded-md border border-black dark:border-white shadow-md space-y-4"
      >
        <h2 className="text-3xl font-bold mb-6 text-center"> Zone Form</h2>

        <div className="space-y-1">
          <label
            htmlFor="deliveryArea"
            className="block text-sm font-medium"
          >
            Select Delivery Area
          </label>
          <select
            id="deliveryArea"
            {...register("deliveryArea", { required: true })}
            defaultValue="city"
            autoComplete="off"
            className="w-full rounded-md p-3 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white capitalize"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="areaName"
            className="block text-sm font-medium"
          >
            Area Name
          </label>
          <input
            id="areaName"
            type="text"
            {...register("areaName", { required: true })}
            placeholder="Enter area name"
            autoComplete="address-level2"
            className="w-full rounded-md p-3 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 cursor-pointer bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg border border-black dark:border-white transition"
        >
          {editId ? "Update Zone" : "Add Zone"}
        </button>
      </form>

      <h2 className="text-3xl font-bold my-8 flex items-center gap-2">
        <MapPin className="w-7 h-7 text-blue-600" /> All Delivery Zones
      </h2>

      <div className="w-full overflow-hidden">
        {deliveryZone.length === 0 ? (
          <p className="text-center p-6">
            No delivery zones added yet.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-5 justify-center items-center">
            {deliveryZone.map((zone) => (
              <li
                key={zone._id}
                className="w-[300px] flex items-center justify-between bg-white dark:bg-neutral-900 border border-black dark:border-white rounded-md px-4 py-3 shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-sky-600 bg-gray-100 dark:bg-neutral-950 dark:text-blue-300 px-2 py-[3px] rounded w-fit capitalize border border-black dark:border-white">
                    {zone.deliveryArea}
                  </span>
                  <span className="text-lg px-2 mt-1 capitalize">
                    {zone.areaName}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(zone)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-950 text-sky-600 dark:text-sky-400 hover:bg-gray-200 dark:hover:bg-neutral-800 transition border border-black dark:border-white cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(zone._id)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-950 text-red-600 dark:text-red-400 hover:bg-gray-200 dark:hover:bg-neutral-800 transition border border-black dark:border-white cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DeliveryForm;