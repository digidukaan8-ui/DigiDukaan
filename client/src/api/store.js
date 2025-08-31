import toast from 'react-hot-toast';
import logoutHelper from '../utils/logoutHelper';

const createStore = async (data) => {
    try {
        const formData = new FormData();
        formData.append("userId", data.userId);
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("category", JSON.stringify(data.category));
        formData.append("addresses", JSON.stringify(data.addresses));
        formData.append("img", data.img);

        const response = await fetch("http://localhost:3000/api/seller/createStore", {
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
            body.append("storeId", data.storeId);
            body.append("name", data.name);
            body.append("description", data.description);
            body.append("category", JSON.stringify(data.category));
            body.append("addresses", JSON.stringify(data.addresses));
            body.append("img", data.img);

            headers = {};
        } else {
            body = JSON.stringify({
                storeId: data.storeId,
                name: data.name,
                description: data.description,
                category: JSON.stringify(data.category),
                addresses: JSON.stringify(data.addresses),
                img: data.img,
            });
        }

        const response = await fetch("http://localhost:3000/api/seller/updateStore", {
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
        const response = await fetch('http://localhost:3000/api/seller/addDeliveryZone', {
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
        const response = await fetch('http://localhost:3000/api/seller/updateDeliveryZone', {
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

const removeDeliveryZone = async (id) => {
    try {
        const response = await fetch('http://localhost:3000/api/seller/removeDeliveryZone', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ id })   // ✅ fix here
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

export { createStore, updateStore, addDeliveryZone, updateDeliveryZone, removeDeliveryZone };