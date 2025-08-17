import Store from '../models/store.model.js';
import Category from '../models/category.model.js';
import uploadToCloudinary from '../utils/cloudinary.config.js';

const createStore = async (req, res) => {
    try {
        const { userId, name, description, storeType, addresses } = req.body;

        let imgData = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.path);
            if (result) {
                imgData = {
                    url: result.secure_url,
                    publicId: result.public_id
                };
            } else {
                return res.status(501).json({ success: false, message: 'Failed to upload Image' });
            }
        }

        const store = new Store({
            userId,
            name,
            description,
            storeType,
            addresses,
            img: imgData
        });

        await store.save();

        return res.status(201).json({ success: true, data: store });
    } catch (error) {
        console.error('Error in createStore controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const addCategory = async (req, res) => {
    try {
        const { storeId, name, slug } = req.body;

        let imgData = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.path);
            if (result) {
                imgData = {
                    url: result.secure_url,
                    publicId: result.public_id
                };
            } else {
                return res.status(501).json({ success: false, message: 'Failed to upload Image' });
            }
        }

        const formattedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
        const category = new Category({
            storeId,
            name,
            slug: formattedSlug,
            img: imgData,
            subCategories: []
        });

        await category.save();

        return res.status(201).json({ success: true, message: 'Category added successfully', data: category })
    } catch (error) {
        console.error('Error in addCategory controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const addSubCategory = async (req, res) => {
    try {
        const { categoryId, name, slug } = req.body;

        let imgData = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.path);
            if (result) {
                imgData = {
                    url: result.secure_url,
                    publicId: result.public_id
                };
            } else {
                return res.status(501).json({ success: false, message: 'Failed to upload Image' });
            }
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({ success: false, message: 'Category not found' });
        }

        category.subCategories.push({
            name,
            slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
            img: imgData
        });
        await category.save();

        return res.status(201).json({ success: true, message: 'SubCategory added successfully', data: category })
    } catch (error) {
        console.error('Error in addSubCategory controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export { createStore, addCategory, addSubCategory };