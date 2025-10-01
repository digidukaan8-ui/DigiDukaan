import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Store from "../models/store.model.js";
import Address from "../models/address.model.js";

const addOrder = async (req, res) => {
    try {
        const { products, amount, addressId } = req.body;
        const { storeId } = req.params;
        const userId = req.user._id;

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ success: true, message: 'Store not found' });
        }

        for (let pro of products) {
            const product = await Product.findById(pro.productId);
            if (!product) {
                return res.status(404).json({ success: true, message: 'Product not found' });
            }
            let available = product.stock - pro.quantity;
            if (!(available > 0)) {
                return res.status(404).json({ success: true, message: 'Product stock is not enough' });
            }
            product.stock = available;
            await product.save();
        }

        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).json({ success: true, message: 'Address not found' });
        }

        const newOrder = await Order.create(storeId, userId, products, amount, addressId);

        return res.status(201).json({ success: true, message: 'Order added successfully', data: newOrder });
    } catch (error) {
        console.error("Error in Add Order Controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export { addOrder };