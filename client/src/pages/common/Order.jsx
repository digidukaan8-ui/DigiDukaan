import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Package, MapPin, Truck, Star, X, CheckCircle, XCircle, Clock, ChevronLeft, Calendar, CreditCard, Phone, Home } from "lucide-react";
import { toast } from "react-hot-toast";
import useAuthStore from "../../store/auth";
import useOrderStore from "../../store/order";
import useLoaderStore from "../../store/loader";
import useCartStore from "../../store/cart";
import { getCart } from "../../api/product";
import { verifyOrder, getOrders, cancelOrder, updateOrderStatus } from "../../api/order";

export default function Order() {
  const { user } = useAuthStore();
  const { orders, isFetched, setOrders, addOrder, updateOrder, clearOrders } = useOrderStore();
  const { startLoading, stopLoading } = useLoaderStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderIdParam = searchParams.get("orderId");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const orderStatusEnum = [
    "PENDING",
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "RETURNED",
  ];

  const statusColors = {
    PENDING: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    CONFIRMED: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    PACKED: "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    SHIPPED: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    DELIVERED: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
    RETURNED: "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800",
    CANCELLED: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
  };

  const fetchCartItems = async () => {
    const result = await getCart();
    if (result.success) {
      useCartStore.getState().clearCart();
      useCartStore.getState().setCart(result.data || []);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderIdParam) return;

      startLoading("confirmingPayment");
      try {
        const result = await verifyOrder(orderIdParam);
        if (result.success) {
          addOrder(result.data);
          fetchCartItems();
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
        }
      } finally {
        stopLoading();
      }
    }
    if (orders.length === 0 && !isFetched && orderIdParam == null) {
      fetchOrders();
    }
  }, []);

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    startLoading("cancelOrder");
    try {
      const result = await cancelOrder(selectedOrder._id);
      if (result.success) {
        updateOrder(selectedOrder._id, result.data);
        toast.success("Order cancelled successfully");
        setShowCancelModal(false);
        setSelectedOrder(null);
      }
    } finally {
      stopLoading();
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    startLoading("updateStatus");
    try {
      const result = await updateOrderStatus(selectedOrder._id, newStatus);
      if (result.success) {
        updateOrder(selectedOrder._id, result.data);
        toast.success("Order status updated");
        setSelectedOrder(null);
      }
    } finally {
      stopLoading();
    }
  };

  const handleReviewClick = (productId, productName, img) => {
    navigate("/buyer/review", {
      state: {
        productId,
        productName,
        img
      }
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      default:
        return <Truck className="w-4 h-4" />;
    }
  };

  const calculateDeliveryDate = (createdAt, deliverWithInDays) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + deliverWithInDays);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (orders.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 pt-40 pb-20 px-4">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-8 sm:p-10 border border-gray-100 dark:border-neutral-800">
          <div className="bg-gray-100 dark:bg-neutral-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No orders yet
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Start shopping to see your orders here
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  const deliveryDate = selectedOrder
    ? calculateDeliveryDate(selectedOrder.createdAt, selectedOrder.deliveryCharge.deliverWithInDays)
    : null;

  const totalPlatformFee = selectedOrder
    ? selectedOrder.products.reduce((sum, item) => sum + (item.priceDistribution.platformFee?.amount || 0) * item.quantity, 0)
    : 0;

  const totalProductTax = selectedOrder
    ? selectedOrder.products.reduce((sum, item) => sum + (item.priceDistribution.tax?.amount || 0) * item.quantity, 0)
    : 0;

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 pt-20 sm:pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">My Orders</h1>
        </div>

        {!selectedOrder ? (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100 dark:border-neutral-800 hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order ID</p>
                    <p className="font-semibold text-gray-900 dark:text-white truncate">#{order._id.slice(-8)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border whitespace-nowrap ${statusColors[order.status]}`}>
                    {getStatusIcon(order.status)}
                    <span className="hidden sm:inline">{order.status}</span>
                  </span>
                </div>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Store:</span>
                    <span className="text-gray-900 dark:text-white font-medium truncate">{order.storeId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Items:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{order.products.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="text-gray-900 dark:text-white font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Placed:</span>
                    <span className="text-gray-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="w-full py-2.5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors border border-gray-200 dark:border-neutral-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Orders</span>
            </button>

            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Order #{selectedOrder._id.slice(-8)}
                  </h2>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedOrder.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Delivery by: {deliveryDate}
                    </p>
                  </div>
                </div>
                <span className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border ${statusColors[selectedOrder.status]}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-neutral-950 p-4 rounded-lg border border-gray-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Delivery Address</h3>
                  </div>
                  {selectedOrder.addressId && (
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
                      <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.addressId.name}</p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {selectedOrder.addressId.mobile}
                      </p>
                      <p>{selectedOrder.addressId.addressLine1}</p>
                      {selectedOrder.addressId.addressLine2 && <p>{selectedOrder.addressId.addressLine2}</p>}
                      <p>{selectedOrder.addressId.city}, {selectedOrder.addressId.state} - {selectedOrder.addressId.pincode}</p>
                      {selectedOrder.addressId.landmark && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Landmark: {selectedOrder.addressId.landmark}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded text-xs mt-2">
                        <Home className="w-3 h-3" />
                        {selectedOrder.addressId.addressType}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-neutral-950 p-4 rounded-lg border border-gray-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Payment Info</h3>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="font-medium">{selectedOrder.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Method:</span>
                      <span className="font-medium">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-neutral-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment ID</p>
                      <p className="font-mono text-xs bg-gray-100 dark:bg-neutral-800 p-2 rounded break-all">{selectedOrder.paymentId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-neutral-800">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Store: {selectedOrder.storeId?.name || 'N/A'}</h3>
              </div>

              <div className="overflow-x-auto hide-scrollbar">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-neutral-900">
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Product</th>
                        <th className="px-3 sm:px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Qty</th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Base Price</th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Discount</th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">After Discount</th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Product Charge</th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Subtotal</th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Platform Fee</th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Tax</th>
                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Item Total</th>
                        <th className="px-3 sm:px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-800 cursor-pointer">
                      {selectedOrder.products.map((item) => {
                        const p = item.priceDistribution;
                        const productTitle = item.productId?.title || "Product";
                        const productImg = item.productId?.img[0]?.url || null;
                        const productUnit = item.productId?.unit || "N/A";
                        const productId = item.productId?._id;

                        const basePrice = p.basePrice || 0;
                        const discount = p.discount || 0;
                        const priceAfterDiscount = basePrice - discount;
                        const productCharge = p.productCharge || 0;
                        const subtotal = (priceAfterDiscount + productCharge) * item.quantity;
                        const platformFeeAmount = p.platformFee?.amount || 0;
                        const platformFeeRate = p.platformFee?.rate || 0;
                        const taxAmount = p.tax?.amount || 0;
                        const taxRate = p.tax?.rate || 0;
                        const taxTotal = taxAmount * item.quantity;
                        const productChargeTotal = productCharge * item.quantity;
                        const finalPriceTotal = item.finalPrice * item.quantity;

                        return (
                          <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-neutral-950">
                            <td className="px-3 sm:px-6 py-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{productTitle}</p>
                            </td>
                            <td className="px-3 sm:px-6 py-3 text-center">
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 rounded text-xs font-medium text-blue-800 dark:text-blue-300 whitespace-nowrap">
                                {item.quantity}{productUnit}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-3 text-right">
                              <p className="text-sm text-gray-900 dark:text-white whitespace-nowrap">₹{(basePrice * item.quantity).toFixed(2)}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">₹{basePrice.toFixed(2)}/{productUnit}</p>
                            </td>
                            <td className="px-3 sm:px-6 py-3 text-right">
                              <p className={`text-sm font-medium whitespace-nowrap ${discount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                                {discount > 0 ? `-₹${(discount * item.quantity).toFixed(2)}` : '-'}
                              </p>
                            </td>
                            <td className="px-3 sm:px-6 py-3 text-right">
                              <p className="text-sm text-gray-900 dark:text-white whitespace-nowrap">₹{(priceAfterDiscount * item.quantity).toFixed(2)}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">₹{priceAfterDiscount.toFixed(2)}/{productUnit}</p>
                            </td>
                            <td className="px-3 sm:px-6 py-3 text-right">
                              <p className={`text-sm whitespace-nowrap ${productChargeTotal > 0 ? 'text-gray-900 dark:text-white' : 'text-green-600'}`}>
                                {productChargeTotal > 0 ? `+₹${productChargeTotal.toFixed(2)}` : 'FREE'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">₹{productCharge.toFixed(2)}/{productUnit}</p>
                            </td>
                            <td className="px-3 sm:px-6 py-3 text-right">
                              <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">₹{subtotal.toFixed(2)}</p>
                            </td>
                            <td className="px-3 sm:px-6 py-3 text-right">
                              <p className="text-sm text-gray-900 dark:text-white whitespace-nowrap">₹{platformFeeAmount.toFixed(2)}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">({platformFeeRate}%)</p>
                            </td>
                            <td className="px-3 sm:px-6 py-3 text-right">
                              <p className="text-sm text-gray-900 dark:text-white whitespace-nowrap">₹{taxTotal.toFixed(2)}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">({taxRate}%)</p>
                            </td>
                            <td className="px-3 sm:px-6 py-3 text-right">
                              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">₹{finalPriceTotal.toFixed(2)}</p>
                            </td>
                            <td className="px-3 sm:px-6 py-3 text-center">
                              <button
                                onClick={() => handleReviewClick(productId, productTitle, productImg)}
                                className="inline-flex cursor-pointer items-center gap-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded-lg transition-colors"
                              >
                                <Star className="w-3.5 h-3.5" />
                                Review
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-neutral-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal (Products)</span>
                  <span className="text-gray-900 dark:text-white font-medium">₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Charge</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {selectedOrder.deliveryCharge.amount > 0 ? `₹${selectedOrder.deliveryCharge.amount.toFixed(2)}` : <span className="text-green-600 font-semibold">FREE</span>}
                  </span>
                </div>
                {selectedOrder.deliveryCharge.gst.amount > 0 && (
                  <div className="flex justify-between text-sm pl-4">
                    <span className="text-gray-500 dark:text-gray-500 text-xs">GST on Delivery ({selectedOrder.deliveryCharge.gst.rate}%)</span>
                    <span className="text-gray-700 dark:text-gray-300 text-xs">₹{selectedOrder.deliveryCharge.gst.amount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee Total</span>
                  <span className="text-gray-900 dark:text-white font-medium">₹{totalPlatformFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm pl-4">
                  <span className="text-gray-500 dark:text-gray-500 text-xs">GST on Platform Fee (18%)</span>
                  <span className="text-gray-700 dark:text-gray-300 text-xs">₹{selectedOrder.platformTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Product Tax/GST</span>
                  <span className="text-gray-900 dark:text-white font-medium">₹{totalProductTax.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t-2 border-gray-200 dark:border-neutral-700 flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">Grand Total</span>
                  <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {selectedOrder.status !== "CANCELLED" && selectedOrder.status !== "DELIVERED" && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full cursor-pointer sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            )}

            {user?.role === "seller" && selectedOrder.status !== "CANCELLED" && selectedOrder.status !== "DELIVERED" && (
              <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-neutral-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Order Status</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    id="status"
                    value={newStatus || selectedOrder.status}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {orderStatusEnum.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-sm w-full border border-gray-100 dark:border-neutral-800 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cancel Order</h3>
            </div>
            <p className="mb-6 text-gray-700 dark:text-gray-300 text-sm">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full cursor-pointer sm:w-auto px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
              >
                No, Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="w-full cursor-pointer sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}