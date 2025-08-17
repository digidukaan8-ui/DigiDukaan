import mongoose from "mongoose";

const usedProductSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },

  description: {
    type: String,
    required: true,
    trim: true
  },

  category: {
    type: String,
    required: true,
    trim: true
  },

  subCategory: {
    type: String,
    trim: true
  },

  condition: {
    type: String,
    enum: ["new", "like new", "used", "refurbished"],
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  isNegotiable: {
    type: Boolean,
    default: false
  },

  img: [
    {
      url: { type: String, required: true },
      publicId: { type: String, required: true }
    }
  ],

  video: {
    url: { type: String },
    publicId: { type: String }
  },

  brand: {
    type: String,
    trim: true
  },

  attributes: [
    {
      key: { type: String, required: true },   
      value: { type: String, required: true } 
    }
  ],

  billAvailable: {
    type: Boolean,
    default: false
  },

  isSold: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const UsedProduct = mongoose.model("UsedProduct", usedProductSchema);

export default UsedProduct;