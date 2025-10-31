import UsedProductPayment from "../models/usedProductPayment.model.js";
import User from "../models/user.model.js";
import Store from "../models/store.model.js";
import UsedProduct from "../models/usedProduct.model.js";
import { getPriceForUsedProduct } from "../utils/category.util.js";
import Order from '../models/order.model.js';
import Withdrawal  from '../models/withdrawal.model.js';
import mongoose from 'mongoose';

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

const calculateSellerIncome = async (storeIdParam) => {
    const sellerId = new mongoose.Types.ObjectId(storeIdParam);

    const salesAggregation = await Order.aggregate([
        { $match: { 
            storeId: sellerId, 
            status: { $in: ["DELIVERED"] },
            paymentStatus: "SUCCESS"
        }},
        
        { $unwind: '$products' },
        { $group: {
            _id: '$_id',
            orderTotalAmount: { $first: '$totalAmount' },
            orderPlatformTax: { $first: '$platformTax' },
            orderDeliveryCharge: { $first: '$deliveryCharge.amount' },
            
            totalProductRevenue: { $sum: { $multiply: ['$products.finalPrice', '$products.quantity'] } },
            totalProductsSold: { $sum: '$products.quantity' },
            totalProductPlatformFee: { $sum: { $multiply: ['$products.priceDistribution.platformFee.amount', '$products.quantity'] } },
            totalProductTax: { $sum: { $multiply: ['$products.priceDistribution.tax.amount', '$products.quantity'] } },
        }},

        { $group: {
            _id: null,
            totalRevenue: { $sum: '$totalProductRevenue' },
            totalProductsSold: { $sum: '$totalProductsSold' },
            totalPlatformFee: { $sum: '$totalProductPlatformFee' },
            totalProductTax: { $sum: '$totalProductTax' },
            
            totalDeliveryCharge: { $sum: '$orderDeliveryCharge' },
            totalOrderLevelTax: { $sum: '$orderPlatformTax' }
        }},
        { $project: {
            _id: 0,
            totalRevenue: 1, 
            totalProductsSold: 1,
            totalPlatformFee: 1,
            totalProductTax: 1,
            totalDeliveryCharge: 1,
            totalOrderLevelTax: 1
        }}
    ]);
    
    const salesData = salesAggregation[0] || {
        totalRevenue: 0,
        totalProductsSold: 0,
        totalPlatformFee: 0,
        totalProductTax: 0,
        totalDeliveryCharge: 0,
        totalOrderLevelTax: 0
    };

    const withdrawnAggregation = await Withdrawal.aggregate([
        { $match: { sellerId: sellerId, status: 'COMPLETED' } },
        { $group: { _id: null, totalWithdrawn: { $sum: '$amount' } } }
    ]);
    
    const totalWithdrawn = withdrawnAggregation[0]?.totalWithdrawn || 0;

    const totalIncomeBeforeWithdrawal = salesData.totalRevenue + salesData.totalDeliveryCharge - salesData.totalPlatformFee;
    
    const netIncome = totalIncomeBeforeWithdrawal;
    const availableBalance = netIncome - totalWithdrawn;

    const monthlyEarnings = await Order.aggregate([
        { $match: { 
            storeId: sellerId, 
            status: { $in: ["DELIVERED"] },
            paymentStatus: "SUCCESS"
        }},
        { $group: {
            _id: {
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' }
            },
            totalSales: { $sum: '$totalAmount' },
            totalFees: { $sum: '$platformTax' },
            orderCount: { $sum: 1 }
        }},
        { $project: {
            _id: 0,
            monthYear: { $concat: [ { $toString: '$_id.month' }, '/', { $toString: '$_id.year' } ] },
            netEarning: { $subtract: ['$totalSales', '$totalFees'] },
            orders: '$orderCount',
            month: '$_id.month',
            year: '$_id.year'
        }},
        { $sort: { year: -1, month: -1 } }
    ]);

    return {
        summary: {
            totalRevenue: salesData.totalRevenue + salesData.totalDeliveryCharge,
            totalProductsSold: salesData.totalProductsSold,
            totalPlatformFee: salesData.totalPlatformFee,
            totalProductTax: salesData.totalProductTax,
            netIncome: netIncome,
            totalWithdrawn: totalWithdrawn,
            availableBalance: availableBalance,
            totalGST: salesData.totalOrderLevelTax
        },
        monthlyEarnings: monthlyEarnings
    };
};

const getSellerIncomeSummary = async (req, res) => {
    try {
        const storeId = req.params.storeId || req.query.storeId; 

        if (!storeId) {
            return res.status(400).json({ success: false, message: "Store ID is required." });
        }
        
        const data = await calculateSellerIncome(storeId);

        res.status(200).json({ success: true, data: data });

    } catch (error) {
        console.error("Seller income fetch error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching income data." });
    }
};

const requestWithdrawal = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { amount } = req.body;

        if (!storeId) {
            return res.status(400).json({ success: false, message: "Store ID is required for withdrawal." });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid withdrawal amount." });
        }
        
        const summaryData = await calculateSellerIncome(storeId);
        
        const availableBalance = summaryData?.summary?.availableBalance; 
        
        if (typeof availableBalance === 'undefined' || availableBalance === null) {
             console.error("Available balance calculation failed. Raw response:", summaryData);
             return res.status(500).json({ success: false, message: "Failed to calculate current balance. Please try again." });
        }
        
        if (amount > availableBalance) {
            return res.status(400).json({ success: false, message: `Requested amount exceeds available balance (₹${availableBalance.toFixed(2)}).` });
        }

        const withdrawal = await Withdrawal.create({
            sellerId: new mongoose.Types.ObjectId(storeId),
            amount: amount,
            payoutMethod: 'Bank Transfer'
        });

        res.status(201).json({ 
            success: true, 
            message: "Withdrawal request submitted successfully. Awaiting admin approval.",
            data: withdrawal
        });

    } catch (error) {
        console.error("Withdrawal request error:", error);
        res.status(500).json({ success: false, message: "Server error during withdrawal request." });
    }
};

export { createOrder, verifyOrder, getSellerIncomeSummary, requestWithdrawal };