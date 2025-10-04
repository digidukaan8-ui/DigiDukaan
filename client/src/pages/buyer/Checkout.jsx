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
  const { cart, removeItem } = useCartStore();
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
      const storeName = item.productId.storeId.name;
      const storeDeliverInDays = item.productId.storeId.deliveryWithinDays || 3;

      if (!acc[storeId]) {
        acc[storeId] = {
          storeId: storeId,
          storeName: storeName,
          storeDeliverInDays: storeDeliverInDays,
          items: [],
          subtotal: 0,
          totalPlatformFee: 0,
          totalTax: 0,
          totalItemsPrice: 0,
        };
      }

      const prices = calculateItemTotal(item);
      acc[storeId].items.push({ ...item, prices });
      acc[storeId].subtotal += prices.subtotal;
      acc[storeId].totalPlatformFee += prices.platformFeeTotal;
      acc[storeId].totalTax += prices.taxTotal;
      acc[storeId].totalItemsPrice += prices.itemTotal;
      return acc;
    }, {});
    return Object.values(orders);
  }, [safeCart]);

  const validatedStoreOrders = useMemo(() => {
    return storeSubOrders.map(order => {
      const chargeInfo = storeDeliveryCharges[order.storeId];
      const isDeliverable = chargeInfo && chargeInfo.charge !== null;
      const deliveryChargeAmount = isDeliverable ? chargeInfo.charge : null;

      const gstRates = order.items.map(item => item.prices.taxRate);
      const highestGstRate = Math.max(...gstRates, 0);

      const deliveryGstAmount = deliveryChargeAmount ? (deliveryChargeAmount * highestGstRate) / 100 : 0;
      const storePlatformFeeGST = order.totalPlatformFee * 0.18;

      const storeGrandTotal = isDeliverable
        ? order.totalItemsPrice + deliveryChargeAmount + deliveryGstAmount + storePlatformFeeGST
        : order.totalItemsPrice;

      return {
        ...order,
        isDeliverable,
        deliveryChargeAmount,
        deliveryGstRate: highestGstRate,
        deliveryGstAmount,
        storePlatformFeeGST,
        storeGrandTotal,
      };
    });
  }, [storeSubOrders, storeDeliveryCharges]);

  const deliverableStoreOrders = useMemo(() => {
    return validatedStoreOrders.filter(order => order.isDeliverable);
  }, [validatedStoreOrders]);

  const undeliverableStoreOrders = useMemo(() => {
    return validatedStoreOrders.filter(order => !order.isDeliverable);
  }, [validatedStoreOrders]);

  const overallSummary = useMemo(() => {
    let totalSubtotal = 0;
    let totalPlatformFee = 0;
    let totalProductTax = 0;
    let totalDeliveryCharges = 0;
    let totalDeliveryGst = 0;
    let totalPlatformTax = 0;
    let totalGrandTotal = 0;

    deliverableStoreOrders.forEach(storeOrder => {
      totalSubtotal += storeOrder.subtotal;
      totalPlatformFee += storeOrder.totalPlatformFee;
      totalProductTax += storeOrder.totalTax;
      totalDeliveryCharges += storeOrder.deliveryChargeAmount || 0;
      totalDeliveryGst += storeOrder.deliveryGstAmount || 0;
      totalPlatformTax += storeOrder.storePlatformFeeGST;
      totalGrandTotal += storeOrder.storeGrandTotal;
    });

    return {
      totalSubtotal,
      totalPlatformFee,
      totalPlatformTax,
      totalProductTax,
      totalDeliveryCharges,
      totalDeliveryGst,
      totalGrandTotal
    };
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
  }, [addresses, isFetched, startLoading, stopLoading, selectedAddress]);

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

      const cityMatch = storeChargesList.find(
        charge => charge.deliveryArea === "City" && charge.areaName.toLowerCase() === selectedAddress.city.toLowerCase()
      );

      const stateMatch = storeChargesList.find(
        charge => charge.deliveryArea === "State" && charge.areaName.toLowerCase() === selectedAddress.state.toLowerCase()
      );

      const townMatch = storeChargesList.find(
        charge => charge.deliveryArea === "Town" && selectedAddress.landmark && charge.areaName.toLowerCase() === selectedAddress.landmark.toLowerCase()
      );

      if (pincodeMatch) {
        matchedCharge = pincodeMatch.deliveryCharge;
      } else if (cityMatch) {
        matchedCharge = cityMatch.deliveryCharge;
      } else if (stateMatch) {
        matchedCharge = stateMatch.deliveryCharge;
      } else if (townMatch) {
        matchedCharge = townMatch.deliveryCharge;
      }

      charges[storeId] = { charge: matchedCharge };
    });

    setStoreDeliveryCharges(charges);
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
  };

  const handlePlaceSingleStoreOrder = async (storeOrder) => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    if (!storeOrder.isDeliverable) {
      return;
    }

    startLoading("creatingOrder");

    try {
      const storePayload = {
        storeId: storeOrder.storeId,
        products: storeOrder.items.map(item => {
          const p = item.prices;
          return {
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
            finalPrice: Number((p.itemTotal / p.qty).toFixed(2))
          };
        }),
        subtotal: Number(storeOrder.subtotal.toFixed(2)),
        deliveryCharge: {
          amount: Number(storeOrder.deliveryChargeAmount.toFixed(2) || 0),
          gst: {
            rate: storeOrder.deliveryGstRate || 0,
            amount: Number(storeOrder.deliveryGstAmount.toFixed(2) || 0)
          },
          deliverWithInDays: storeOrder.storeDeliverInDays
        },
        platformTax: Number(storeOrder.storePlatformFeeGST.toFixed(2)),
        totalAmount: Number(storeOrder.storeGrandTotal.toFixed(2)),
        addressId: selectedAddress._id
      };

      const result = await addOrder(storePayload);

      if (result.success) {
        storeOrder.items.forEach(item => {
          removeItem(item.productId._id);
        });
      }

    } finally {
      stopLoading();
    }
  };

  if (safeCart.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 pt-24 pb-8 px-4">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-neutral-900 rounded-lg shadow p-8">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Add some items to get started</p>
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

  const { totalSubtotal, totalPlatformFee, totalPlatformTax, totalProductTax, totalDeliveryCharges, totalDeliveryGst, totalGrandTotal } = overallSummary;

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Checkout</h1>
        </div>

        {undeliverableStoreOrders.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-400 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                {undeliverableStoreOrders.length} store{undeliverableStoreOrders.length > 1 ? 's' : ''} cannot deliver to your selected address. These items will be excluded from the final order.
              </p>
            </div>
          </div>
        )}

        {addresses && addresses.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-5 mb-6 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-base font-medium text-gray-900 dark:text-white">Delivery Address</h2>
            </div>
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  onClick={() => handleSelectAddress(address)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedAddress?._id === address._id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-neutral-700 hover:border-blue-400 bg-gray-100 dark:bg-neutral-950"
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

        <div className="space-y-6">
          {deliverableStoreOrders.map((storeOrder) => (
            <div key={storeOrder.storeId} className="bg-white dark:bg-neutral-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-neutral-800">
              <div className="bg-gray-100 dark:bg-neutral-950 px-6 py-3 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Store: {storeOrder.storeName}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Delivery: {storeOrder.deliveryChargeAmount > 0 ? `₹${storeOrder.deliveryChargeAmount.toFixed(2)}` : 'FREE'} (within {storeOrder.storeDeliverInDays} days)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Order Total:</p>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{storeOrder.storeGrandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="overflow-x-auto hide-scrollbar">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-neutral-900">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[140px]">Product</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[80px]">Qty</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[100px]">Base Price</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[100px]">Discount</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[130px]">Price After Discount</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[120px]">Product Charge</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[120px]">Subtotal (Pre-Tax)</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[120px]">Platform Fee</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[110px]">Tax</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[110px]">Item Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                    {storeOrder.items.map((item) => {
                      const p = item.prices;
                      return (
                        <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-neutral-950">
                          <td className="px-6 py-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.productId.title}</p>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 rounded text-xs font-medium text-gray-900 dark:text-white">
                              {p.qty}{item.productId.unit || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <p className="text-sm text-gray-900 dark:text-white">₹{(p.basePrice * p.qty).toFixed(2)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">₹{p.basePrice.toFixed(2)}/{item.productId.unit || "N/A"}</p>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <p className={`text-sm font-medium ${p.discountAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                              {p.discountAmount > 0 ? `-₹${(p.discountAmount * p.qty).toFixed(2)}` : '-'}
                            </p>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <p className="text-sm text-gray-900 dark:text-white">₹{(p.priceAfterDiscount * p.qty).toFixed(2)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">₹{p.priceAfterDiscount.toFixed(2)}/{item.productId.unit || "N/A"}</p>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <p className={`text-sm ${p.productChargeTotal > 0 ? 'text-gray-900 dark:text-white' : 'text-green-600'}`}>
                              {p.productChargeTotal > 0 ? `+₹${p.productChargeTotal.toFixed(2)}` : 'FREE'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">₹{p.productChargePerUnit.toFixed(2)}/{item.productId.unit || "N/A"}</p>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">₹{p.subtotal.toFixed(2)}</p>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <p className="text-sm text-gray-900 dark:text-white">₹{p.platformFeeTotal.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">({p.platformFeeRate}%)</p>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <p className="text-sm text-gray-900 dark:text-white">₹{p.taxTotal.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">({p.taxRate}%)</p>
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

              <div className="px-6 py-4 bg-gray-50 dark:bg-neutral-950 border-t border-gray-200 dark:border-neutral-800">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal (Products)</span>
                    <span className="text-gray-900 dark:text-white font-medium">₹{storeOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Charge</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {storeOrder.deliveryChargeAmount > 0 ? `₹${storeOrder.deliveryChargeAmount.toFixed(2)}` : <span className="text-green-600">FREE</span>}
                    </span>
                  </div>
                  {storeOrder.deliveryGstAmount > 0 && (
                    <div className="flex justify-between text-sm pl-4">
                      <span className="text-gray-500 dark:text-gray-500 text-xs">GST on Delivery ({storeOrder.deliveryGstRate}%)</span>
                      <span className="text-gray-700 dark:text-gray-300 text-xs">₹{storeOrder.deliveryGstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Platform Fee Total</span>
                    <span className="text-gray-900 dark:text-white font-medium">₹{storeOrder.totalPlatformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm pl-4">
                    <span className="text-gray-500 dark:text-gray-500 text-xs">GST on Platform Fee (18%)</span>
                    <span className="text-gray-700 dark:text-gray-300 text-xs">₹{storeOrder.storePlatformFeeGST.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Product Tax/GST</span>
                    <span className="text-gray-900 dark:text-white font-medium">₹{storeOrder.totalTax.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-300 dark:border-neutral-700 flex justify-between">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">Store Grand Total</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{storeOrder.storeGrandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="w-full flex justify-end">
                  <button
                    onClick={() => handlePlaceSingleStoreOrder(storeOrder)}
                    disabled={!selectedAddress}
                    className={`w-40 px-6 py-3 text-base font-bold rounded-lg transition-colors ${!selectedAddress
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                      }`}
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white dark:bg-neutral-900 rounded-lg shadow p-6 border border-gray-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Estimated Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Products Subtotal (All Stores)</span>
              <span className="text-gray-900 dark:text-white font-medium">₹{totalSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Estimated Total Delivery Charges</span>
              <span className="text-gray-900 dark:text-white font-medium">₹{totalDeliveryCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Estimated Total GST/Tax</span>
              <span className="text-gray-900 dark:text-white font-medium">₹{(totalProductTax + totalDeliveryGst + totalPlatformTax).toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t-2 border-gray-200 dark:border-neutral-700 flex justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-white">Total Estimated Payable (All Orders)</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{totalGrandTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
              Note: Each order is placed and paid for separately. This is a total estimate for all deliverable items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;