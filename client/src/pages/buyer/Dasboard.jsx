import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Card from "../../components/Card.jsx";
import UsedProductCard from "../../components/UsedProductCard.jsx";
import useAuthStore from "../../store/auth.js";
import useCartStore from "../../store/cart.js";
import { Heart, Package, ShoppingCart, Eye, Star, Clock, Edit3, ArrowRight, MessageSquare, User, ImageDown, MapPin } from "lucide-react";
import { getWishlistProducts, getViewedProduct } from "../../api/product.js";
import { useNavigate } from "react-router-dom";
import useLoaderStore from "../../store/loader.js";
import { toast } from 'react-hot-toast';
import { changeAvatar, removeAvatar, updateProfile } from "../../api/user.js";
import { getChatsCount } from "../../api/chat.js";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { getCartLength } = useCartStore();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoaderStore();
  const [chatsCount, setChatsCount] = useState(0);
  const [buyerInfo, setBuyerInfo] = useState({
    name: "",
    username: "",
    phone: "",
    avatarUrl: "",
  });
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangeAvatarModal, setShowChangeAvatarModal] = useState(false);

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetch("/api/orders").then((res) => res.json()),
    enabled: !!isAuthenticated,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { data: wishlistData = { newProductWishlist: [], usedProductWishlist: [] } } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlistProducts,
    enabled: !!isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const { data: viewedData = { newProductViewed: [], usedProductViewed: [] } } = useQuery({
    queryKey: ["recentlyViewed"],
    queryFn: getViewedProduct,
    enabled: !!isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile } = useForm();
  const { register: registerAvatar, handleSubmit: handleSubmitAvatar, watch: watchAvatar, reset: resetAvatar } = useForm();
  const avatarFile = watchAvatar("avatar");

  useEffect(() => {
    if (isAuthenticated && user) {
      setBuyerInfo((prev) => ({
        ...prev,
        name: user.name || "",
        username: user.username || "",
        phone: user.phone || "",
        avatarUrl: user.avatar?.url || "",
      }));
      resetProfile({ name: user.name, username: user.username, phone: user.phone });
    }
  }, [isAuthenticated, user, resetProfile]);

  useEffect(() => {
    const fetchChatsCount = async () => {
      const result = await getChatsCount();
      if (result.success) {
        setChatsCount(result.data);
      }
    }
    fetchChatsCount();
  }, [])

  const avatarColors = [
    "bg-indigo-500", "bg-emerald-500", "bg-rose-500", "bg-yellow-500",
    "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-sky-500",
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
        setBuyerInfo((prev) => ({ ...prev, name: result.data.name, username: result.data.username, phone: result.data.phone }));
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
          setBuyerInfo((p) => ({ ...p, avatarUrl: preview }));
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
          setBuyerInfo((p) => ({ ...p, avatarUrl: "" }));
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
    return buyerInfo.avatarUrl || "";
  };

  const initials = buyerInfo.name ? buyerInfo.name.charAt(0).toUpperCase() : "U";
  const avatarColorClass = getAvatarColorClass(buyerInfo.name || buyerInfo.username || buyerInfo.phone);
  const totalWishlistItems = wishlistData.newProductWishlist.length + wishlistData.usedProductWishlist.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pt-24 sm:pt-28 pb-10 px-3 sm:px-4 lg:px-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 border border-black dark:border-white">
          <div className="flex flex-col xl:flex-row xl:items-center gap-8">
            <div className="flex items-start gap-5">
              {buyerInfo.avatarUrl ? (
                <img
                  src={buyerInfo.avatarUrl}
                  alt={buyerInfo.name}
                  className="w-24 h-24 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0 ${avatarColorClass}`}>
                  {initials}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                      {buyerInfo.name || "Unnamed User"}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{buyerInfo.username || "username"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{buyerInfo.phone || "phone"}</p>
                  </div>
                  <button
                    className="p-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors flex-shrink-0 border border-black dark:border-white cursor-pointer"
                    onClick={() => setShowEditProfileModal(true)}
                  >
                    <Edit3 size={20} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors border border-black dark:border-white cursor-pointer"
                    onClick={() => navigate('/buyer/address')}
                  >
                    <MapPin size={16} />
                    <span>Manage Address</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors border border-black dark:border-white cursor-pointer"
                    onClick={() => setShowChangeAvatarModal(true)}
                  >
                    {buyerInfo.avatarUrl ? <ImageDown size={16} /> : <User size={16} />}
                    <span>{buyerInfo.avatarUrl ? "Change Avatar" : "Add Avatar"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full xl:w-px h-px xl:h-24 bg-gray-200 dark:bg-neutral-800" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xl:flex-1">
              <div
                onClick={() => navigate('/buyer/order', { replace: true })}
                className="bg-gradient-to-br border border-black dark:border-white from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 p-5 rounded-xl cursor-pointer hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white dark:bg-indigo-900/40 rounded-xl flex items-center justify-center shadow-sm">
                    <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">Total Orders</p>
                <h3 className="text-2xl font-bold text-indigo-900 dark:text-white">{orders.length}</h3>
              </div>

              <div
                onClick={() => navigate('/buyer/wishlist?show=new', { replace: true })}
                className="bg-gradient-to-br border border-black dark:border-white from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/20 p-5 rounded-xl cursor-pointer hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white dark:bg-rose-900/40 rounded-xl flex items-center justify-center shadow-sm">
                    <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  </div>
                </div>
                <p className="text-xs font-medium text-rose-700 dark:text-rose-300 mb-1">Wishlist Items</p>
                <h3 className="text-2xl font-bold text-rose-900 dark:text-white">{totalWishlistItems}</h3>
              </div>

              <div
                onClick={() => navigate('/buyer/cart', { replace: true })}
                className="bg-gradient-to-br border border-black dark:border-white from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 p-5 rounded-xl cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white dark:bg-emerald-900/40 rounded-xl flex items-center justify-center shadow-sm">
                    <ShoppingCart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">Cart Items</p>
                <h3 className="text-2xl font-bold text-emerald-900 dark:text-white">{getCartLength()}</h3>
              </div>

              <div
                onClick={() => navigate('/buyer/chat', { replace: true })}
                className="bg-gradient-to-br border border-black dark:border-white from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 p-5 rounded-xl cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white dark:bg-blue-900/40 rounded-xl flex items-center justify-center shadow-sm">
                    <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Active Chats</p>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-white">{chatsCount}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 border border-black dark:border-white">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Orders</h2>
            </div>
            <span onClick={() => navigate('/buyer/orders', { replace: true })} className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </span>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-neutral-800 rounded-xl">
              <div className="w-16 h-16 bg-gray-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No orders yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start shopping to see your orders here</p>
            </div>
          ) : (
            <div className="overflow-x-auto hide-scrollbar -mx-2 px-2">
              <div className="flex gap-4 pb-2">
                {orders.slice(0, 10).map((order) => (
                  <div key={order._id} className="w-[320px] flex-shrink-0 bg-gray-50 dark:bg-neutral-800 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order ID</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">#{order._id.slice(-8)}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Date</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-neutral-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 border border-black dark:border-white">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Products Wishlist</h2>
            </div>
            <a href="/buyer/wishlist?show=new" className="text-sm cursor-pointer font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </a>
          </div>
          {wishlistData.newProductWishlist.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-neutral-800 rounded-xl">
              <div className="w-16 h-16 bg-gray-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No items in wishlist</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add products you love to your wishlist</p>
            </div>
          ) : (
            <div className="overflow-x-auto hide-scrollbar -mx-2 px-2">
              <div className="flex gap-4 pb-2">
                {wishlistData.newProductWishlist.slice(0, 10).map((p) => (
                  <div key={p._id} className="w-[320px] flex-shrink-0">
                    <Card product={p} userRole="buyer" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 border border-black dark:border-white">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Used Products Wishlist</h2>
            </div>
            <span onClick={() => navigate('/buyer/wishlist?show=used', { replace: true })} className="text-sm cursor-pointer font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </span>
          </div>
          {wishlistData.usedProductWishlist.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-neutral-800 rounded-xl">
              <div className="w-16 h-16 bg-gray-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No items in wishlist</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add used products you love to your wishlist</p>
            </div>
          ) : (
            <div className="overflow-x-auto hide-scrollbar -mx-2 px-2">
              <div className="flex gap-4 pb-2">
                {wishlistData.usedProductWishlist.slice(0, 10).map((p) => (
                  <div key={p._id} className="w-[320px] flex-shrink-0">
                    <UsedProductCard product={p} userRole="buyer" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 border border-black dark:border-white">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recently Viewed New Products</h2>
            </div>
            <span onClick={() => navigate('/buyer/recently-viewed?show=new', { replace: true })} className="text-sm cursor-pointer font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </span>
          </div>
          {viewedData.newProductViewed.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-neutral-800 rounded-xl">
              <div className="w-16 h-16 bg-gray-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No recently viewed products</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Products you view will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto hide-scrollbar -mx-2 px-2">
              <div className="flex gap-4 pb-2">
                {viewedData.newProductViewed.slice(0, 10).map((p) => (
                  <div key={p._id} className="w-[320px] flex-shrink-0">
                    <Card product={p} userRole="buyer" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 border border-black dark:border-white">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recently Viewed Used Products</h2>
            </div>
            <span onClick={() => navigate('/buyer/recently-viewed?show=used', { replace: true })} className="text-sm cursor-pointer font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </span>
          </div>
          {viewedData.usedProductViewed.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-neutral-800 rounded-xl">
              <div className="w-16 h-16 bg-gray-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No recently viewed products</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Used products you view will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto hide-scrollbar -mx-2 px-2">
              <div className="flex gap-4 pb-2">
                {viewedData.usedProductViewed.slice(0, 10).map((p) => (
                  <div key={p._id} className="w-[320px] flex-shrink-0">
                    <UsedProductCard product={p} userRole="buyer" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showEditProfileModal && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200 border border-black dark:border-white">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Edit Profile</h3>
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  id="name"
                  {...registerProfile("name", { required: true })}
                  autoComplete="name"
                  className="w-full px-4 py-3 border border-black dark:border-white rounded-xl bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username</label>
                <input
                  id="username"
                  {...registerProfile("username", { required: true })}
                  autoComplete="username"
                  className="w-full px-4 py-3 border border-black dark:border-white rounded-xl bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input
                  id="phone"
                  {...registerProfile("phone", { required: true })}
                  autoComplete="tel"
                  className="w-full px-4 py-3 border border-black dark:border-white rounded-xl bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 py-3 rounded-xl text-white font-medium bg-gray-500 hover:bg-gray-600 transition-colors border border-black dark:border-white cursor-pointer"
                  onClick={() => setShowEditProfileModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors border border-black dark:border-white cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showChangeAvatarModal && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200 border border-black dark:border-white">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Change Avatar</h3>
            <form onSubmit={handleSubmitAvatar(onAvatarSubmit)}>
              <div className="flex flex-col items-center gap-4 mb-8">
                {getPreviewAvatarUrl() ? (
                  <img src={getPreviewAvatarUrl()} alt="Avatar Preview" className="w-32 h-32 rounded-full object-cover shadow-lg" />
                ) : (
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-semibold shadow-lg ${getAvatarColorClass(buyerInfo.name)}`}>
                    {initials}
                  </div>
                )}
              </div>

              <div className="mb-8">
                <label htmlFor="label" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Choose a new avatar (max 2 MB)
                </label>
                <div className="space-y-3">
                  <label htmlFor="avatar" className="inline-block cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition-colors border border-black dark:border-white">
                    Choose File
                    <input id="avatar" type="file" {...registerAvatar("avatar")} accept="image/*" className="hidden" />
                  </label>
                  {avatarFile && avatarFile.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Selected: {avatarFile[0].name}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {buyerInfo.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="flex-1 py-3 rounded-xl text-white font-medium bg-red-600 hover:bg-red-700 transition-colors border border-black dark:border-white cursor-pointer"
                  >
                    Remove
                  </button>
                )}
                <button
                  type="button"
                  className="flex-1 py-3 rounded-xl text-white font-medium bg-gray-500 hover:bg-gray-600 transition-colors border border-black dark:border-white cursor-pointer"
                  onClick={() => setShowChangeAvatarModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors border border-black dark:border-white cursor-pointer">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}