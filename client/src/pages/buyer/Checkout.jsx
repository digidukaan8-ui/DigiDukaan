import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/cart";
import useAddressStore from "../../store/address";
import useLoaderStore from "../../store/loader";
import { getAddress } from "../../api/address";
import { addOrder, getStoreCharges } from "../../api/order";
import { getPlatformCharge, getTax } from "../../utils/category";
import { toast } from "react-hot-toast";
import { ShoppingBag, MapPin, Package, AlertTriangle } from "lucide-react";

function Checkout() {
  const { cart } = useCartStore();
  const { addresses, isFetched } = useAddressStore();
  const { startLoading, stopLoading } = useLoaderStore();
  const navigate = useNavigate();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [storeCharges, setStoreCharges] = useState([]);
  const [storeDeliveryCharges, setStoreDeliveryCharges] = useState({});

  const safeCart = Array.isArray(cart) ? cart : [];

  const calculateItemTotal = (item) => {
    const product = item.productId;
    const basePrice = product.price;
    const qty = item.quantity;
    let discountAmount = 0;

    if (product.discount?.percentage) {
      discountAmount = (basePrice * product.discount.percentage) / 100;
    } else if (product.discount?.amount) {
      discountAmount = product.discount.amount;
    }

    const priceAfterDiscount = basePrice - discountAmount;

    const platformFeeRate = getPlatformCharge(product.subCategory?.name, 100);
    const platformFeePerUnit = (priceAfterDiscount * platformFeeRate) / 100;
    const platformFeeTotal = platformFeePerUnit * qty;

    const productChargePerUnit = item.productId.deliveryCharge || 0;
    const priceWithProductCharge = priceAfterDiscount + productChargePerUnit;
    const productChargeTotal = productChargePerUnit * qty;

    const taxRate = getTax(product.subCategory?.name, 100);
    const taxPerUnit = (priceWithProductCharge * taxRate) / 100;
    const taxTotal = taxPerUnit * qty;

    const subtotal = (priceAfterDiscount + productChargePerUnit) * qty;

    const itemTotal = subtotal + platformFeeTotal + taxTotal;

    return {
      basePrice,
      qty,
      discountAmount,
      priceAfterDiscount,
      platformFeeRate,
      platformFeePerUnit,
      platformFeeTotal,
      productChargePerUnit,
      productChargeTotal,
      taxRate,
      taxPerUnit,
      taxTotal,
      subtotal,
      itemTotal
    };
  };

  const storeSubOrders = useMemo(() => {
    const orders = safeCart.reduce((acc, item) => {
      const storeId = item.productId.storeId._id;
      if (!acc[storeId]) {
        acc[storeId] = {
          storeId: storeId,
          storeName: item.productId.storeId.name,
          items: [],
          subtotal: 0,
          totalPlatformFee: 0,
          totalTax: 0,
        };
      }

      const prices = calculateItemTotal(item);
      acc[storeId].items.push({ ...item, prices });
      acc[storeId].subtotal += prices.subtotal;
      acc[storeId].totalPlatformFee += prices.platformFeeTotal;
      acc[storeId].totalTax += prices.taxTotal;
      return acc;
    }, {});
    return Object.values(orders);
  }, [safeCart]);

  const validatedStoreOrders = useMemo(() => {
    return storeSubOrders.map(order => {
      const chargeInfo = storeDeliveryCharges[order.storeId];
      const isDeliverable = chargeInfo && chargeInfo.charge !== null;
      const deliveryCharge = isDeliverable ? chargeInfo.charge : null;

      const gstRates = order.items.map(item => item.prices.taxRate);
      const highestGstRate = Math.max(...gstRates, 0);

      const deliveryGst = deliveryCharge ? (deliveryCharge * highestGstRate) / 100 : 0;

      return {
        ...order,
        isDeliverable,
        deliveryCharge,
        deliveryGstRate: highestGstRate,
        deliveryGst,
      };
    });
  }, [storeSubOrders, storeDeliveryCharges]);

  const deliverableStoreOrders = useMemo(() => {
    return validatedStoreOrders.filter(order => order.isDeliverable);
  }, [validatedStoreOrders]);

  const undeliverableStoreOrders = useMemo(() => {
    return validatedStoreOrders.filter(order => !order.isDeliverable);
  }, [validatedStoreOrders]);

  const orderSummary = useMemo(() => {
    let subtotal = 0;
    let totalPlatformFee = 0;
    let overallTax = 0;
    let totalDeliveryCharges = 0;
    let totalDeliveryGst = 0;

    deliverableStoreOrders.forEach(storeOrder => {
      subtotal += storeOrder.subtotal;
      totalPlatformFee += storeOrder.totalPlatformFee;
      overallTax += storeOrder.totalTax;
      totalDeliveryCharges += storeOrder.deliveryCharge || 0;
      totalDeliveryGst += storeOrder.deliveryGst || 0;
    });

    const platformFeeGST = totalPlatformFee * 0.18;
    const totalAmount = subtotal + totalPlatformFee + platformFeeGST + overallTax + totalDeliveryCharges + totalDeliveryGst;

    return { subtotal, totalPlatformFee, platformFeeGST, overallTax, totalDeliveryCharges, totalDeliveryGst, totalAmount };
  }, [deliverableStoreOrders]);

  useEffect(() => {
    const fetchAddress = async () => {
      startLoading("fetchAddress");
      try {
        const result = await getAddress();
        if (result.success) {
          useAddressStore.getState().clearAddress();
          useAddressStore.getState().setAddresses(result.data);
          if (result.data.length > 0) {
            setSelectedAddress(result.data[0]);
          }
        }
      } finally {
        stopLoading();
      }
    }

    if (addresses.length === 0 && !isFetched) {
      fetchAddress();
    } else if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0]);
    }
  }, [addresses, isFetched]);

  useEffect(() => {
    if (safeCart.length > 0) {
      fetchAllStoreCharges();
    }
  }, [safeCart]);

  useEffect(() => {
    if (selectedAddress && storeCharges.length > 0) {
      calculateStoreDeliveryCharges();
    } else if (!selectedAddress) {
      setStoreDeliveryCharges({});
    }
  }, [selectedAddress, storeCharges]);

  const fetchAllStoreCharges = async () => {
    startLoading("fetchStoreCharges");
    try {
      const storeIds = [...new Set(safeCart.map(item => item.productId.storeId._id))];
      const result = await getStoreCharges(storeIds);
      if (result.success) {
        setStoreCharges(result.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch delivery charges");
      console.error(error);
    } finally {
      stopLoading();
    }
  };

  const calculateStoreDeliveryCharges = () => {
    if (!selectedAddress) return;

    const charges = {};
    const uniqueStoreIds = [...new Set(safeCart.map(item => item.productId.storeId._id))];

    uniqueStoreIds.forEach(storeId => {
      const storeChargesList = storeCharges.filter(charge => charge.storeId === storeId);
      let matchedCharge = null;

      const pincodeMatch = storeChargesList.find(
        charge => charge.deliveryArea === "Pincode" && charge.areaName === selectedAddress.pincode
      );

      if (pincodeMatch) {
        matchedCharge = pincodeMatch.deliveryCharge;
      } else {
        const cityMatch = storeChargesList.find(
          charge => charge.deliveryArea === "City" && charge.areaName.toLowerCase() === selectedAddress.city.toLowerCase()
        );

        if (cityMatch) {
          matchedCharge = cityMatch.deliveryCharge;
        } else {
          const stateMatch = storeChargesList.find(
            charge => charge.deliveryArea === "State" && charge.areaName.toLowerCase() === selectedAddress.state.toLowerCase()
          );

          if (stateMatch) {
            matchedCharge = stateMatch.deliveryCharge;
          } else {
            const townMatch = storeChargesList.find(
              charge => charge.deliveryArea === "Town" && selectedAddress.landmark && charge.areaName.toLowerCase() === selectedAddress.landmark.toLowerCase()
            );

            if (townMatch) {
              matchedCharge = townMatch.deliveryCharge;
            }
          }
        }
      }

      charges[storeId] = {
        charge: matchedCharge,
      };
    });

    setStoreDeliveryCharges(charges);
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    if (deliverableStoreOrders.length === 0) {
      toast.error("No items in your cart can be delivered to the selected address.");
      return;
    }

    const backendPayload = {
      products: [],
      subtotal: Number(orderSummary.subtotal.toFixed(2)),
      deliveryCharges: [],
      platformTax: Number(orderSummary.platformFeeGST.toFixed(2)),
      storeTax: [],
      totalAmount: Number(orderSummary.totalAmount.toFixed(2)),
      addressId: selectedAddress._id
    };

    deliverableStoreOrders.forEach(storeOrder => {
      storeOrder.items.forEach(item => {
        const p = item.prices;
        backendPayload.products.push({
          productId: item.productId._id,
          quantity: p.qty,
          priceDistribution: {
            basePrice: Number(p.basePrice.toFixed(2)),
            discount: Number(p.discountAmount.toFixed(2)),
            productCharge: Number(p.productChargePerUnit.toFixed(2)),
            platformFee: {
              rate: p.platformFeeRate,
              amount: Number(p.platformFeePerUnit.toFixed(2))
            },
            tax: {
              rate: p.taxRate,
              amount: Number(p.taxPerUnit.toFixed(2))
            },
          },
          finalPrice: Number(p.itemTotal.toFixed(2))
        });
      });

      backendPayload.deliveryCharges.push({
        storeId: storeOrder.storeId,
        amount: storeOrder.deliveryCharge || 0,
        gst: {
          rate: storeOrder.deliveryGstRate || 0,
          amount: storeOrder.deliveryGst || 0
        }
      });

      backendPayload.storeTax.push({
        storeId: storeOrder.storeId,
        amount: storeOrder.totalTax,
        gst: {
          rate: storeOrder.deliveryGstRate || 0,
          amount: storeOrder.deliveryGst || 0
        }
      });
    });

    startLoading('creatingOrder');
    try {
      const result = await addOrder(backendPayload);
      if (result.success) {
        startLoading('redirecting');
      }
    } finally {
      stopLoading()
    }
  };

  if (safeCart.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 pt-24 pb-8 px-4">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-neutral-900 rounded-lg shadow p-8">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Add some items to get started
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Checkout</h1>
        </div>

        {undeliverableStoreOrders.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-black dark:border-white rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                {undeliverableStoreOrders.length} store{undeliverableStoreOrders.length > 1 ? 's' : ''} cannot deliver to your selected address.
              </p>
            </div>
          </div>
        )}

        {addresses && addresses.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-5 mb-6 border border-black dark:border-white">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-base font-medium text-gray-900 dark:text-white">
                Delivery Address
              </h2>
            </div>
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  onClick={() => handleSelectAddress(address)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedAddress?._id === address._id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-black dark:border-white hover:border-blue-400 bg-gray-100 dark:bg-neutral-950"
                    }`}
                >
                  <p className="text-sm text-gray-900 dark:text-white">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  {address.landmark && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Landmark: {address.landmark}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow overflow-hidden mb-6 border border-black dark:border-white">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-neutral-950 border-b border-black dark:border-white">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[140px]">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[120px]">Store</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[80px]">Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[120px]">Base Price</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[100px]">Discount</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[130px]">After Discount</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[130px]">Product Charge</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[100px]">Subtotal</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[120px]">Platform Fee</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[110px]">GST/Tax</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[110px]">Item Total</th>
                </tr>
              </thead>
              <tbody>
                {deliverableStoreOrders.flatMap(storeOrder => storeOrder.items).map((item) => {
                  const p = item.prices;
                  return (
                    <tr key={item._id} className="border-b border-black dark:border-white hover:bg-gray-100 dark:hover:bg-neutral-950">
                      <td className="px-6 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.productId.title}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-xs text-gray-700 dark:text-gray-300">{item.productId.storeId.name}</p>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 rounded text-xs font-medium text-gray-900 dark:text-white">
                          {p.qty}{item.productId.unit || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <p className="text-sm text-gray-900 dark:text-white">₹{p.basePrice.toFixed(2)}/{item.productId.unit || "N/A"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total: ₹{(p.basePrice * p.qty).toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {p.discountAmount > 0 ? (
                          <p className="text-sm text-green-600 font-medium">-₹{p.discountAmount.toFixed(2)}</p>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <p className="text-sm text-gray-900 dark:text-white">₹{p.priceAfterDiscount.toFixed(2)}/{item.productId.unit || "N/A"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total: ₹{(p.priceAfterDiscount * p.qty).toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {p.productChargePerUnit > 0 ? (
                          <>
                            <p className="text-sm text-gray-900 dark:text-white">₹{p.productChargePerUnit.toFixed(2)}/{item.productId.unit || "N/A"}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total: ₹{p.productChargeTotal.toFixed(2)}</p>
                          </>
                        ) : (
                          <p className="text-sm text-green-600 font-medium">FREE</p>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">₹{p.subtotal.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <p className="text-sm text-gray-900 dark:text-white">₹{p.platformFeePerUnit.toFixed(2)}/{item.productId.unit || "N/A"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total: ₹{p.platformFeeTotal.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <p className="text-sm text-gray-900 dark:text-white">₹{p.taxPerUnit.toFixed(2)}/{item.productId.unit || "N/A"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total: ₹{p.taxTotal.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">₹{p.itemTotal.toFixed(2)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6 mb-6 border border-black dark:border-white">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal (Discount + Product Charge)</span>
              <span className="text-gray-900 dark:text-white font-medium">₹{orderSummary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Platform Fee</span>
              <span className="text-gray-900 dark:text-white font-medium">₹{(deliverableStoreOrders.reduce((sum, order) => sum + order.totalPlatformFee, 0)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">GST on Platform Fee (18%)</span>
              <span className="text-gray-900 dark:text-white font-medium">₹{orderSummary.platformFeeGST.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total GST/Tax (Products)</span>
              <span className="text-gray-900 dark:text-white font-medium">₹{orderSummary.overallTax.toFixed(2)}</span>
            </div>
            {deliverableStoreOrders.map((order) => (
              <div key={order.storeId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Charge ({order.storeName})</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {order.deliveryCharge > 0 ? `₹${order.deliveryCharge.toFixed(2)}` : <span className="text-green-600">FREE</span>}
                  </span>
                </div>
                {order.deliveryGst > 0 && (
                  <div className="flex justify-between text-sm pl-4">
                    <span className="text-gray-500 dark:text-gray-500 text-xs">GST on Delivery ({order.deliveryGstRate}%)</span>
                    <span className="text-gray-700 dark:text-gray-300 text-xs">₹{order.deliveryGst.toFixed(2)}</span>
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 border-t-2 border-black dark:border-white flex justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-white">Grand Total</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{orderSummary.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center w-full">
          <button
            onClick={handlePlaceOrder}
            disabled={!selectedAddress || deliverableStoreOrders.length === 0}
            className={`w-fit px-4 py-2 text-base font-semibold rounded-lg cursor-pointer border border-black dark:border-white transition-colors ${!selectedAddress || deliverableStoreOrders.length === 0
              ? 'bg-gray-400 cursor-not-allowed text-gray-200'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
              }`}
          >
            {deliverableStoreOrders.length > 0
              ? `Place Order - ₹${orderSummary.totalAmount.toFixed(2)}`
              : 'No Deliverable Items'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;