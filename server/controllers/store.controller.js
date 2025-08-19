import Store from '../models/store.model.js';
import uploadToCloudinary from '../utils/cloudinary.config.js';

const createStore = async (req, res) => {
    try {
        const { userId, name, description, category, addresses } = req.body;

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
            category,
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

export { createStore };