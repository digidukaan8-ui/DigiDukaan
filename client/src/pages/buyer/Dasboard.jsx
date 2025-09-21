import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Card from "../../components/Card.jsx";
import UsedProductCard from "../../components/UsedProductCard.jsx";
import useAuthStore from "../../store/auth.js";
import useCartStore from "../../store/cart.js";
import { Heart, Package, ShoppingCart, Eye, Star, Clock, Edit3, ArrowRight, MessageSquare, User, ImageDown, XCircle, MapPin } from "lucide-react";
import { getWishlistProducts, getViewedProduct } from "../../api/product.js";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { getCartLength } = useCartStore();
  const navigate = useNavigate();

  const [buyerInfo, setBuyerInfo] = useState({
    name: "",
    username: "",
    avatarUrl: "",
  });
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangeAvatarModal, setShowChangeAvatarModal] = useState(false);

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetch("/api/orders").then((res) => res.json()),
  });

  const { data: wishlistData = { newProductWishlist: [], usedProductWishlist: [] } } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlistProducts,
  });

  const { data: viewedData = { newProductViewed: [], usedProductViewed: [] } } = useQuery({
    queryKey: ["recentlyViewed"],
    queryFn: getViewedProduct,
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
        avatarUrl: user.avatar?.url || "",
      }));
      resetProfile({ name: user.name, username: user.username });
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

  const onProfileSubmit = (data) => {
    setBuyerInfo((prev) => ({ ...prev, name: data.name, username: data.username }));
    setShowEditProfileModal(false);
  };

  const onAvatarSubmit = (data) => {
    const file = data.avatar[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setBuyerInfo((p) => ({ ...p, avatarUrl: preview }));
    }
    setShowChangeAvatarModal(false);
  };

  const handleRemoveAvatar = () => {
    if (window.confirm("Are you sure you want to remove your avatar?")) {
      setBuyerInfo((p) => ({ ...p, avatarUrl: "" }));
      resetAvatar({ avatar: null });
      setShowChangeAvatarModal(false);
    }
  };

  const getPreviewAvatarUrl = () => {
    if (avatarFile && avatarFile.length > 0) {
      return URL.createObjectURL(avatarFile[0]);
    }
    return buyerInfo.avatarUrl || "";
  };

  const initials = buyerInfo.name ? buyerInfo.name.charAt(0).toUpperCase() : "U";
  const avatarColorClass = getAvatarColorClass(buyerInfo.name || buyerInfo.username);
  const totalWishlistItems = wishlistData.newProductWishlist.length + wishlistData.usedProductWishlist.length;

  return (
    <div className="px-4 md:px-6 pt-30 pb-10 bg-gray-100 dark:bg-neutral-950 min-h-screen text-black dark:text-white">
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow mb-10 flex flex-col md:flex-row md:items-center gap-6 border border-black dark:border-white">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:w-1/3 text-center md:text-left relative">
          {buyerInfo.avatarUrl ? (
            <img
              src={buyerInfo.avatarUrl}
              alt={buyerInfo.name}
              className="w-20 h-20 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0 ${avatarColorClass}`}
            >
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold truncate">{buyerInfo.name || "Unnamed User"}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{buyerInfo.username || "username"}</p>

            <div className="flex flex-col sm:items-center justify-center sm:justify-start gap-2 mt-3">
              <button
                className="w-40 cursor-pointer bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded-md text-sm flex justify-center items-center gap-1 transition-colors border border-black dark:border-white"
                onClick={() => navigate('/buyer/address')}
              >
                <MapPin size={14} />
                <span>Manage Address</span>
              </button>
              <button
                className="w-40 cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md text-sm flex justify-center items-center gap-1 transition-colors border border-black dark:border-white"
                onClick={() => setShowChangeAvatarModal(true)}
              >
                {buyerInfo.avatarUrl ? <ImageDown size={14} /> : <User size={14} />}
                <span>{buyerInfo.avatarUrl ? "Change Avatar" : "Add Avatar"}</span>
              </button>
            </div>
          </div>
          <button
            className="absolute top-0 right-0 p-2 rounded-full bg-gray-200 dark:bg-neutral-800 text-sky-600 dark:text-sky-400 hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors"
            onClick={() => setShowEditProfileModal(true)}
          >
            <Edit3 size={16} />
          </button>
        </div>

        <div className="w-full h-px md:h-30 md:w-px bg-black dark:bg-white md:mx-4" />

        <div className="md:w-2/3">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:hidden">Your Activity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 cursor-pointer dark:bg-indigo-900/20 p-4 rounded-xl text-center border border-black dark:border-white">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-2 border border-black dark:border-white">
                <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Orders</p>
              <h3 className="text-lg font-bold mt-1">{orders.length}</h3>
            </div>
            <div className="bg-rose-50 cursor-pointer dark:bg-rose-900/20 p-4 rounded-xl text-center border border-black dark:border-white">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-2 border border-black dark:border-white">
                <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Wishlist</p>
              <h3 className="text-lg font-bold mt-1">{totalWishlistItems}</h3>
            </div>
            <div
              onClick={() => navigate('/buyer/cart')}
              className="bg-emerald-50 cursor-pointer dark:bg-emerald-900/20 p-4 rounded-xl text-center border border-black dark:border-white">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-2 border border-black dark:border-white">
                <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Cart</p>
              <h3 className="text-lg font-bold mt-1">{getCartLength()}</h3>
            </div>
            <div
              onClick={() => navigate('/chat')}
              className="bg-blue-50 cursor-pointer dark:bg-blue-900/20 p-4 rounded-xl text-center border border-black dark:border-white">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2 border border-black dark:border-white">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Chats</p>
              <h3 className="text-lg font-bold mt-1">0</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 p-4 md:p-6 rounded-2xl shadow border border-black dark:border-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Star className="h-5 w-5 text-green-500" />
              Your Orders
            </h2>
            <a href="/orders" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </a>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <Package className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400 mt-2">You have no orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto hide-scrollbar custom-scrollbar">
              <div className="flex space-x-4 pb-4 w-full">
                {orders.slice(0, 10).map((order) => (
                  <div key={order._id} className="min-w-[300px] flex-shrink-0 bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">#{order._id.slice(-6)}</span>
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-lg font-bold">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 md:p-6 rounded-2xl shadow border border-black dark:border-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              New Products Wishlist
            </h2>
            <a href="/wishlist/new" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </a>
          </div>
          {wishlistData.newProductWishlist.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <Heart className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400 mt-2">No new products in wishlist</p>
            </div>
          ) : (
            <div className="overflow-x-auto hide-scrollbar custom-scrollbar">
              <div className="flex space-x-4 pb-4">
                {wishlistData.newProductWishlist.slice(0, 10).map((p) => (
                  <div key={p._id} className="min-w-[300px] flex-shrink-0">
                    <Card product={p} userRole="buyer" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 md:p-6 rounded-2xl shadow border border-black dark:border-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              Used Products Wishlist
            </h2>
            <a href="/wishlist/used" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </a>
          </div>
          {wishlistData.usedProductWishlist.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <Heart className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400 mt-2">No used products in wishlist</p>
            </div>
          ) : (
            <div className="overflow-x-auto hide-scrollbar custom-scrollbar">
              <div className="flex space-x-4 pb-4">
                {wishlistData.usedProductWishlist.slice(0, 10).map((p) => (
                  <div key={p._id} className="min-w-[300px] flex-shrink-0">
                    <UsedProductCard product={p} userRole="buyer" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 md:p-6 rounded-2xl shadow border border-black dark:border-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Recently Viewed New Products
            </h2>
            <a href="/recently-viewed/new" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </a>
          </div>
          {viewedData.newProductViewed.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <Eye className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400 mt-2">No recently viewed new products</p>
            </div>
          ) : (
            <div className="overflow-x-auto hide-scrollbar custom-scrollbar">
              <div className="flex space-x-4 pb-4">
                {viewedData.newProductViewed.slice(0, 10).map((p) => (
                  <div key={p._id} className="min-w-[300px] flex-shrink-0">
                    <Card product={p} userRole="buyer" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 md:p-6 rounded-2xl shadow border border-black dark:border-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Recently Viewed Used Products
            </h2>
            <a href="/recently-viewed/used" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </a>
          </div>
          {viewedData.usedProductViewed.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <Eye className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400 mt-2">No recently viewed used products</p>
            </div>
          ) : (
            <div className="overflow-x-auto hide-scrollbar custom-scrollbar">
              <div className="flex space-x-4 pb-4">
                {viewedData.usedProductViewed.slice(0, 10).map((p) => (
                  <div key={p._id} className="min-w-[300px] flex-shrink-0">
                    <UsedProductCard product={p} userRole="buyer" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEditProfileModal(false)} />
          <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="relative max-w-md w-full bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-lg z-10 border border-black dark:border-white">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">Name</label>
                <input id="name" {...registerProfile("name", { required: true })} autoComplete="name" className="p-2 border border-black dark:border-white rounded-lg bg-transparent w-full" placeholder="Name" />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium">Username</label>
                <input id="username" {...registerProfile("username", { required: true })} autoComplete="username" className="p-2 border border-black dark:border-white rounded-lg bg-transparent w-full" placeholder="Username" />
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-2">
              <button type="button" className="w-32 py-2 cursor-pointer rounded-lg text-white border border-black dark:border-white bg-red-600 hover:bg-red-700 transition-colors" onClick={() => setShowEditProfileModal(false)}>Cancel</button>
              <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white w-32 py-2 cursor-pointer rounded-lg transition-colors border border-black dark:border-white">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {showChangeAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowChangeAvatarModal(false)} />
          <form onSubmit={handleSubmitAvatar(onAvatarSubmit)} className="relative max-w-md w-full bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-lg z-10 border border-black dark:border-white">
            <h3 className="text-xl font-bold mb-4">Change Avatar</h3>

            <div className="flex flex-col items-center gap-4 mb-6">
              {getPreviewAvatarUrl() ? (
                <img
                  src={getPreviewAvatarUrl()}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-semibold ${getAvatarColorClass(buyerInfo.name)}`}
                >
                  {initials}
                </div>
              )}
            </div>

            <div className="mt-4">
              <span className="block text-sm font-medium mb-1">Choose a new avatar (max 2 MB)</span>
              <div className="flex items-start flex-col justify-center gap-4">
                <label htmlFor="avatar" className="cursor-pointer bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors border border-black dark:border-white">
                  Choose File
                  <input id="avatar" type="file" {...registerAvatar("avatar")} accept="image/*" className="hidden" />
                </label>
                {avatarFile && avatarFile.length > 0 && <p className="text-sm w-full">Selected: {avatarFile[0].name}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-2">
              {buyerInfo.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="w-32 py-2 rounded-lg cursor-pointer border border-black dark:border-white text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Remove Avatar
                </button>
              )}
              <button type="button" className="w-32 py-2 rounded-lg cursor-pointer border border-black dark:border-white text-white bg-red-600 hover:bg-red-700 transition-colors" onClick={() => setShowChangeAvatarModal(false)}>Cancel</button>
              <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white w-32 py-2 rounded-lg cursor-pointer transition-colors border border-black dark:border-white">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}