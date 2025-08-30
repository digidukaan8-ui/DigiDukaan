import toast from 'react-hot-toast';
import logoutHelper from '../utils/logoutHelper';

const addProduct = async (data) => {
    try {
        const formData = new FormData();
        formData.append('storeId', data.storeId);
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
        formData.append('price', data.price);
        formData.append('discount', JSON.stringify(data.discount));
        formData.append('stock', data.stock);
        formData.append('attributes', JSON.stringify(data.attributes));
        formData.append('brand', data.brand);
        formData.append('tags', JSON.stringify(data.tags));
        const response = await fetch("http://localhost:3000/api/seller/addProduct", {
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

const getProduct = async (id) => {
    try {
        const response = await fetch(`http://localhost:3000/api/seller/${id}/products`, {
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
        console.error("Error in fetching Product: ", error);
        throw error;
    }
}

export { addProduct, getProduct };