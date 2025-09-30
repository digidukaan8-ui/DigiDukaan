import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    avatar: {
        url: String,
        publicId: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ['buyer', 'seller', 'admin'],
        trim: true,
        default: 'buyer'
    },
    refreshToken: {
        type: String,
        default: null
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;