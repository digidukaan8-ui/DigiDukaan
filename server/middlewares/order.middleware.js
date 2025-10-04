const handleAddOrder = (req, res, next) => {
    try {
        let { storeId, products, subtotal, deliveryCharge, platformTax, totalAmount, addressId } = req.body;

        if (!storeId || !addressId || !subtotal || !totalAmount || !products || !deliveryCharge) {
            return res.status(400).json({ success: false, message: 'Missing required fields: storeId, addressId, subtotal, totalAmount, products, deliveryCharge.' });
        }

        if (typeof storeId !== 'string' || typeof addressId !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid storeId or addressId format.' });
        }

        const numSubtotal = Number(subtotal);
        if (isNaN(numSubtotal) || numSubtotal < 0) {
            return res.status(400).json({ success: false, message: 'Subtotal must be a non-negative number.' });
        }

        const numTotalAmount = Number(totalAmount);
        if (isNaN(numTotalAmount) || numTotalAmount < 0) {
            return res.status(400).json({ success: false, message: 'Total Amount must be a non-negative number.' });
        }

        if (platformTax !== undefined) {
            const numTax = Number(platformTax);
            if (isNaN(numTax) || numTax < 0) {
                return res.status(400).json({ success: false, message: 'Platform Tax must be a non-negative number.' });
            }
        }

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ success: false, message: 'Products must be a non-empty array.' });
        }

        for (let i = 0; i < products.length; i++) {
            const product = products[i];

            if (!product.productId || product.quantity === undefined || product.finalPrice === undefined || !product.priceDistribution) {
                return res.status(400).json({ success: false, message: `Product at index ${i} is missing required fields.` });
            }

            if (typeof product.productId !== 'string') {
                return res.status(400).json({ success: false, message: `Invalid productId format at index ${i}.` });
            }

            const numQuantity = Number(product.quantity);
            if (isNaN(numQuantity) || !Number.isInteger(numQuantity) || numQuantity < 1) {
                return res.status(400).json({ success: false, message: `Quantity must be an integer greater than 0 at index ${i}.` });
            }

            const numFinalPrice = Number(product.finalPrice);
            if (isNaN(numFinalPrice) || numFinalPrice < 0) {
                return res.status(400).json({ success: false, message: `Final Price must be a non-negative number at index ${i}.` });
            }

            const priceDist = product.priceDistribution;
            if (priceDist.basePrice === undefined || !priceDist.platformFee || !priceDist.tax) {
                return res.status(400).json({ success: false, message: `Product price distribution at index ${i} is missing required fields (basePrice, platformFee, or tax).` });
            }

            const numBasePrice = Number(priceDist.basePrice);
            if (isNaN(numBasePrice) || numBasePrice < 0) {
                return res.status(400).json({ success: false, message: `Base Price must be a non-negative number at index ${i}.` });
            }

            if (priceDist.platformFee.rate === undefined || priceDist.platformFee.amount === undefined) {
                return res.status(400).json({ success: false, message: `Platform Fee (rate/amount) is missing for product at index ${i}.` });
            }

            if (priceDist.tax.rate === undefined || priceDist.tax.amount === undefined) {
                return res.status(400).json({ success: false, message: `Tax (rate/amount) is missing for product at index ${i}.` });
            }

            const numDiscount = priceDist.discount !== undefined ? Number(priceDist.discount) : 0;
            if (isNaN(numDiscount) || numDiscount < 0) {
                return res.status(400).json({ success: false, message: `Discount must be a non-negative number at index ${i}.` });
            }
        }
        
        if (typeof deliveryCharge !== 'object' || deliveryCharge === null) {
             return res.status(400).json({ success: false, message: 'Delivery Charge must be a valid object.' });
        }

        if (deliveryCharge.amount === undefined || !deliveryCharge.gst || deliveryCharge.deliverWithInDays === undefined) {
            return res.status(400).json({ success: false, message: 'Delivery charge is missing required fields (amount, gst, or deliverWithInDays).' });
        }

        const numAmount = Number(deliveryCharge.amount);
        if (isNaN(numAmount) || numAmount < 0) {
            return res.status(400).json({ success: false, message: 'Delivery charge amount must be a non-negative number.' });
        }

        if (deliveryCharge.gst.rate === undefined || deliveryCharge.gst.amount === undefined) {
             return res.status(400).json({ success: false, message: 'Delivery charge GST (rate/amount) is missing.' });
        }

        const numDays = Number(deliveryCharge.deliverWithInDays);
        if (isNaN(numDays) || !Number.isInteger(numDays) || numDays < 0) {
            return res.status(400).json({ success: false, message: 'Delivery days must be a non-negative integer.' });
        }

        return next();
    } catch (error) {
        console.error("Error in Add Order middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export { handleAddOrder };