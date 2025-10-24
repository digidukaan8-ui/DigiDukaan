import toast from 'react-hot-toast';
import logoutHelper from '../utils/logoutHelper';

const createStore = async (data) => {
    try {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("category", JSON.stringify(data.category));
        formData.append("addresses", JSON.stringify(data.addresses));
        formData.append("img", data.img);

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sellers/stores`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to create store");
            throw new Error(result.message || "Failed to create store");
        }

        return result;
    } catch (error) {
        console.error("Error in creating store: ", error);
        throw error;
    }
};

const updateStore = async (data) => {
    try {
        let body;
        let headers = { "Content-Type": "application/json" };

        if (data.img instanceof File) {
            body = new FormData();
            body.append("name", data.name);
            body.append("description", data.description);
            body.append("category", JSON.stringify(data.category));
            body.append("addresses", JSON.stringify(data.addresses));
            body.append("img", data.img);

            headers = {};
        } else {
            body = JSON.stringify({
                name: data.name,
                description: data.description,
                category: JSON.stringify(data.category),
                addresses: JSON.stringify(data.addresses),
                img: data.img,
            });
        }

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sellers/stores/${data.storeId}`, {
            method: "PATCH",
            credentials: "include",
            headers,
            body,
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to update store");
            throw new Error(result.message || "Failed to update store");
        }

        return result;
    } catch (error) {
        console.error("Error in updating store: ", error);
        throw error;
    }
};

const addDeliveryZone = async (data) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sellers/stores/${data.storeId}/delivery-zones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to add delivery zone");
            throw new Error(result.message || "Failed to add delivery zone");
        }

        return result;
    } catch (error) {
        console.error("Error in adding delivery zone: ", error);
        throw error;
    }
}

const updateDeliveryZone = async (data) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sellers/delivery-zones/${data.zoneId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to update delivery zone");
            throw new Error(result.message || "Failed to update delivery zone");
        }

        return result;
    } catch (error) {
        console.error("Error in updating delivery zone: ", error);
        throw error;
    }
};

const removeDeliveryZone = async (zoneId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sellers/delivery-zones/${zoneId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to remove delivery zone");
            throw new Error(result.message || "Failed to remove delivery zone");
        }

        return result;
    } catch (error) {
        console.error("Error in removing delivery zone: ", error);
        throw error;
    }
};

const getStoreInfo = async (storeId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sellers/stores/${storeId}/info`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get store info");
            throw new Error(result.message || "Failed to get store info");
        }

        return result.data;
    } catch (error) {
        console.error("Error in get store info: ", error);
        throw error;
    }
};

export { createStore, updateStore, addDeliveryZone, updateDeliveryZone, removeDeliveryZone, getStoreInfo };