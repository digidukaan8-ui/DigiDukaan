const handleAddOrder = (req, res, next) => {
    try {
        let { products, amount, addressId } = req.body;
        const { storeId } = req.params;

        if (products && typeof products === 'string') {
            try {
                products = JSON.parse(products);
            } catch (error) {
                return res.status(400).json({ success: false, message: "Invalid products format" });
            }
        }

        if (!storeId || !amount || !addressId) {
            return res.status.json({ success: false, message: 'All fields are required' });
        }

        if (typeof storeId !== 'string' || typeof addressId !== 'string') {
            return res.status.json({ success: false, message: 'Invalid input format' });
        }

        if (isNaN(Number(amount))) {
            return res.status.json({ success: false, message: 'Invalid input format' });
        }

        if (products && Array.isArray(products)) {
            for (let product of products) {
                if (!product.productId || !product.quantity || !product.price) {
                    return res.status.json({ success: false, message: 'All fields are required in products' });
                }
                if (typeof product.productId !== 'string' || isNaN(Number(product.quantity)) || isNaN(Number(product.price))) {
                    return res.status.json({ success: false, message: 'Invalid input format of products' });
                }
            }
        } else {
            return res.status.json({ success: false, message: 'Invalid format of products' });
        }

        return next();
    } catch (error) {
        console.error("Error in Add Order middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export { handleAddOrder };