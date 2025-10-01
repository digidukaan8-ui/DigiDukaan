import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MapPin, Pencil, Trash2, Plus, Home, X, Phone, User } from "lucide-react";
import { toast } from "react-hot-toast";
import { addAddress, updateAddress, removeAddress, getAddress } from '../../api/address';
import useLoaderStore from '../../store/loader';
import useAddressStore from '../../store/address';

export default function Address() {
    const { addresses, isFetched } = useAddressStore();
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
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
                        toast.success("Address added successfully");
                    }
                } finally {
                    stopLoading()
                }
            }
            setEditId(null);
            setShowForm(false);
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
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const handleCancel = () => {
        setEditId(null);
        setShowForm(false);
        reset();
    };

    const handleAddNew = () => {
        setEditId(null);
        reset();
        setShowForm(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pt-24 sm:pt-28 pb-10 px-3 sm:px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg border border-black dark:border-white">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                Delivery Addresses
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Manage your saved addresses
                            </p>
                        </div>
                    </div>
                    {!showForm && (
                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl border border-black dark:border-white cursor-pointer"
                        >
                            <Plus size={20} />
                            <span className="hidden sm:inline">Add Address</span>
                        </button>
                    )}
                </div>

                {showForm && (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6 sm:p-8 mb-8"
                    >
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
                            {editId ? "Edit Address" : "Add New Address"}
                        </h2>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <User size={16} />
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Enter full name"
                                        {...register("name", { required: "Name is required" })}
                                        autoComplete="name"
                                        className="w-full px-4 py-3 rounded-xl border border-black dark:border-white bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    {errors.name && <span className="text-red-500 text-xs mt-1.5 block">{errors.name.message}</span>}
                                </div>

                                <div>
                                    <label htmlFor="mobile" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <Phone size={16} />
                                        Mobile Number
                                    </label>
                                    <input
                                        id="mobile"
                                        type="text"
                                        placeholder="10-digit mobile number"
                                        {...register("mobile", {
                                            required: "Mobile number is required",
                                            pattern: {
                                                value: /^(\+91)?[0-9]{10}$/,
                                                message: "Enter valid 10-digit number"
                                            }
                                        })}
                                        autoComplete="tel"
                                        className="w-full px-4 py-3 rounded-xl border border-black dark:border-white bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    {errors.mobile && <span className="text-red-500 text-xs mt-1.5 block">{errors.mobile.message}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="addressLine1" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Address Line 1
                                    </label>
                                    <input
                                        id="addressLine1"
                                        type="text"
                                        placeholder="House No., Building Name"
                                        {...register("addressLine1", { required: "Address is required" })}
                                        autoComplete="address-line1"
                                        className="w-full px-4 py-3 rounded-xl border border-black dark:border-white bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    {errors.addressLine1 && <span className="text-red-500 text-xs mt-1.5 block">{errors.addressLine1.message}</span>}
                                </div>

                                <div>
                                    <label htmlFor="addressLine2" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Address Line 2 <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        id="addressLine2"
                                        type="text"
                                        placeholder="Street, Area, Locality"
                                        {...register("addressLine2")}
                                        autoComplete="address-line2"
                                        className="w-full px-4 py-3 rounded-xl border border-black dark:border-white bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        City
                                    </label>
                                    <input
                                        id="city"
                                        type="text"
                                        placeholder="Enter city"
                                        {...register("city", { required: "City is required" })}
                                        autoComplete="address-level2"
                                        className="w-full px-4 py-3 rounded-xl border border-black dark:border-white bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    {errors.city && <span className="text-red-500 text-xs mt-1.5 block">{errors.city.message}</span>}
                                </div>

                                <div>
                                    <label htmlFor="state" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        State
                                    </label>
                                    <input
                                        id="state"
                                        type="text"
                                        placeholder="Enter state"
                                        {...register("state", { required: "State is required" })}
                                        autoComplete="address-level1"
                                        className="w-full px-4 py-3 rounded-xl border border-black dark:border-white bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    {errors.state && <span className="text-red-500 text-xs mt-1.5 block">{errors.state.message}</span>}
                                </div>

                                <div>
                                    <label htmlFor="pincode" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Pincode
                                    </label>
                                    <input
                                        id="pincode"
                                        type="text"
                                        placeholder="6-digit pincode"
                                        {...register("pincode", { required: "Pincode is required" })}
                                        autoComplete="postal-code"
                                        className="w-full px-4 py-3 rounded-xl border border-black dark:border-white bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    {errors.pincode && <span className="text-red-500 text-xs mt-1.5 block">{errors.pincode.message}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="landmark" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Landmark <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        id="landmark"
                                        type="text"
                                        placeholder="Nearby landmark"
                                        {...register("landmark")}
                                        autoComplete="address-line3"
                                        className="w-full px-4 py-3 rounded-xl border border-black dark:border-white bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="addressType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Address Type
                                    </label>
                                    <input
                                        id="addressType"
                                        type="text"
                                        placeholder="Home, Work, Office"
                                        {...register("addressType", { required: "Address type is required" })}
                                        className="w-full px-4 py-3 rounded-xl border border-black dark:border-white bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    {errors.addressType && <span className="text-red-500 text-xs mt-1.5 block">{errors.addressType.message}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-3 mt-8 pt-6">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors border border-black dark:border-white cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 border border-black dark:border-white cursor-pointer"
                            >
                                {editId ? (
                                    <>
                                        Update Address
                                    </>
                                ) : (
                                    <>
                                        Save Address
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div>
                    {addresses.length === 0 ? (
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-16 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Home className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                No addresses saved yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Add your first delivery address to get started
                            </p>
                            {!showForm && (
                                <button
                                    onClick={handleAddNew}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg border border-black dark:border-white cursor-pointer"
                                >
                                    <Plus size={18} />
                                    Add Your First Address
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Saved Addresses ({addresses.length})
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {addresses.map((addr) => (
                                    <div
                                        key={addr._id}
                                        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-md hover:shadow-xl transition-all p-6 group border border-black dark:border-white"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {addr.name}
                                                    </h3>
                                                    <span className="inline-block px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-lg capitalize mt-1">
                                                        {addr.addressType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {addr.addressLine1}
                                                {addr.addressLine2 && `, ${addr.addressLine2}`}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {addr.city}, {addr.state} - {addr.pincode}
                                            </p>
                                            {addr.landmark && (
                                                <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                                                    Near {addr.landmark}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-neutral-800">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Phone size={14} />
                                                {addr.mobile}
                                            </p>
                                            <div className="flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(addr)}
                                                    className="p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer border border-black dark:border-white"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(addr._id)}
                                                    className="p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer border border-black dark:border-white"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}