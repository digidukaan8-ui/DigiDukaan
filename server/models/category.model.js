import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  img: {
    url: String,
    publicId: String
  },
  subCategories: [
    {
      type: {
        name: {
          type: String,
          required: true,
          trim: true,
          unique:true
        },
        slug: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
          unique:true
        },
        img: {
          url: String,
          publicId: String,
        },
      },
      default: [],
    }
  ]
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;