import toast from 'react-hot-toast';
import logoutHelper from '../utils/logoutHelper';

const addProduct = async (data) => {
    try {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('subCategory', data.subCategory);
        if (data.img && data.img.length > 0) {
            for (let i = 0; i < data.img.length; i++) {
                formData.append("img", data.img[i]);
            }
        }
        if (data.video) {
            formData.append("video", data.video);
        }
        formData.append('price', Number(data.price));
        formData.append('discount', JSON.stringify(data.discount));
        formData.append('stock', Number(data.stock));
        formData.append('attributes', JSON.stringify(data.attributes));
        formData.append('brand', data.brand);
        formData.append('tags', JSON.stringify(data.tags));
        formData.append('deliveryCharge', Number(data.deliveryCharge));
        const response = await fetch(`http://localhost:3000/api/sellers/stores/${data.storeId}/products`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to add product");
            throw new Error(result.message || "Failed to add product");
        }

        return result;
    } catch (error) {
        console.error("Error in adding Product: ", error);
        throw error;
    }
}

const getProduct = async (storeId) => {
    try {
        const response = await fetch(`http://localhost:3000/api/sellers/stores/${storeId}/products`, {
            method: "GET",
            credentials: "include"
        });
        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to fetch product");
            throw new Error(result.message || "Failed to fetch product");
        }

        return result.data;
    } catch (error) {
        console.error("Error in Fetching Product: ", error);
        throw error;
    }
}

const updateProduct = async (data) => {
    try {
        let body;
        let headers = { "Content-Type": "application/json" };

        if ((data.img && data.img[0] instanceof File) || data.video instanceof File) {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('category', data.category);
            formData.append('subCategory', data.subCategory);

            if (data.img) {
                data.img.forEach((file) => {
                    if (file instanceof File) {
                        formData.append("img", file);
                    }
                });
            }

            if (data.video) {
                formData.append("video", data.video);
            }

            formData.append('price', Number(data.price));
            formData.append('discount', JSON.stringify(data.discount));
            formData.append('stock', Number(data.stock));
            formData.append('attributes', JSON.stringify(data.attributes));
            formData.append('brand', data.brand);
            formData.append('tags', JSON.stringify(data.tags));
            formData.append('deliveryCharge', Number(data.deliveryCharge));
            formData.append('removedImg', JSON.stringify(data.removedImg));
            formData.append('keptImg', JSON.stringify(data.keptImg));

            body = formData;
            headers = {};
        } else {
            body = JSON.stringify({
                title: data.title,
                description: data.description,
                category: data.category,
                subCategory: data.subCategory,
                img: data.img,
                video: data.video,
                price: Number(data.price),
                discount: JSON.stringify(data.discount),
                stock: Number(data.stock),
                attributes: JSON.stringify(data.attributes),
                brand: data.brand,
                tags: JSON.stringify(data.tags),
                deliveryCharge: Number(data.deliveryCharge),
                removedImg: JSON.stringify(data.removedImg),
                keptImg: JSON.stringify(data.keptImg),
            });
        }

        const response = await fetch(`http://localhost:3000/api/sellers/products/${data.productId}`, {
            method: "PATCH",
            credentials: "include",
            headers,
            body,
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to update product");
            throw new Error(result.message || "Failed to update product");
        }

        return result;
    } catch (error) {
        console.error("Error in Updating Product: ", error);
        throw error;
    }
};

const removeProduct = async (productId) => {
    try {
        const response = await fetch(`http://localhost:3000/api/sellers/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to remove product");
            throw new Error(result.message || "Failed to remove product");
        }

        return result;
    } catch (error) {
        console.error("Error in Removing Product: ", error);
        throw error;
    }
}

const addUsedProduct = async (data) => {
    try {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('subCategory', data.subCategory);
        if (data.img && data.img.length > 0) {
            for (let i = 0; i < data.img.length; i++) {
                formData.append("img", data.img[i]);
            }
        }
        if (data.video) {
            formData.append("video", data.video);
        }
        formData.append('price', Number(data.price));
        formData.append('discount', JSON.stringify(data.discount));
        formData.append('attributes', JSON.stringify(data.attributes));
        formData.append('brand', data.brand);
        formData.append('tags', JSON.stringify(data.tags));
        formData.append('delivery', JSON.stringify(data.delivery));
        formData.append('isNegotiable', data.isNegotiable);
        formData.append('billAvailable', data.billAvailable);
        formData.append('condition', data.condition);
        const response = await fetch(`http://localhost:3000/api/sellers/stores/${data.storeId}/used-products`, {
            method: "POST",
            credentials: "include",
            body: formData
        });
        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to add product");
            throw new Error(result.message || "Failed to add product");
        }

        return result;
    } catch (error) {
        console.error("Error in Adding Used Product: ", error);
        throw error;
    }
}

const getUsedProduct = async (storeId) => {
    try {
        const response = await fetch(`http://localhost:3000/api/sellers/stores/${storeId}/used-products`, {
            method: "GET",
            credentials: "include"
        });
        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to fetch used product");
            throw new Error(result.message || "Failed to fetch used product");
        }

        return result.data;
    } catch (error) {
        console.error("Error in Fetching used Product: ", error);
        throw error;
    }
}

const updateUsedProduct = async (data) => {
    try {
        let body;
        let headers = { "Content-Type": "application/json" };

        if ((data.img && data.img[0] instanceof File) || data.video instanceof File) {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('category', data.category);
            formData.append('subCategory', data.subCategory);

            if (data.img) {
                data.img.forEach((file) => {
                    if (file instanceof File) {
                        formData.append("img", file);
                    }
                });
            }

            if (data.video) {
                formData.append("video", data.video);
            }

            formData.append('price', Number(data.price));
            formData.append('discount', JSON.stringify(data.discount));
            formData.append('condition', data.condition);
            formData.append('attributes', JSON.stringify(data.attributes));
            formData.append('brand', data.brand);
            formData.append('tags', JSON.stringify(data.tags));
            formData.append('isNegotiable', data.isNegotiable);
            formData.append('billAvailable', data.billAvailable);
            formData.append('removedImg', JSON.stringify(data.removedImg));
            formData.append('keptImg', JSON.stringify(data.keptImg));
            formData.append('delivery', JSON.stringify(data.delivery));

            body = formData;
            headers = {};
        } else {
            body = JSON.stringify({
                title: data.title,
                description: data.description,
                category: data.category,
                subCategory: data.subCategory,
                img: data.img,
                video: data.video,
                price: Number(data.price),
                discount: JSON.stringify(data.discount),
                attributes: JSON.stringify(data.attributes),
                brand: data.brand,
                condition: data.condition,
                isNegotiable: data.isNegotiable,
                billAvailable: data.billAvailable,
                tags: JSON.stringify(data.tags),
                removedImg: JSON.stringify(data.removedImg),
                keptImg: JSON.stringify(data.keptImg),
                delivery: JSON.stringify(data.delivery),
            });
        }

        const response = await fetch(`http://localhost:3000/api/sellers/used-products/${data.usedProductId}`, {
            method: "PATCH",
            credentials: "include",
            headers,
            body,
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to update used product");
            throw new Error(result.message || "Failed to update used product");
        }

        return result;
    } catch (error) {
        console.error("Error in Updating Used Product: ", error);
        throw error;
    }
}

const removeUsedProduct = async (productId) => {
    try {
        const response = await fetch(`http://localhost:3000/api/sellers/used-products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to remove used product");
            throw new Error(result.message || "Failed to remove used product");
        }

        return result;
    } catch (error) {
        console.error("Error in Removing Used Product: ", error);
        throw error;
    }
}

export { addProduct, getProduct, updateProduct, removeProduct, addUsedProduct, getUsedProduct, updateUsedProduct, removeUsedProduct };