import toast from 'react-hot-toast';
import logoutHelper from '../utils/logoutHelper';

const getRelatedProducts = async (productId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/buyers/products/related-product/${productId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            credentials: "include",
        });

        const result = await response.json();
        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get related product");
            throw new Error(result.message || "Failed to get related product");
        }

        return result.data;
    } catch (error) {
        console.error("Error in get related product: ", error);
        throw error;
    }
}

const getSimilarProducts = async (productId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/buyers/products/similar-product/${productId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            credentials: "include",
        });

        const result = await response.json();
        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get similar product");
            throw new Error(result.message || "Failed to get similar product");
        }

        return result.data;
    } catch (error) {
        console.error("Error in get similar product: ", error);
        throw error;
    }
}

const getSimilarBrandProducts = async (productId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/buyers/products/similar-brand-product/${productId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            credentials: "include",
        });

        const result = await response.json();
        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get similar brand product");
            throw new Error(result.message || "Failed to get similar brand product");
        }

        return result.data;
    } catch (error) {
        console.error("Error in get similar brand product: ", error);
        throw error;
    }
}

export { getRelatedProducts, getSimilarProducts, getSimilarBrandProducts };