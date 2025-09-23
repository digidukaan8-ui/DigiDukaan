import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
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

messageSchema.index({ chatId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;