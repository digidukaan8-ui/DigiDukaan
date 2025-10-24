import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Store from "../models/store.model.js";
import Address from "../models/address.model.js";
import Cart from "../models/cart.model.js";
import { getPlatformCharge, getTax } from "../utils/category.util.js";

const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg/orders";

const addOrder = async (req, res) => {
    try {
        const { storeId, products, subtotal, deliveryCharge, platformTax, totalAmount, addressId } = req.body;
        const userId = req.user._id;

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: `Store not found with ID: ${storeId}`
            });
        }

        const validatedProducts = [];
        let calculatedSubtotal = 0;
        let calculatedTotalPlatformFee = 0;
        let calculatedTotalTax = 0;

        for (let pro of products) {
            const product = await Product.findById(pro.productId).populate('subCategory');
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found with ID: ${pro.productId}`
                });
            }

            const available = product.stock - pro.quantity;
            if (available < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: ${product.title}. Available: ${product.stock}, Requested: ${pro.quantity}`
                });
            }

            const basePrice = product.price;
            const qty = pro.quantity;
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

            const productChargePerUnit = product.deliveryCharge || 0;
            const priceWithProductCharge = priceAfterDiscount + productChargePerUnit;
            const productChargeTotal = productChargePerUnit * qty;

            const taxRate = getTax(product.subCategory?.name, 100);
            const taxPerUnit = (priceWithProductCharge * taxRate) / 100;
            const taxTotal = taxPerUnit * qty;

            const itemSubtotal = (priceAfterDiscount + productChargePerUnit) * qty;
            const itemTotal = itemSubtotal + platformFeeTotal + taxTotal;

            calculatedSubtotal += itemSubtotal;
            calculatedTotalPlatformFee += platformFeeTotal;
            calculatedTotalTax += taxTotal;

            validatedProducts.push({
                productId: pro.productId,
                quantity: qty,
                priceDistribution: {
                    basePrice: Number(basePrice.toFixed(2)),
                    discount: Number(discountAmount.toFixed(2)),
                    productCharge: Number(productChargePerUnit.toFixed(2)),
                    platformFee: {
                        rate: platformFeeRate,
                        amount: Number(platformFeePerUnit.toFixed(2))
                    },
                    tax: {
                        rate: taxRate,
                        amount: Number(taxPerUnit.toFixed(2))
                    }
                },
                finalPrice: Number((itemTotal / qty).toFixed(2))
            });
        }

        const deliveryChargeAmount = deliveryCharge?.amount || 0;
        const deliveryGstRate = deliveryCharge?.gst?.rate || 0;
        const deliveryGstAmount = deliveryChargeAmount ? (deliveryChargeAmount * deliveryGstRate) / 100 : 0;

        const storePlatformFeeGST = calculatedTotalPlatformFee * 0.18;

        const calculatedTotalAmount = calculatedSubtotal + calculatedTotalPlatformFee + calculatedTotalTax + deliveryChargeAmount + deliveryGstAmount + storePlatformFeeGST;

        const toleranceAmount = 1;
        if (Math.abs(calculatedTotalAmount - totalAmount) > toleranceAmount) {
            return res.status(400).json({
                success: false,
                message: 'Amount mismatch detected',
                calculated: Number(calculatedTotalAmount.toFixed(2)),
                received: totalAmount
            });
        }

        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        const orderId = `order_${Date.now()}_${userId}`;

        const cfPayload = {
            order_id: orderId,
            order_amount: totalAmount,
            order_currency: "INR",
            customer_details: {
                customer_id: userId.toString(),
                customer_name: req.user.name || "Unknown",
                customer_email: req.user.email || "noemail@example.com",
                customer_phone: req.user.phone || "1234567890",
            },
            order_meta: {
                return_url: `${process.env.CORS_ORIGIN}/buyer/order?orderId={order_id}`
            }
        };

        const cfResponse = await fetch(CASHFREE_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-client-id": process.env.CASHFREE_APP_ID,
                "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                "x-api-version": "2022-09-01"
            },
            body: JSON.stringify(cfPayload)
        });

        const cashfreeData = await cfResponse.json();

        if (!cfResponse.ok) {
            console.error("Cashfree order creation error: ", cashfreeData);
            return res.status(400).json({
                success: false,
                message: cashfreeData.message || "Failed to create payment order"
            });
        }

        const newOrder = await Order.create({
            userId: userId,
            storeId: storeId,
            products: validatedProducts,
            subtotal: Number(calculatedSubtotal.toFixed(2)),
            deliveryCharge: {
                amount: Number(deliveryChargeAmount.toFixed(2)),
                gst: {
                    rate: deliveryGstRate,
                    amount: Number(deliveryGstAmount.toFixed(2))
                },
                deliverWithInDays: deliveryCharge?.deliverWithInDays || 3
            },
            platformTax: Number(storePlatformFeeGST.toFixed(2)),
            totalAmount: Number(totalAmount.toFixed(2)),
            addressId: addressId,
            status: "PENDING",
            paymentStatus: "PENDING",
            paymentId: orderId,
            paymentMethod: "OTHER"
        });

        return res.status(201).json({
            success: true,
            message: 'Order created successfully. Proceed to payment.',
            data: {
                order: newOrder,
                payment_session_id: cashfreeData.payment_session_id,
                order_id: orderId
            }
        });

    } catch (error) {
        console.error("Error in add order controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const verifyOrderPayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId || typeof orderId !== 'string') {
            return res.status(400).json({ success: false, message: "Missing or invalid orderId" });
        }

        const cfResponse = await fetch(
            `${CASHFREE_BASE_URL}/${orderId}`,
            {
                method: "GET",
                headers: {
                    "x-client-id": process.env.CASHFREE_APP_ID,
                    "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                    "x-api-version": "2022-09-01",
                    "Content-Type": "application/json",
                },
            }
        );

        const cfData = await cfResponse.json();

        if (!cfResponse.ok) {
            console.error("Cashfree verification error: ", cfData);
            return res.status(400).json({
                success: false,
                message: cfData.message || "Failed to fetch order status from Cashfree",
                cfData
            });
        }

        const userId = req.user._id;

        const order = await Order.findOne({ paymentId: orderId })
            .populate('storeId', 'name')
            .populate('addressId');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found in database for verification" });
        }

        const cfOrderStatus = cfData.order_status;
        let updateData = {};
        let responseMessage = `Payment status: ${cfOrderStatus}`;
        let successStatus = false;

        if (cfOrderStatus === "PAID") {
            updateData = {
                paymentStatus: "SUCCESS",
                status: "CONFIRMED",
                paymentMethod: cfData.payment_mode || "OTHER",
                cfOrderId: cfData.cf_order_id,
            };
            responseMessage = "Payment Confirmed and Order Confirmed";
            successStatus = true;

            if (order.status !== "CONFIRMED") {
                const productUpdates = order.products.map(item =>
                    Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
                );

                const productIdsToRemove = order.products.map(item => item.productId);
                const cartRemoval = Cart.deleteMany({
                    userId: userId,
                    productId: { $in: productIdsToRemove }
                });

                await Promise.all([...productUpdates, cartRemoval]);
            }

        } else if (cfOrderStatus === "ACTIVE" || cfOrderStatus === "PENDING") {
            updateData = {
                paymentStatus: "PENDING",
                status: "PENDING"
            };

        } else {
            let paymentStatus = "FAILED";
            if (cfOrderStatus === "REFUNDED") paymentStatus = "REFUNDED";

            updateData = {
                paymentStatus: paymentStatus,
                status: "CANCELLED"
            };
            responseMessage = `Payment ${cfOrderStatus}. Order Cancelled.`;
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { paymentId: orderId },
            updateData,
            { new: true }
        ).populate('storeId', 'name').populate('addressId').populate({ path: "products.productId", select: "title unit img", });

        return res.json({
            success: successStatus,
            message: responseMessage,
            data: {
                ...updatedOrder.toObject(),
                storeName: updatedOrder.storeId?.name,
                address: updatedOrder.addressId
            },
            cfData,
        });

    } catch (error) {
        console.error("Error verifying order payment controller: ", error);
        return res.status(500).json({ success: false, message: "Server error during order verification" });
    }
};

const getOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        let orders = await Order.find({ userId })
            .populate({ path: "storeId", select: "name" })
            .populate({ path: "products.productId", select: "title unit img" })
            .populate({ path: "addressId" })
            .sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            const userStore = await Store.findOne({ userId });

            if (userStore) {
                orders = await Order.find({ storeId: userStore._id })
                    .populate({ path: "storeId", select: "name" })
                    .populate({ path: "products.productId", select: "title unit img" })
                    .populate({ path: "addressId" })
                    .sort({ createdAt: -1 });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            data: orders || []
        });
    } catch (error) {
        console.error("Error get orders controller:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during fetching orders"
        });
    }
};

const getOrdersCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const count = await Order.countDocuments({ userId });

        return res.status(200).json({ success: true, message: 'Order count fetched successfully', count });
    } catch (error) {
        console.error('Error in Get Orders Count controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({ success: false, message: 'Order ID is required.' });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        if (order.status === "DELIVERED" || order.status === "CANCELLED" || order.status === "RETURNED") {
            return res.status(400).json({ success: false, message: `Cannot cancel an order with status: ${order.status}.` });
        }

        if (order.paymentStatus === "SUCCESS" || order.paymentStatus === "PAID") {
            const stockUpdates = order.products.map(item =>
                Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: item.quantity } }
                )
            );
            await Promise.all(stockUpdates);
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                status: "CANCELLED",
            },
            { new: true }
        )
            .populate({ path: "storeId", select: "name" })
            .populate({ path: "products.productId", select: "title unit img" })
            .populate({ path: "addressId" });

        return res.status(200).json({
            success: true,
            message: 'Order cancelled and stock refunded successfully.',
            data: updatedOrder
        });

    } catch (error) {
        console.error("Error cancel order controller:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during cancel order"
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({ success: false, message: 'Order id is required' });
        }

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            {
                new: true,
                runValidators: true
            }
        )
            .populate({ path: "storeId", select: "name" })
            .populate({ path: "products.productId", select: "title unit img" })
            .populate({ path: "addressId" })
            .sort({ createdAt: -1 });

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });

    } catch (error) {
        console.error("Error update order status controller:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during update order status"
        });
    }
};

export { addOrder, verifyOrderPayment, getOrders, getOrdersCount, cancelOrder, updateOrderStatus };