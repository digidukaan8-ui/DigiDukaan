import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  name: {
    type: String,
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
  image: {
    type: String,
    default: null
  },
  subCategories: [
    {
      name: {
        type: String,
        required: true,
        trim: true
      },
      slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
      },
      img: {
        url: String,
        publicId: String
      },
    }
  ]
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;