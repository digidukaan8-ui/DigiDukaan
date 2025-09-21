import Address from "../models/address.model.js";

const addAddress = async (req, res) => {
    try {
        const { name, mobile, addressType, landmark, addressLine1, addressLine2, city, state, pincode } = req.body;
        const userId = req.user._id;

        const data = await Address.create({
            userId,
            name,
            mobile,
            addressType,
            landmark,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
        });

        return res.status(201).json({ success: true, message: 'Address added successfully', data });
    } catch (error) {
        console.error("Error in add address controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const updateAddress = async (req, res) => {
    try {
        const { name, mobile, addressType, landmark, addressLine1, addressLine2, city, state, pincode } = req.body;
        const { addressId } = req.params;

        const addressExists = await Address.findById(addressId);
        if (!addressExists) {
            return res.status(404).json({ sucess: false, message: 'Address not found' });
        }

        const data = await Address.findByIdAndUpdate(
            addressId,
            { name, mobile, addressType, landmark, addressLine1, addressLine2, city, state, pincode },
            { new: true }
        );

        return res.status(200).json({ success: true, message: 'Address updated successfully', data });
    } catch (error) {
        console.error("Error in update address controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const removeAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        if (!addressId) {
            return res.status(400).json({ success: false, message: 'Address Id is required' });
        }

        await Address.findByIdAndDelete(addressId);

        return res.status(200).json({ success: true, message: 'Address removed successfully' });
    } catch (error) {
        console.error("Error in remove address controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getAddresses = async (req, res) => {
    try {
        const userId = req.user._id;

        const data = await Address.find({ userId });

        return res.status(200).json({ success: true, message: 'Addresses fectched successfully', data })
    } catch (error) {
        console.error("Error in get address controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export { addAddress, updateAddress, removeAddress, getAddresses }