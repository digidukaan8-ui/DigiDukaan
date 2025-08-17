import Category from "../models/category.model";
import Store from "../models/store.model";
import User from "../models/user.model";

const handleCreateStore = async (req, res, next) => {
    try {
        const { userId, name, description, storeType, addresses } = req.body;

        if (!userId || !name || !description || !storeType || storeType.length === 0 || !addresses || addresses.length === 0) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (typeof userId !== "string" || typeof name !== "string" || typeof description !== "string") {
            return res.status(400).json({ success: false, message: "Invalid input format" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (!Array.isArray(storeType)) {
            return res.status(400).json({ success: false, message: "storeType must be an array" });
        }

        if (!Array.isArray(addresses)) {
            return res.status(400).json({ success: false, message: "addresses must be an array" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        return next();
    } catch (error) {
        console.error("Error in createStore middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const handleAddCategory = async (req, res, next) => {
    try {
        const { storeId, name, slug } = req.body;
        if (!storeId || !name || !slug) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (typeof (storeId) !== 'string' || typeof (name) !== 'string' || typeof (slug) !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid Input Format' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(400).json({ success: false, message: 'Store not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        return next();
    } catch (error) {
        console.error("Error in addCategory middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const handleAddSubCategory = async (req, res, next) => {
    try {
        const { categoryId, name, slug } = req.body;

        if (!categoryId || !name || !slug) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (typeof (categoryId) !== 'string' || typeof (name) !== 'string' || typeof (slug) !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid Input Format' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        return next();
    } catch (error) {
        console.error("Error in addSubCategory middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export { handleCreateStore, handleAddCategory, handleAddSubCategory };