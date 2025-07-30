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
    images: {
        type: String,
        trim: true
    },
    videos: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
