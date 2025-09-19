import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: {
        type: String,
        trim: true,
    },
    type: {
        type: String,
        enum: ["text", "img", "video", "file"],
        default: "text",
    },
    fileUrl: {
        url: { type: String },
        publicId: { type: String },
    },
    time: {
        type: Date,
        default: Date.now,
    },
    seen: {
        type: Boolean,
        default: false,
    },
    edited: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

chatSchema.index({ sender: 1, receiver: 1, time: -1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
