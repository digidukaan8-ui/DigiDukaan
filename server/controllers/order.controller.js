import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Store from "../models/store.model.js";
import Address from "../models/address.model.js";
import { getPlatformCharge, getTax } from "../utils/category.util.js";

const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg/orders";

const addOrder = async (req, res) => {
    try {
        const { products, subtotal, deliveryCharges, totalAmount, addressId, storeTax } = req.body;
        const userId = req.user._id;

        const validatedProducts = [];

        for (let pro of products) {
            const product = await Product.findById(pro.productId);
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

            const subCat = product.subCategory?.name || "";
            const basePrice = product.price;

            const platformFeeRate = getPlatformCharge(subCat, basePrice);
            const platformFeeAmount = (basePrice * platformFeeRate) / 100;

            const taxRate = getTax(subCat, basePrice);
            const taxAmount = (basePrice * taxRate) / 100;

            const finalPrice = basePrice + platformFeeAmount + taxAmount - (pro.priceDistribution?.discount || 0) + (pro.priceDistribution?.productCharge || 0);

            validatedProducts.push({
                productId: pro.productId,
                quantity: pro.quantity,
                priceDistribution: {
                    basePrice: basePrice,
                    discount: pro.priceDistribution?.discount || 0,
                    productCharge: pro.priceDistribution?.productCharge || 0,
                    platformFee: {
                        rate: platformFeeRate,
                        amount: platformFeeAmount
                    },
                    tax: {
                        rate: taxRate,
                        amount: taxAmount
                    },
                    total: finalPrice * pro.quantity
                },
                finalPrice: finalPrice
            });
        }

        const validatedDeliveryCharges = [];
        for (let charge of deliveryCharges) {
            const store = await Store.findById(charge.storeId);
            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: `Store not found with ID: ${charge.storeId}`
                });
            }

            validatedDeliveryCharges.push({
                storeId: charge.storeId,
                amount: charge.amount,
                gst: charge.gst
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
                return_url: `${process.env.CORS_ORIGIN}/buyer/order?orderId=${orderId}`
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
            return res.status(400).json({
                success: false,
                message: cashfreeData.message || "Failed to create payment order"
            });
        }

        const newOrder = await Order.create({
            userId: userId,
            products: validatedProducts,
            subtotal: subtotal,
            deliveryCharges: validatedDeliveryCharges,
            totalAmount: totalAmount,
            addressId: addressId,
            storeTax: storeTax,
            status: "PENDING",
            paymentStatus: "PENDING",
            paymentId: orderId,
            paymentMethod: "OTHER"
        });

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
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
            `${CASHFREE_BASE_URL}/pg/orders/${orderId}`, 
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

        const order = await Order.findOne({ paymentId: orderId });

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
                status: "PLACED",
                paymentMethod: cfData.payment_mode || "OTHER",
                cfOrderId: cfData.cf_order_id,
            };
            responseMessage = "Payment Confirmed and Order Placed";
            successStatus = true;

            if (order.status !== "PLACED") {
                for (const item of order.products) {
                    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
                }
            }

        } else if (cfOrderStatus === "ACTIVE" || cfOrderStatus === "PENDING") {
            updateData = {
                paymentStatus: "PENDING",
                status: "PENDING"
            };

        } else { 
            updateData = {
                paymentStatus: cfOrderStatus,
                status: "CANCELLED"
            };
        }
        
        const updatedOrder = await Order.findOneAndUpdate(
            { paymentId: orderId },
            updateData,
            { new: true }
        );

        return res.json({
            success: successStatus,
            message: responseMessage,
            data: updatedOrder,
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

        const orders = await Order.find({ userId });

        return res.status(200).json({ success: true, message: 'Orders fetched successfully', data: orders });
    } catch (error) {
        console.error("Error get orders controller: ", error);
        return res.status(500).json({ success: false, message: "Server error during order verification" });
    }
}

export { addOrder, verifyOrderPayment, getOrders };