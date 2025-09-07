import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 20,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
        },
        message: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 1000,
        },
    },
    { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
