import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  storeName: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  storeType: {
    type: String,
    trim: true,
  },
  addresses: {
    type: [
      {
        addressLine1: {
          type: String,
          required: true,
          trim: true,
        },
        city: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
        },
        pincode: {
          type: String,
          required: true,
          trim: true,
        }
      }
    ],
    default: [],
  }
}, { timestamps: true });

export default mongoose.model("Store", storeSchema);