import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: '10m' }
    }
}, { timestamps: true });

const OTP = mongoose.model('OTP', OTPSchema);

export default OTP;
