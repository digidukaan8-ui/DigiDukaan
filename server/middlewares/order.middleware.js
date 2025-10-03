const handleAddOrder = (req, res, next) => {
    try {
        let { products, subtotal, platfromTax, totalAmount, addressId, deliveryCharges } = req.body;

        if (!addressId || !subtotal || !totalAmount || !products || !deliveryCharges) {
            return res.status(400).json({ success: false, message: 'Missing required fields: addressId, subtotal, totalAmount, products, deliveryCharges.' });
        }

        if (typeof addressId !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid addressId format.' });
        }

        const numSubtotal = Number(subtotal);
        if (isNaN(numSubtotal) || numSubtotal < 0) {
            return res.status(400).json({ success: false, message: 'Subtotal must be a non-negative number.' });
        }

        const numTotalAmount = Number(totalAmount);
        if (isNaN(numTotalAmount) || numTotalAmount < 0) {
            return res.status(400).json({ success: false, message: 'Total Amount must be a non-negative number.' });
        }

        if (platfromTax !== undefined) {
            const numTax = Number(platfromTax);
            if (isNaN(numTax) || numTax < 0) {
                return res.status(400).json({ success: false, message: 'Overall Tax must be a non-negative number.' });
            }
        }

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ success: false, message: 'Products must be a non-empty array.' });
        }

        if (!Array.isArray(deliveryCharges)) {
            return res.status(400).json({ success: false, message: 'Delivery Charges must be an array.' });
        }

        for (let i = 0; i < products.length; i++) {
            const product = products[i];

            if (!product.productId || product.quantity === undefined || product.finalPrice === undefined || !product.priceDistribution) {
                return res.status(400).json({ success: false, message: `Product at index ${i} is missing required fields.` });
            }

            if (!product.productId || typeof product.productId !== 'string') {
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

        for (let i = 0; i < deliveryCharges.length; i++) {
            const charge = deliveryCharges[i];

            if (!charge.storeId || charge.amount === undefined) {
                return res.status(400).json({ success: false, message: `Delivery charge at index ${i} is missing required fields (storeId or amount).` });
            }

            if (!charge.storeId || typeof charge.storeId !== 'string') {
                return res.status(400).json({ success: false, message: `Invalid storeId format in delivery charge at index ${i}.` });
            }

            const numAmount = Number(charge.amount);
            if (isNaN(numAmount) || numAmount < 0) {
                return res.status(400).json({ success: false, message: `Delivery charge amount must be a non-negative number at index ${i}.` });
            }
        }

        return next();
    } catch (error) {
        console.error("Error in Add Order middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export { handleAddOrder };