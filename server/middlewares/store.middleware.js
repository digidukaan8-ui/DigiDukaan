import User from "../models/user.model.js";

const handleCreateStore = async (req, res, next) => {
    try {
        const { userId, name, description, category, addresses } = req.body;

        if (!userId || !name || !description || !category || category.length === 0 || !addresses || addresses.length === 0) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (typeof userId !== "string" || typeof name !== "string" || typeof description !== "string") {
            return res.status(400).json({ success: false, message: "Invalid input format" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (!Array.isArray(category)) {
            return res.status(400).json({ success: false, message: "category must be an array" });
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

export { handleCreateStore };