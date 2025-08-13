import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    images: {
        type: [String],
        validate: {
            validator: function (val) {
                return val.length >= 1 && val.length <= 4;
            },
            message: 'You must provide between 1 and 4 images.'
        },
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    mrp: {
        type: Number
    },
    discount: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        trim: true
    },
    size: {
        type: String,
        trim: true
    },
    weight: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: false
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