import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { addAddress, updateAddress, removeAddress, getAddress } from '../../api/address';
import useLoaderStore from '../../store/loader';
import useAddressStore from '../../store/address';

export default function Address() {
    const { addresses, isFetched } = useAddressStore();
    const [editId, setEditId] = useState(null);
    const { startLoading, stopLoading } = useLoaderStore();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        const fecthAddress = async () => {
            startLoading('fetchAddress')
            try {
                const result = await getAddress();
                if (result.success) {
                    useAddressStore.getState().clearAddress();
                    useAddressStore.getState().setAddresses(result.data);
                    toast.success("Addresses fetched successfully");
                }
            } finally {
                stopLoading()
            }
        }
        if (addresses.length === 0 && !isFetched) {
            fecthAddress();
        }
    }, []);

    const onSubmit = async (formData) => {
        try {
            if (editId) {
                startLoading('updateAddress')
                try {
                    const result = await updateAddress(formData, editId);
                    if (result.success) {
                        useAddressStore.getState().updateAddress(result.data._id, result.data);
                        toast.success("Address updated successfully");
                    }
                } finally {
                    stopLoading()
                }
            } else {
                startLoading('addAddress')
                try {
                    const result = await addAddress(formData);
                    if (result.success) {
                        useAddressStore.getState().addAddress(result.data);
                        toast.success("Address addedd successfully");
                    }
                } finally {
                    stopLoading()
                }
            }
            setEditId(null);
            reset();
        } catch (err) {
            console.error("Error saving address:", err);
        }
    };

    const handleEdit = (addr) => {
        setValue("name", addr.name);
        setValue("mobile", addr.mobile);
        setValue("addressLine1", addr.addressLine1);
        setValue("addressLine2", addr.addressLine2);
        setValue("city", addr.city);
        setValue("state", addr.state);
        setValue("pincode", addr.pincode);
        setValue("landmark", addr.landmark || "");
        setValue("addressType", addr.addressType);
        setEditId(addr._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        startLoading('removeAddress')
        try {
            const result = await removeAddress(id);
            if (result.success) {
                useAddressStore.getState().removeAddress(id);
                toast.success("Address removed successfully");
            }
        } finally {
            stopLoading()
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center bg-gray-100 pt-40 pb-20 dark:bg-neutral-950 dark:text-gray-100 p-6">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-4xl bg-white dark:bg-neutral-900 p-6 rounded-md shadow-md space-y-4 border border-black dark:border-white"
            >
                <h2 className="text-3xl font-bold mb-6 text-center">Address Form</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Enter your Name"
                            {...register("name", { required: "Name is required" })}
                            autoComplete="name"
                            className="w-full rounded-md p-3 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white"
                        />
                        {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                    </div>

                    <div>
                        <label htmlFor="mobile" className="block text-sm font-medium mb-1">Mobile Number</label>
                        <input
                            id="mobile"
                            type="text"
                            placeholder="Enter Mobile Number"
                            {...register("mobile", {
                                pattern: {
                                    value: /^(\+91)?[0-9]{10}$/,
                                    message: "Invalid mobile number. Use 10 digits or +91 prefix"
                                }
                            })}
                            autoComplete="tel"
                            className="w-full rounded-md p-3 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white"
                        />
                        {errors.mobile && <span className="text-red-500 text-xs mt-1">{errors.mobile.message}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="addressType" className="block text-sm font-medium mb-1">Address Type (e.g., Home, Work)</label>
                        <input
                            id="addressType"
                            type="text"
                            placeholder="Home, Work, Office, etc."
                            {...register("addressType", { required: "Address Type is required" })}
                            className="w-full rounded-md p-3 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white"
                        />
                        {errors.addressType && <span className="text-red-500 text-xs mt-1">{errors.addressType.message}</span>}
                    </div>

                    <div>
                        <label htmlFor="landmark" className="block text-sm font-medium mb-1">Landmark (Optional)</label>
                        <input
                            id="landmark"
                            type="text"
                            placeholder="Enter Landmark"
                            {...register("landmark")}
                            autoComplete="address-line3"
                            className="w-full rounded-md p-3 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="addressLine1" className="block text-sm font-medium mb-1">Address Line 1</label>
                        <input
                            id="addressLine1"
                            type="text"
                            placeholder="Enter House No., Building Name"
                            {...register("addressLine1", { required: "Address Line 1 is required" })}
                            autoComplete="address-line1"
                            className="w-full rounded-md p-3 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white"
                        />
                        {errors.addressLine1 && <span className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</span>}
                    </div>

                    <div>
                        <label htmlFor="addressLine2" className="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
                        <input
                            id="addressLine2"
                            type="text"
                            placeholder="Enter Street, Locality"
                            {...register("addressLine2")}
                            autoComplete="address-line2"
                            className="w-full rounded-md p-3 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
                        <input
                            id="city"
                            type="text"
                            placeholder="Enter City"
                            {...register("city", { required: "City is required" })}
                            autoComplete="address-level2"
                            className="w-full rounded-md p-3 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white"
                        />
                        {errors.city && <span className="text-red-500 text-xs mt-1">{errors.city.message}</span>}
                    </div>

                    <div>
                        <label htmlFor="state" className="block text-sm font-medium mb-1">State</label>
                        <input
                            id="state"
                            type="text"
                            placeholder="Enter State"
                            {...register("state", { required: "State is required" })}
                            autoComplete="address-level1"
                            className="w-full rounded-md p-3 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white"
                        />
                        {errors.state && <span className="text-red-500 text-xs mt-1">{errors.state.message}</span>}
                    </div>

                    <div>
                        <label htmlFor="pincode" className="block text-sm font-medium mb-1">Pincode</label>
                        <input
                            id="pincode"
                            type="text"
                            placeholder="Enter Pincode"
                            {...register("pincode", { required: "Pincode is required" })}
                            autoComplete="postal-code"
                            className="w-full rounded-md p-3 bg-gray-100 dark:bg-neutral-950 border border-black dark:border-white"
                        />
                        {errors.pincode && <span className="text-red-500 text-xs mt-1">{errors.pincode.message}</span>}
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="w-full md:w-auto flex items-center justify-center gap-2 cursor-pointer bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg transition border border-black dark:border-white"
                    >
                        {editId ? "Update Address" : "Add Address"}
                    </button>
                </div>
            </form>

            <h2 className="text-3xl font-bold my-8 flex items-center gap-3 text-gray-800 dark:text-gray-100">
                <MapPin className="w-8 h-8 text-sky-600" /> Your Saved Addresses
            </h2>

            <div className="w-full max-w-6xl">
                {addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-neutral-800 rounded-lg shadow-md">
                        <MapPin className="w-16 h-16 text-gray-400 dark:text-neutral-500 mb-4" />
                        <p className="text-xl font-medium text-gray-600 dark:text-gray-300">No addresses saved yet.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Add your first address using the form above!</p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((addr) => (
                            <li
                                key={addr._id}
                                className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden flex transform hover:scale-[1.02] transition-transform duration-300 relative border border-black dark:border-white"
                            >
                                <div className="w-1/4 p-6 flex flex-col items-center justify-center bg-gray-100 dark:bg-neutral-950 border-r border-gray-200 dark:border-neutral-700">
                                    <MapPin className="w-8 h-8 text-sky-500" />
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-2 block capitalize">{addr.addressType}</span>
                                </div>
                                <div className="w-3/4 p-6 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{addr.name}</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-tight">
                                            {addr.addressLine1}
                                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                                            <br />
                                            {addr.city}, {addr.state} - {addr.pincode}
                                        </p>
                                        {addr.landmark && (
                                            <p className="text-xs italic text-gray-500 dark:text-gray-400">Landmark: {addr.landmark}</p>
                                        )}
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="text-base font-medium text-gray-800 dark:text-gray-200">{addr.mobile}</p>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(addr)}
                                                className="p-2 rounded-full text-sky-600 dark:text-sky-400 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(addr._id)}
                                                className="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}