import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        trim: true
    },
    img: {
        url: { type: String },
        publicId: { type: String },
        title: { type: String }
    },
    videos: {
        url: { type: String },
        publicId: { type: String },
        title: { type: String }
    }
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;