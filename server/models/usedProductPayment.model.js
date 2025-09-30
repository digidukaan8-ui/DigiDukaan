import mongoose from 'mongoose';

const usedProductPaymentSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UsedProduct',
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },
    paymentMethod: {
        type: String,
        default: 'OTHER'
    }
}, { timestamps: true });

const UsedProductPayment = mongoose.model('UsedProductPayment', usedProductPaymentSchema);

export default UsedProductPayment;