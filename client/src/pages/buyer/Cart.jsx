import useCartStore from "../../store/cart";
import { useEffect, useState } from "react";
import { getCart, updateCart, removeCart } from "../../api/product";
import useLoaderStore from "../../store/loader";
import { toast } from "react-hot-toast";
import { Pencil, X, Trash2, Check, ShoppingCart, RefreshCw, ArrowRight, Package } from "lucide-react";
import { useNavigate } from 'react-router-dom'

function Cart() {
  const { cart, isFetched } = useCartStore();
  const { startLoading, stopLoading } = useLoaderStore();
  const [quantities, setQuantities] = useState({});
  const [editing, setEditing] = useState({});
  const navigate = useNavigate();

  const safeCart = Array.isArray(cart) ? cart : [];

  useEffect(() => {
    if (safeCart.length === 0 && !isFetched) {
      fetchCartItems();
    }
  }, []);

  const fetchCartItems = async () => {
    startLoading("fetchCart");
    try {
      const result = await getCart();
      if (result.success) {
        useCartStore.getState().clearCart();
        useCartStore.getState().setCart(result.data || []);
        toast.success("Cart fetched successfully");
      }
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    const q = {};
    safeCart.forEach((item) => {
      q[item._id] = item.quantity;
    });
    setQuantities(q);
  }, [safeCart]);

  const handleUpdate = async (e, id) => {
    e.stopPropagation();
    startLoading("updateCart");
    try {
      const result = await updateCart(id, { quantity: quantities[id] });
      if (result.success) {
        useCartStore.getState().updateCart(id, quantities[id]);
        toast.success("Cart updated");
        setEditing({ ...editing, [id]: false });
      }
    } finally {
      stopLoading();
    }
  };

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    startLoading("removeCart");
    try {
      const result = await removeCart(id);
      if (result.success) {
        useCartStore.getState().removeFromCart(id);
        toast.success("Item removed from cart");
      }
    } finally {
      stopLoading();
    }
  };

  const handleCancel = (e, id) => {
    e.stopPropagation();
    setQuantities({
      ...quantities,
      [id]: safeCart.find((i) => i._id === id).quantity,
    });
    setEditing({ ...editing, [id]: false });
  };

  const calculateItemPrices = (item) => {
    const product = item.productId;
    const basePrice = product.price;
    const qty = quantities[item._id] || item.quantity;
    let discountedPrice = basePrice;
    let discountAmount = 0;

    if (product.discount?.percentage) {
      discountAmount = (basePrice * product.discount.percentage) / 100;
      discountedPrice = basePrice - discountAmount;
    } else if (product.discount?.amount) {
      discountAmount = product.discount.amount;
      discountedPrice = basePrice - discountAmount;
    }

    const deliveryCharge = product.deliveryCharge || 0;
    const finalPrice = discountedPrice;
    const itemTotal = finalPrice * qty + deliveryCharge;

    return {
      basePrice,
      qty,
      discountedPrice,
      discountAmount,
      deliveryCharge,
      itemTotal,
      finalPrice
    };
  };

  const grandTotal = safeCart.reduce(
    (acc, item) => acc + calculateItemPrices(item).itemTotal,
    0
  );

  const handleOnCLick = (id) => {
    navigate(`/product?productId=${id}`);
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 pt-24 sm:pt-28 md:pt-32 pb-8 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
          <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {safeCart.length} {safeCart.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {safeCart.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-neutral-800 rounded-full mb-4">
              <Package className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add items to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {safeCart.map((item) => {
                const prices = calculateItemPrices(item);

                return (
                  <div
                    key={item._id}
                    onClick={() => handleOnCLick(item.productId._id)}
                    className="bg-white dark:bg-neutral-900 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  >
                    <div className="p-3 sm:p-4 md:p-5">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                            {item.productId.img?.[0]?.url && (
                              <img
                                src={item.productId.img[0].url}
                                alt={item.productId.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <button
                            onClick={(e) => handleRemove(e, item._id)}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        <div className="flex-1 space-y-2 sm:space-y-3">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {item.productId.title}
                            </h3>
                            <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                              {item.productId.unit || "N/A"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 mb-0.5">Price</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                ₹{prices.basePrice.toFixed(2)}
                              </p>
                            </div>
                            {prices.discountAmount > 0 && (
                              <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-0.5">Discount</p>
                                <p className="font-semibold text-green-600">
                                  -₹{prices.discountAmount.toFixed(2)}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 mb-0.5">Delivery</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {prices.deliveryCharge === 0 ? (
                                  <span className="text-green-600">FREE</span>
                                ) : (
                                  `₹${prices.deliveryCharge.toFixed(2)}`
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 mb-0.5">Subtotal</p>
                              <p className="font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-base">
                                ₹{prices.itemTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <label 
                              htmlFor={`qty-${item._id}`} 
                              className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Quantity:
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                id={`qty-${item._id}`}
                                type="number"
                                min="1"
                                value={prices.qty}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setQuantities({ ...quantities, [item._id]: parseInt(e.target.value) || 0 })}
                                disabled={!editing[item._id]}
                                className="w-16 sm:w-20 px-2 py-1.5 text-sm text-center border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              {editing[item._id] ? (
                                <>
                                  <button
                                    onClick={(e) => handleUpdate(e, item._id)}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => handleCancel(e, item._id)}
                                    className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing({ ...editing, [item._id]: true })
                                  }}
                                  className="p-2 bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                  <RefreshCw className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 w-4 h-4 sm:w-5 sm:h-5" />
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100">
                      Keep your cart updated
                    </p>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                      Prices and availability may change
                    </p>
                  </div>
                </div>
                <button
                  onClick={fetchCartItems}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-md transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Cart
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Grand Total
                  </p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    ₹{grandTotal.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    *Additional charges may apply at checkout
                  </p>
                </div>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-semibold rounded-lg shadow-lg transition-colors">
                  Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;