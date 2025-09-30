import UsedProductPayment from "../models/usedProductPayment.model.js";
import User from "../models/user.model.js";
import Store from "../models/store.model.js";
import UsedProduct from "../models/usedProduct.model.js";
import { getPriceForUsedProduct } from "../utils/category.util.js";

const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg/orders";

const createOrder = async (req, res) => {
    try {
        const { storeId, productId } = req.body;
        const userId = req.user._id;

        if (!storeId || !productId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (typeof storeId !== 'string' || typeof productId !== 'string') {
            return res.status(400).json({ success: false, message: "Invalid input format" });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ success: false, message: "Store not found" });
        }

        const product = await UsedProduct.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const amount = getPriceForUsedProduct(product.category?.name, product.subCategory?.name);
        if (!amount) {
            return res.status(400).json({ success: false, message: "Invalid product category or subcategory" });
        }

        const orderId = `usedprod_${Date.now()}`;
        const user = await User.findById(userId);

        const cfPayload = {
            order_id: orderId,
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
                customer_id: userId.toString(),
                customer_name: user.name || "Unknown",
                customer_email: user.email || "noemail@example.com",
                customer_phone: user.phone || "1234567890",
            },
            order_meta: {
                return_url: `${process.env.CORS_ORIGIN}/used-product?productId=${productId}&orderId=${orderId}`
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

        const data = await cfResponse.json();

        if (!cfResponse.ok) {
            console.error("Cashfree order create error:", data);
            return res.status(400).json({ success: false, message: data.message || "Failed to create order" });
        }

        await UsedProductPayment.create({
            storeId,
            productId,
            paymentId: orderId,
            amount,
            paymentStatus: "PENDING",
            paymentMethod: "OTHER"
        });

        return res.status(200).json({
            success: true,
            message: "Order created successfully",
            data: {
                payment_session_id: data.payment_session_id,
                order_id: orderId,
            }
        });
    } catch (error) {
        console.error("Error in creating order controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const verifyOrder = async (req, res) => {
    try {
        const { orderId, productId } = req.body;

        if (!orderId || !productId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (typeof orderId !== 'string' || typeof productId !== 'string') {
            return res.status(400).json({ success: false, message: "Invalid input format" });
        }

        const response = await fetch(
            `https://sandbox.cashfree.com/pg/orders/${orderId}`,
            {
                method: "GET",
                headers: {
                    "x-client-id": process.env.CASHFREE_APP_ID,
                    "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                    "x-api-version": "2022-09-01",
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res
                .status(400)
                .json({ success: false, message: data.message, data });
        }

        if (data.order_status === "PAID") {
            await UsedProductPayment.findOneAndUpdate(
                { paymentId: orderId },
                {
                    paymentStatus: "SUCCESS",
                    paymentMethod: data.payment_mode 
                }
            );
            const product = await UsedProduct.findByIdAndUpdate(productId, { paid: true });
            return res.json({
                success: true,
                message: "Payment Confirmed",
                data,
                product,
            });
        }

        return res.json({ success: false, message: 'Payment not done', data });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export { createOrder, verifyOrder };