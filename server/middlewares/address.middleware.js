const handleAddAddress = async (req, res, next) => {
    try {
        let { name, mobile, addressType, landmark, addressLine1, addressLine2, city, state, pincode } = req.body;

        if (!name || !mobile || !addressType || !addressLine1 || !city || !state || !pincode) {
            return res.status(400).json({ success: false, message: 'Incomplete fields' });
        }

        if (typeof name !== 'string' || typeof mobile !== 'string' || typeof addressType !== 'string' || typeof addressLine1 !== 'string' || typeof addressLine2 !== 'string' || typeof city !== 'string' || typeof state !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid input format' });
        }

        if (landmark && typeof landmark !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid input format' });
        }

        const mobileRegex = /^(\+91)?[0-9]{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({ success: false, message: 'Invalid mobile number' });
        }

        pincode = Number(pincode);
        if (isNaN(pincode)) {
            return res.status(400).json({ success: false, message: 'Invalid input format' });
        }

        next();
    } catch (error) {
        console.error("Error in add address middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const handleUpdateAddress = async (req, res, next) => {
    try {
        let { name, mobile, addressType, landmark, addressLine1, addressLine2, city, state, pincode } = req.body;
        const { addressId } = req.params;

        if (!addressId || !name || !mobile || !addressType || !addressLine1 || !city || !state || !pincode) {
            return res.status(400).json({ success: false, message: 'Incomplete fields' });
        }

        if (typeof addressId !== 'string' || typeof name !== 'string' || typeof mobile !== 'string' || typeof addressType !== 'string' || typeof addressLine1 !== 'string' || typeof addressLine2 !== 'string' || typeof city !== 'string' || typeof state !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid input format' });
        }

        if (landmark && typeof landmark !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid input format' });
        }

        const mobileRegex = /^(\+91)?[0-9]{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({ success: false, message: 'Invalid mobile number' });
        }

        pincode = Number(pincode);
        if (isNaN(pincode)) {
            return res.status(400).json({ success: false, message: 'Invalid input format' });
        }

        next();
    } catch (error) {
        console.error("Error in update address middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { handleAddAddress, handleUpdateAddress }