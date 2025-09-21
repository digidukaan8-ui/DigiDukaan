import React, { useState, useEffect } from "react";
import Card from "../../components/Card.jsx"; // apna actual path lagana
import useAuthStore from "../../store/auth"; // login user data ke liye
import useCartStore from "../../store/cart.js";

function Dashboard() {
  const { user, isAuthenticated } = useAuthStore(); // auth store se user le rahe hain

  const [buyerInfo, setBuyerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  

  // API se products aayenge baad me
  const [newProducts, setNewProducts] = useState([]);
  const [usedProducts, setUsedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const { cart: cartItems, getLength: getCartLength } = useCartStore();

  // user info ko set karna login ke baad
  useEffect(() => {
    if (isAuthenticated && user) {
      setBuyerInfo({
        name: user.name || user.fullName || "",
        email: user.email || user.emailAddress || "",
        phone: user.phone || user.contact || "",
        address: user.address || "",
      });
    }
  }, [isAuthenticated, user]);


  const handleChange = (e) => {
    setBuyerInfo({ ...buyerInfo, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Updated Buyer Info:", buyerInfo);
    // yaha backend API call kar sakte ho
  };

  return (
    <div className="p-6 space-y-6 bg-gray-100 dark:bg-neutral-950 min-h-screen">
      {/* Buyer Info */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Buyer Information</h2>
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              name="name"
              value={buyerInfo.name}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-transparent"
            />
            <input
              type="email"
              name="email"
              value={buyerInfo.email}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-transparent"
            />
            <input
              type="text"
              name="phone"
              value={buyerInfo.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-transparent"
            />
            <input
              type="text"
              name="address"
              value={buyerInfo.address}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-transparent"
            />
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p><b>Name:</b> {buyerInfo.name}</p>
            <p><b>Email:</b> {buyerInfo.email}</p>
            <p><b>Phone:</b> {buyerInfo.phone}</p>
            <p><b>Address:</b> {buyerInfo.address}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gray-700 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow text-center">
          <p className="text-gray-500 dark:text-gray-400">Orders</p>
          <h3 className="text-2xl font-bold">{orders.length}</h3>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow text-center">
          <p className="text-gray-500 dark:text-gray-400">Wishlist</p>
          <h3 className="text-2xl font-bold">{wishlist.length}</h3>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow text-center">
          <p className="text-gray-500 dark:text-gray-400">Cart</p>
          <h3 className="text-2xl font-bold">{getCartLength()}</h3> 
        </div>
      </div>

      {/* New Products */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">New Products</h2>
        {newProducts.length === 0 ? (
          <p className="text-gray-500">No new products found.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {newProducts.map((p) => (
              <Card key={p._id} product={p} userRole="buyer" />
            ))}
          </div>
        )}
        {/* Wishlist */}
        <h3 className="text-lg font-semibold mt-4 mb-2">Wishlist</h3>
        {wishlist.length === 0 ? (
          <p className="text-gray-500">No items in wishlist.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {wishlist.map((p) => (
              <Card key={p._id} product={p} userRole="buyer" />
            ))}
          </div>
        )}
        {/* Recently Viewed */}
        <h3 className="text-lg font-semibold mt-4 mb-2">Recently Viewed</h3>
        {recentlyViewed.length === 0 ? (
          <p className="text-gray-500">No recently viewed products.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {recentlyViewed.map((p) => (
              <Card key={p._id} product={p} userRole="buyer" />
            ))}
          </div>
        )}
      </div>

      {/* Used Products */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Used Products</h2>
        {usedProducts.length === 0 ? (
          <p className="text-gray-500">No used products found.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {usedProducts.map((p) => (
              <Card key={p._id} product={p} userRole="buyer" />
            ))}
          </div>
        )}
        {/* Wishlist */}
        <h3 className="text-lg font-semibold mt-4 mb-2">Wishlist</h3>
        {wishlist.length === 0 ? (
          <p className="text-gray-500">No items in wishlist.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {wishlist.map((p) => (
              <Card key={p._id} product={p} userRole="buyer" />
            ))}
          </div>
        )}
        {/* Recently Viewed */}
        <h3 className="text-lg font-semibold mt-4 mb-2">Recently Viewed</h3>
        {recentlyViewed.length === 0 ? (
          <p className="text-gray-500">No recently viewed products.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {recentlyViewed.map((p) => (
              <Card key={p._id} product={p} userRole="buyer" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
