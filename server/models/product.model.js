import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
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
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            trim: true
        }
    },

    subCategory: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            trim: true
        }
    },

    img: [
        {
            url: {
                type: String,
                required: true
            },
            publicId: {
                type: String,
                required: true
            }
        }
    ],

    video: {
        url: {
            type: String
        },
        publicId: {
            type: String
        }
    },

    price: {
        type: Number,
        required: true
    },

    discount: {
        percentage: {
            type: Number,
            min: 0,
            max: 100,
            default: null
        },
        amount: {
            type: Number,
            min: 0,
            default: null
        }
    },

    stock: {
        type: Number,
        required: true,
        default: 0
    },

    attributes: [
        {
            key: { type: String, required: true },
            value: { type: String, required: true }
        }
    ],

    brand: {
        type: String,
        trim: true
    },

    isAvailable: {
        type: Boolean,
        default: true
    },

    tags: {
        type: [String],
        default: []
    },

    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review',
        }
    ],

    variants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;