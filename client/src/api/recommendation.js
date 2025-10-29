import toast from 'react-hot-toast';
import logoutHelper from '../utils/logoutHelper';

const getRelatedProducts = async (productId, location) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/recommends/products/related-product/${productId}/${location}`, {
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

const getSimilarProducts = async (productId, location) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/recommends/products/similar-product/${productId}/${location}`, {
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

const getSimilarBrandProducts = async (productId, location) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/recommends/products/similar-brand-product/${productId}/${location}`, {
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

const getRelatedUsedProducts = async (productId, location) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/recommends/products/related-used-product/${productId}/${location}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            credentials: "include",
        });

        const result = await response.json();
        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get related used product");
            throw new Error(result.message || "Failed to get related used product");
        }

        return result.data;
    } catch (error) {
        console.error("Error in get related used product: ", error);
        throw error;
    }
}

const getSimilarUsedProducts = async (productId, location) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/recommends/products/similar-used-product/${productId}/${location}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            credentials: "include",
        });

        const result = await response.json();
        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get similar used product");
            throw new Error(result.message || "Failed to get similar used product");
        }

        return result.data;
    } catch (error) {
        console.error("Error in get similar used product: ", error);
        throw error;
    }
}

const getSimilarBrandUsedProducts = async (productId, location) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/recommends/products/similar-brand-used-product/${productId}/${location}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            credentials: "include",
        });

        const result = await response.json();
        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get similar brand used product");
            throw new Error(result.message || "Failed to get similar brand used product");
        }

        return result.data;
    } catch (error) {
        console.error("Error in get similar brand used product: ", error);
        throw error;
    }
}

const getBestRatedProducts = async (location) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/recommends/products/best-rated/${location}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            credentials: "include",
        });

        const result = await response.json();
        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get best rated product");
            throw new Error(result.message || "Failed to get best rated product");
        }

        return result.data;
    } catch (error) {
        console.error("Error in get best rated product: ", error);
        throw error;
    }
}

const getMostViewedProducts = async (location) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/recommends/products/most-viewed/${location}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            credentials: "include",
        });

        const result = await response.json();
        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get most viewed product");
            throw new Error(result.message || "Failed to get most viewed product");
        }

        return result.data;
    } catch (error) {
        console.error("Error in get most viewed product: ", error);
        throw error;
    }
}

const getBestSellerProducts = async (location) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/recommends/products/best-seller/${location}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            credentials: "include",
        });

        const result = await response.json();
        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get best seller product");
            throw new Error(result.message || "Failed to get best seller product");
        }

        return result.data;
    } catch (error) {
        console.error("Error in get best seller product: ", error);
        throw error;
    }
}

export {
    getRelatedProducts, getSimilarProducts, getSimilarBrandProducts, getSimilarBrandUsedProducts, getSimilarUsedProducts,
    getRelatedUsedProducts, getBestRatedProducts, getBestSellerProducts, getMostViewedProducts
};