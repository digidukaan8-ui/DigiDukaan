import mongoose from "mongoose";

const deliveryZoneSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },
    level: {
        type: String,
        enum: ["locality", "pincode", "suburb", "city", "district", "state", "country"],
        required: true
    },
    values: {
        type: [String],
        required: true,
        validate: {
            validator: (arr) => arr.length > 0,
            message: "At least one location must be specified"
        }
    }
}, { timestamps: true });

export default mongoose.model("DeliveryZone", deliveryZoneSchema);