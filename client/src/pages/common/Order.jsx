import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { Star } from "lucide-react";
import { toast } from "react-hot-toast";

import useAuthStore from "../../store/auth";
import useOrderStore from "../../store/order";
import useLoaderStore from "../../store/loader";
import { verifyOrder, getOrders } from "../../api/order";

export default function Order() {
  const { user } = useAuthStore();
  const { orders, isFetched, setOrders, addOrder, clearOrders } = useOrderStore();
  const { startLoading, stopLoading } = useLoaderStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const orderIdParam = searchParams.get("orderId");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [ratingData, setRatingData] = useState({});

  const orderStatusEnum = [
    "PENDING",
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderIdParam) return;

      startLoading("fetchOrder");
      try {
        const result = await verifyOrder(orderIdParam);
        if (result.success) {
          addOrder(result.data);
          toast.success("Payment confirmed");
          searchParams.delete("orderId");
          setSearchParams(searchParams);
        }
      } finally {
        stopLoading();
      }
    };

    if (orderIdParam !== null) {
      fetchOrder();
    }
  }, [orderIdParam]);

  useEffect(() => {
    const fetchOrders = async () => {
      startLoading('fetchOrder');
      try {
        const result = await getOrders();
        if (result.success) {
          clearOrders();
          setOrders(result.data);
          toast.success("Orders fetched successfully");
        }
      } finally {
        stopLoading();
      }
    }
    if (orders.length === 0 && !isFetched) {
      fetchOrders();
    }
  }, []);

  const handleCancelOrder = (orderId) => {
    console.log("Cancel order:", orderId);
    setCancelModalOpen(false);
  };

  const handleStatusChange = (orderId, newStatus) => {
    console.log("Update status:", orderId, "=>", newStatus);
  };

  const handleRatingChange = (productId, stars, comment = "") => {
    setRatingData((prev) => ({
      ...prev,
      [productId]: { stars, comment },
    }));
  };

  const submitRating = (orderId) => {
    console.log("Submit rating for order:", orderId, ratingData);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      {/* Orders List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.length === 0 ? (
          <p className="col-span-full text-gray-400">No orders found.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className="cursor-pointer rounded-xl bg-gray-800 p-4 shadow hover:bg-gray-700 transition"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg">Order #{order._id.slice(-6)}</h2>
                <span className="text-sm px-2 py-1 bg-gray-700 rounded">
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Total: ₹{order.totalAmount}</p>
              <p className="text-xs text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      >
        <Dialog.Panel className="bg-gray-800 rounded-xl max-w-3xl w-full p-6 relative overflow-hidden">
          <button
            onClick={() => setSelectedOrder(null)}
            className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold mb-4">
            Order #{selectedOrder?._id.slice(-6)}
          </h2>

          {/* Products */}
          <div className="space-y-3">
            {selectedOrder?.products.map((item) => (
              <div
                key={item.productId._id}
                className="flex justify-between bg-gray-700 rounded p-3"
              >
                <div>
                  <p className="font-semibold">{item.productId.name}</p>
                  <p className="text-sm text-gray-400">
                    Qty: {item.quantity} × ₹{item.productId.price}
                  </p>
                </div>
                <div className="text-right font-semibold">₹{item.finalPrice}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4 border-t border-gray-700 pt-4">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold text-lg">₹{selectedOrder?.totalAmount}</span>
          </div>

          {/* Buyer View */}
          {user?.role === "BUYER" && (
            <div className="mt-6 space-y-4">
              {selectedOrder?.status !== "CANCELLED" &&
                selectedOrder?.status !== "DELIVERED" && (
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg"
                  >
                    Cancel Order
                  </button>
                )}

              {selectedOrder?.status === "DELIVERED" && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Rate your products</h3>
                  {selectedOrder.products.map((item) => (
                    <div key={item.productId._id} className="mb-4">
                      <p className="mb-1">{item.productId.name}</p>
                      <div className="flex space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 cursor-pointer ${ratingData[item.productId._id]?.stars >= star
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-500"
                              }`}
                            onClick={() =>
                              handleRatingChange(item.productId._id, star)
                            }
                          />
                        ))}
                      </div>
                      <textarea
                        placeholder="Write a comment..."
                        className="w-full p-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none"
                        rows="2"
                        value={ratingData[item.productId._id]?.comment || ""}
                        onChange={(e) =>
                          handleRatingChange(
                            item.productId._id,
                            ratingData[item.productId._id]?.stars || 0,
                            e.target.value
                          )
                        }
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => submitRating(selectedOrder._id)}
                    className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded font-semibold mt-2"
                  >
                    Submit Ratings
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Seller View */}
          {user?.role === "SELLER" && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Update Order Status</h3>
              <div className="flex space-x-3">
                <select
                  defaultValue={selectedOrder?.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder._id, e.target.value)
                  }
                  className="bg-gray-700 rounded p-2 flex-1"
                >
                  {orderStatusEnum.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold">
                  Update
                </button>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </Dialog>

      {/* Cancel Order Modal */}
      <Dialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      >
        <Dialog.Panel className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
          <Dialog.Title className="text-lg font-bold mb-4">Cancel Order</Dialog.Title>
          <p className="mb-6 text-gray-300">
            Are you sure you want to cancel this order?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
            >
              No
            </button>
            <button
              onClick={() => handleCancelOrder(selectedOrder._id)}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Yes, Cancel
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
