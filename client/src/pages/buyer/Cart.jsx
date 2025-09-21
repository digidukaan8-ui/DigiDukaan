import useCartStore from "../../store/cart";
import { useEffect, useState } from "react";
import { getCart, updateCart, removeCart } from "../../api/product";
import useLoaderStore from "../../store/loader";
import { toast } from "react-hot-toast";
import { Pencil, X, Trash2, Check, ShoppingCart, RefreshCw, ArrowRight, } from "lucide-react";
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
    <div className="w-full bg-gray-50 dark:bg-neutral-950 min-h-screen font-sans pt-32 pb-8 px-4 sm:px-6">
      <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
        <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Your Cart
        </h2>
      </div>

      {safeCart.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-white dark:bg-neutral-800 rounded-xl md:rounded-2xl shadow-lg">
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium">
            Your cart is empty.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {safeCart.map((item) => {
            const prices = calculateItemPrices(item);

            return (
              <div
                key={item._id}
                onClick={() => handleOnCLick(item.productId._id)}
                className="relative flex flex-wrap justify-between items-center p-4 rounded-xl shadow-md bg-white dark:bg-neutral-900 transition-transform transform hover:scale-[1.01] border border-black dark:border-white"
              >
                <button
                  onClick={(e) => handleRemove(e, item._id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md border border-black dark:border-white"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex justify-center items-center">
                  <div className="w-28 h-28 mb-0 mr-4">
                    {item.productId.img?.[0]?.url && (
                      <img
                        src={item.productId.img[0].url}
                        alt={item.productId.title}
                        className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-neutral-700"
                      />
                    )}
                  </div>

                  <div className="flex-1 w-full md:text-left space-y-1">
                    <h3 className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100">
                      {item.productId.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Unit: {item.productId.unit || "N/A"}
                    </p>

                    <div className="text-xs md:text-sm space-y-1 mt-2">
                      <p className="text-gray-600 dark:text-gray-400">Price: <span className="font-medium">₹{prices.basePrice.toFixed(2)}</span></p>
                      {prices.discountAmount > 0 && (
                        <p className="text-green-600">Discount: <span className="font-medium">₹{prices.discountAmount.toFixed(2)}</span></p>
                      )}
                      <p className="text-gray-600 dark:text-gray-400">Delivery: <span className="font-medium">₹{prices.deliveryCharge.toFixed(2)}</span></p>
                      <p className="text-gray-800 dark:text-gray-200 font-semibold mt-2">Subtotal: <span className="text-base md:text-lg">₹{prices.itemTotal.toFixed(2)}</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <input
                    id={`qty-${item._id}`}
                    type="number"
                    min="1"
                    value={prices.qty}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setQuantities({ ...quantities, [item._id]: parseInt(e.target.value) || 0 })}
                    disabled={!editing[item._id]}
                    className="w-14 md:w-20 px-2 py-1 text-center border rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {editing[item._id] ? (
                    <>
                      <button
                        onClick={(e) => handleUpdate(e, item._id)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors border border-black dark:border-white"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={(e) => handleCancel(e, item._id)}
                        className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors border border-black dark:border-white"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing({ ...editing, [item._id]: true })
                      }}
                      className="p-2 bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors border border-black dark:border-white"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {safeCart.length > 0 && (
        <div className="mt-6 md:mt-10 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50 dark:bg-blue-900 px-4 py-3 md:px-5 md:py-4 rounded-xl shadow border border-black dark:border-white">
            <div className="flex items-center gap-2">
              <RefreshCw className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
              <p className="text-xs md:text-sm font-medium text-blue-800 dark:text-blue-200">
                Please refresh your cart before checkout. Prices and availability may have changed.
              </p>
            </div>
            <button
              onClick={fetchCartItems}
              className="mt-3 sm:mt-0 flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg shadow-md transition-colors border border-black dark:border-white"
            >
              <RefreshCw size={16} />
              Refresh Cart
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-lg w-full border border-black dark:border-white">
            <div className="flex flex-col items-start w-full md:w-auto mb-4 md:mb-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Grand Total</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">₹{grandTotal.toFixed(2)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                *Additional charges may apply at checkout.
              </p>
            </div>
            <button className="flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-semibold rounded-lg shadow-lg transition-colors border border-black dark:border-white">
              Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;