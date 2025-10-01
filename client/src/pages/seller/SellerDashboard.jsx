import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiHome, FiPackage, FiBox, FiFileText, FiUser, FiImage, FiXCircle, FiPlus, FiCheckSquare, FiArchive, FiStar, FiMessageSquare, FiEye, FiZap, FiMapPin, FiTrendingUp, FiShoppingBag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import useAuthStore from "../../store/auth.js";
import useLoaderStore from "../../store/loader.js";
import { changeAvatar, removeAvatar, updateProfile } from "../../api/user.js";
import useStore from "../../store/store";
import { useQuery } from "@tanstack/react-query";
import { getStoreInfo } from "../../api/store.js";

function SellerDashboard() {
    const { store } = useStore();
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useLoaderStore();
    const { user, isAuthenticated } = useAuthStore();

    const [userInfo, setUserInfo] = useState({
        name: "",
        username: "",
        phone: "",
        avatarUrl: "",
    });
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showChangeAvatarModal, setShowChangeAvatarModal] = useState(false);

    const { data: orders = [] } = useQuery({
        queryKey: ["sellerOrders"],
        queryFn: () => fetch("/api/seller/orders").then((res) => res.json()),
        enabled: !!isAuthenticated,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const { data: counts = {} } = useQuery({
        queryKey: ["storeInfo", store?._id],
        queryFn: () => getStoreInfo(store?._id),
        enabled: !!isAuthenticated,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile } = useForm();
    const { register: registerAvatar, handleSubmit: handleSubmitAvatar, watch: watchAvatar, reset: resetAvatar } = useForm();
    const avatarFile = watchAvatar("avatar");

    useEffect(() => {
        if (isAuthenticated && user) {
            setUserInfo((prev) => ({
                ...prev,
                name: user.name || "",
                username: user.username || "",
                phone: user.phone || "",
                avatarUrl: user.avatar?.url || "",
            }));
            resetProfile({ name: user.name, username: user.username, phone: user.phone });
        }
    }, [isAuthenticated, user, resetProfile]);

    const avatarColors = [
        "bg-indigo-500",
        "bg-emerald-500",
        "bg-rose-500",
        "bg-yellow-500",
        "bg-blue-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-sky-500",
    ];

    const getAvatarColorClass = (name) => {
        if (!name) return "bg-gray-400";
        const code = name.charCodeAt(0) || 0;
        return avatarColors[code % avatarColors.length];
    };

    const onProfileSubmit = async (data) => {
        startLoading('updateProfile')
        try {
            const result = await updateProfile(data);
            if (result.success) {
                toast.success("Updated profile successfully");
                useAuthStore.getState().updateProfile(result.data)
                setUserInfo((prev) => ({ ...prev, name: result.data.name, username: result.data.username, phone: result.data.phone }));
                setShowEditProfileModal(false);
            }
        } finally {
            stopLoading()
        }
    };

    const onAvatarSubmit = async (data) => {
        const file = data.avatar[0];
        if (file) {
            startLoading('changeAvatar')
            try {
                const result = await changeAvatar(file);
                if (result.success) {
                    toast.success("Avatar changed successfully");
                    useAuthStore.getState().changeAvatar(result.data)
                    const preview = result.data;
                    setUserInfo((p) => ({ ...p, avatarUrl: preview }));
                }
            } finally {
                stopLoading()
            }
        }
        setShowChangeAvatarModal(false);
    };

    const handleRemoveAvatar = async () => {
        if (window.confirm("Are you sure you want to remove your avatar?")) {
            startLoading('removeAvatar')
            try {
                const result = await removeAvatar();
                if (result.success) {
                    toast.success("Avatar removed successfully");
                    useAuthStore.getState().changeAvatar(result.data)
                    setUserInfo((p) => ({ ...p, avatarUrl: "" }));
                    resetAvatar({ avatar: null });
                    setShowChangeAvatarModal(false);
                }
            } finally {
                stopLoading()
            }
        }
    };

    const getPreviewAvatarUrl = () => {
        if (avatarFile && avatarFile.length > 0) {
            return URL.createObjectURL(avatarFile[0]);
        }
        return userInfo.avatarUrl || "";
    };

    const initials = userInfo.name ? userInfo.name.charAt(0).toUpperCase() : "U";
    const avatarColorClass = getAvatarColorClass(userInfo.name || userInfo.username || userInfo.phone);

    if (!store) {
        return (
            <div className="h-screen flex justify-center items-center bg-gray-100 dark:bg-neutral-950">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-sky-500/10 flex items-center justify-center">
                        <FiPlus className="w-10 h-10 text-sky-500" />
                    </div>
                    <p
                        onClick={() => navigate("/seller/store-details")}
                        className="text-xl cursor-pointer text-black dark:text-white font-semibold hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                    >
                        Add your store details to get started
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pb-20 pt-30 text-black dark:text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-8 shadow-2xl border border-black dark:border-white">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                        {store.img && (
                            <div className="flex-shrink-0">
                                <img
                                    src={store.img?.url}
                                    alt={store.name}
                                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white/30 shadow-xl"
                                />
                            </div>
                        )}

                        <div className="flex-1 text-center lg:text-left text-white">
                            <div className="flex items-center gap-3 justify-center lg:justify-start mb-2">
                                <FiShoppingBag className="w-8 h-8" />
                                <h1 className="text-4xl font-bold">{store.name}</h1>
                            </div>
                            <p className="text-lg text-white/90 mb-4 max-w-2xl">
                                {store.description || "Your store is ready to serve customers"}
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                {store.category && store.category.length > 0 ? (
                                    store.category.map((cat, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium border border-white/30"
                                        >
                                            {cat}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-white/70 text-sm">No categories specified</span>
                                )}
                            </div>
                        </div>

                        <div className="flex-shrink-0 text-center">
                            {userInfo.avatarUrl ? (
                                <img
                                    src={userInfo.avatarUrl}
                                    alt={userInfo.name}
                                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white/30 shadow-xl"
                                />
                            ) : (
                                <div
                                    className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto border-4 border-white/30 shadow-xl ${avatarColorClass}`}
                                >
                                    {initials}
                                </div>
                            )}
                            <p className="mt-3 text-lg font-bold text-white">{userInfo.name || "Unnamed"}</p>
                            <p className="text-sm text-white/80">@{userInfo.username || "username"}</p>
                            <p className="text-sm text-white/80">📞 {userInfo.phone || "phone"}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <button
                        onClick={() => setShowEditProfileModal(true)}
                        className="group cursor-pointer bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-black dark:border-white hover:border-sky-500 dark:hover:border-sky-400"
                    >
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FiUser className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                        </div>
                        <p className="text-sm font-semibold text-center">Edit Profile Info</p>
                    </button>

                    <button
                        onClick={() => setShowChangeAvatarModal(true)}
                        className="group cursor-pointer bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-black dark:border-white hover:border-emerald-500 dark:hover:border-emerald-400"
                    >
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FiImage className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-sm font-semibold text-center">{userInfo.avatarUrl ? "Change Profile Image" : "Add Profile Image"}</p>
                    </button>

                    <button
                        onClick={() => navigate("/seller/store-details", { state: { initialData: store } })}
                        className="group cursor-pointer bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-black dark:border-white hover:border-indigo-500 dark:hover:border-indigo-400"
                    >
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FiFileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="text-sm font-semibold text-center">Edit Store Details</p>
                    </button>

                    <button
                        onClick={() => navigate("/seller/new-product")}
                        className="group cursor-pointer bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-black dark:border-white hover:border-green-500 dark:hover:border-green-400"
                    >
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FiPackage className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm font-semibold text-center">Add New Product</p>
                    </button>

                    <button
                        onClick={() => navigate("/seller/used-product")}
                        className="group cursor-pointer bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-black dark:border-white hover:border-purple-500 dark:hover:border-purple-400"
                    >
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FiBox className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-sm font-semibold text-center">Add Used Product</p>
                    </button>

                    <button
                        onClick={() => navigate("/seller/delivery-zone")}
                        className="group cursor-pointer bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-black dark:border-white hover:border-red-500 dark:hover:border-red-400"
                    >
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FiMapPin className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-sm font-semibold text-center">Mangae Delivery Zones</p>
                    </button>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 mb-8 border border-black dark:border-white">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                            <FiTrendingUp className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <h3 className="text-2xl font-bold">Performance Overview</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        <div className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-500 p-5 rounded-xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-black dark:border-white">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                            <FiZap className="h-8 w-8 mb-2 relative z-10" />
                            <p className="text-xs opacity-90 mb-1 relative z-10">Total Orders</p>
                            <h3 className="text-3xl font-bold relative z-10">{counts.orderCount || 0}</h3>
                        </div>

                        <div className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-black dark:border-white">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                            <FiCheckSquare className="h-8 w-8 mb-2 relative z-10" />
                            <p className="text-xs opacity-90 mb-1 relative z-10">Delivered</p>
                            <h3 className="text-3xl font-bold relative z-10">0</h3>
                        </div>

                        <div onClick={() => navigate(`/seller/store?show=new`, { replace: true })} className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-black dark:border-white">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                            <FiPackage className="h-8 w-8 mb-2 relative z-10" />
                            <p className="text-xs opacity-90 mb-1 relative z-10">New Products</p>
                            <h3 className="text-3xl font-bold relative z-10">{counts.newProductCount || 0}</h3>
                        </div>

                        <div onClick={() => navigate(`/seller/store?show=used`, { replace: true })} className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-rose-500 to-pink-600 p-5 rounded-xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-black dark:border-white">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                            <FiArchive className="h-8 w-8 mb-2 relative z-10" />
                            <p className="text-xs opacity-90 mb-1 relative z-10">Used Products</p>
                            <h3 className="text-3xl font-bold relative z-10">{counts.usedProductCount || 0}</h3>
                        </div>

                        <div className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 p-5 rounded-xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-black dark:border-white">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                            <FiStar className="h-8 w-8 mb-2 relative z-10" />
                            <p className="text-xs opacity-90 mb-1 relative z-10">Rating</p>
                            <h3 className="text-3xl font-bold relative z-10">0</h3>
                        </div>

                        <div className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 p-5 rounded-xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-black dark:border-white">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                            <FiMessageSquare className="h-8 w-8 mb-2 relative z-10" />
                            <p className="text-xs opacity-90 mb-1 relative z-10">Reviews</p>
                            <h3 className="text-3xl font-bold relative z-10">{counts.reviewCount || 0}</h3>
                        </div>

                        <div className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-red-600 to-rose-700 p-5 rounded-xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-black dark:border-white">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                            <FiXCircle className="h-8 w-8 mb-2 relative z-10" />
                            <p className="text-xs opacity-90 mb-1 relative z-10">Complaints</p>
                            <h3 className="text-3xl font-bold relative z-10">0</h3>
                        </div>

                        <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 p-5 rounded-xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-black dark:border-white">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                            <FiEye className="h-8 w-8 mb-2 relative z-10" />
                            <p className="text-xs opacity-90 mb-1 relative z-10">Views</p>
                            <h3 className="text-3xl font-bold relative z-10">{counts.viewCount || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-black dark:border-white">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                            <FiHome className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <h3 className="text-2xl font-bold">Store Locations</h3>
                    </div>

                    {store.addresses && store.addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {store.addresses.map((addr, index) => (
                                <div
                                    key={index}
                                    className="group relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-900/50 p-6 rounded-xl border border-black dark:border-white hover:border-sky-500 dark:hover:border-sky-400 transition-all duration-300 hover:shadow-lg"
                                >
                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="pr-10">
                                        <p className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">
                                            Location {index + 1}
                                        </p>
                                        <div className="space-y-2">
                                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                                {addr.addressLine1}
                                            </p>
                                            {addr.addressLine2 && (
                                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                                    {addr.addressLine2}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 pt-2 border-t border-gray-300 dark:border-neutral-700">
                                                <FiMapPin className="text-sky-500 flex-shrink-0" />
                                                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                                    {addr.city}, {addr.state} - {addr.pincode}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-neutral-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-neutral-800">
                            <FiMapPin className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-neutral-600" />
                            <p className="text-gray-500 dark:text-gray-400 mb-4">No physical addresses listed yet</p>
                            <button
                                onClick={() => navigate("/seller/store-details", { state: { initialData: store } })}
                                className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors cursor-pointer"
                            >
                                Add Location
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showEditProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditProfileModal(false)} />
                    <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="relative max-w-md w-full bg-white dark:bg-neutral-950 p-8 rounded-2xl shadow-2xl z-10 border-2 border-gray-200 dark:border-neutral-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                                <FiUser className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                            </div>
                            <h3 className="text-2xl font-bold">Edit Profile</h3>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold mb-2">Name</label>
                                <input
                                    id="name"
                                    {...registerProfile("name", { required: true })}
                                    autoComplete="name"
                                    className="p-3 border-2 border-gray-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 w-full focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                                    placeholder="Enter Name"
                                />
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-semibold mb-2">Username</label>
                                <input
                                    id="username"
                                    {...registerProfile("username", { required: true })}
                                    autoComplete="username"
                                    className="p-3 border-2 border-gray-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 w-full focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                                    placeholder="Enter Username"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold mb-2">Phone Number</label>
                                <input
                                    id="phone"
                                    {...registerProfile("phone", { required: true })}
                                    autoComplete="tel"
                                    className="p-3 border-2 border-gray-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 w-full focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                                    placeholder="Enter Phone Number"
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                type="button"
                                className="px-6 py-2.5 font-semibold rounded-xl text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors"
                                onClick={() => setShowEditProfileModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showChangeAvatarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowChangeAvatarModal(false)} />
                    <form onSubmit={handleSubmitAvatar(onAvatarSubmit)} className="relative max-w-md w-full bg-white dark:bg-neutral-950 p-8 rounded-2xl shadow-2xl z-10 border-2 border-gray-200 dark:border-neutral-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <FiImage className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold">Change Avatar</h3>
                        </div>

                        <div className="flex flex-col items-center gap-4 mb-6">
                            {getPreviewAvatarUrl() ? (
                                <img
                                    src={getPreviewAvatarUrl()}
                                    alt="Avatar Preview"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-sky-500 shadow-xl"
                                />
                            ) : (
                                <div
                                    className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-sky-500 shadow-xl ${avatarColorClass}`}
                                >
                                    {initials}
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <label htmlFor="label" className="block text-sm font-semibold mb-3">Choose a new avatar (max 2 MB)</label>
                            <label htmlFor="avatar" className="flex items-center justify-center cursor-pointer bg-gray-100 dark:bg-neutral-900 text-gray-700 dark:text-gray-300 px-4 py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors border-2 border-dashed border-gray-400 dark:border-neutral-700 hover:border-sky-500 dark:hover:border-sky-400">
                                <FiImage className="mr-2 flex-shrink-0" />
                                <span className="truncate">
                                    {avatarFile && avatarFile.length > 0 ? `Selected: ${avatarFile[0].name}` : "Click to select file"}
                                </span>
                                <input id="avatar" type="file" {...registerAvatar("avatar")} accept="image/*" className="hidden" />
                            </label>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 flex-wrap">
                            {userInfo.avatarUrl && (
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    className="px-6 py-2.5 rounded-xl font-semibold border-2 border-red-500 dark:border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2"
                                >
                                    <FiXCircle /> Remove
                                </button>
                            )}
                            <button
                                type="button"
                                className="px-6 py-2.5 font-semibold rounded-xl text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors"
                                onClick={() => setShowChangeAvatarModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
                            >
                                Upload
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default SellerDashboard;