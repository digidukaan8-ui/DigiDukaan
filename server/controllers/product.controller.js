import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.config.js";

const addProduct = async (req, res) => {
    try {
        const { storeId, title, description, category, subCategory, price, stock, brand, } = req.body;
        const attributes = req.body.attributes;
        const tags = req.body.tags;
        const discount = req.body.discount;

        const imgFiles = req.files.img || [];
        const uploadedImages = [];

        for (let file of imgFiles) {
            const result = await uploadToCloudinary(file.path);
            if (result) {
                uploadedImages.push({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            } else {
                return res.status(501).json({ success: false, message: 'Failed to upload image' });
            }
        }

        let videoData = null;
        if (req.files.video && req.files.video[0]) {
            const result = await uploadToCloudinary(req.files.video[0].path, 'video');
            if (result) {
                videoData = {
                    url: result.secure_url,
                    publicId: result.public_id
                };
            } else {
                return res.status(501).json({ success: false, message: 'Failed to upload video' });
            }
        }

        const product = new Product({
            storeId,
            title,
            slug: title.toLowerCase().replace(/\s+/g, '-'),
            description,
            category: { name: category, slug: category.toLowerCase().replace(/\s+/g, '-') },
            subCategory: { name: subCategory, slug: subCategory.toLowerCase().replace(/\s+/g, '-') },
            img: uploadedImages,
            video: videoData,
            price,
            discount,
            stock,
            attributes,
            brand,
            tags
        });

        await product.save();

        return res.status(201).json({ success: true, data: product });
    } catch (error) {
        console.error('Error in Add Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getProduct = async (req, res) => {
    try {
        const { storeId } = req.params;

        const storeExist = await Store.findById(storeId);
        if (!storeExist) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const products = await Product.find({ storeId });
        if (products.length === 0) {
            return res.status(200).json({ success: true, message: 'No products found for this store', data: [] });
        }

        return res.status(200).json({ success: true, message: 'Product fetched successfully', data: products });
    } catch (error) {
        console.error('Error in Get Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export { addProduct, getProduct };