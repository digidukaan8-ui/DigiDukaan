import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            priceDistribution: {
                basePrice: { type: Number, required: true, min: 0 },
                discount: { type: Number, default: 0, min: 0 },
                productCharge: { type: Number, default: 0, min: 0 },
                platformFee: {
                    rate: { type: Number, required: true, default: 0 },
                    amount: { type: Number, required: true, default: 0 }
                },
                tax: {
                    rate: { type: Number, required: true, default: 0 },
                    amount: { type: Number, required: true, default: 0 }
                }
            },
            finalPrice: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    deliveryCharges: [
        {
            storeId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Store",
                required: true
            },
            amount: { type: Number, required: true, min: 0 },
            gst: {
                rate: { type: Number, required: true, default: 0 },
                amount: { type: Number, required: true, default: 0 }
            }
        }
    ],
    platformTax: {
        type: Number,
        default: 0,
        min: 0
    },
    storeTax: [
        {
            storeId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Store",
                required: true
            },
            amount: { type: Number, required: true, min: 0 },
            gst: {
                rate: { type: Number, required: true, default: 0 },
                amount: { type: Number, required: true, default: 0 }
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"],
        default: "PENDING"
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
        default: "PENDING"
    },
    paymentId: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["CARD", "UPI", "NETBANKING", "WALLET", "OTHER"],
        default: "OTHER"
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;