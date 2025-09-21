import toast from 'react-hot-toast';
import logoutHelper from '../utils/logoutHelper';

const addAddress = async (data) => {
    try {
        const response = await fetch('http://localhost:3000/api/buyers/address', {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to add address");
            throw new Error(result.message || "Failed to add address");
        }

        return result;
    } catch (error) {
        console.error("Error in adding Address:", error);
        throw error;
    }
}

const updateAddress = async (data, addressId) => {
    try {
        const response = await fetch(`http://localhost:3000/api/buyers/address/${addressId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to update address");
            throw new Error(result.message || "Failed to update address");
        }

        return result;
    } catch (error) {
        console.error("Error in update Address:", error);
        throw error;
    }
}

const removeAddress = async (addressId) => {
    try {
        const response = await fetch(`http://localhost:3000/api/buyers/address/${addressId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'DELETE',
            credentials: 'include',
        });

        const result = await response.json();
        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to remove address");
            throw new Error(result.message || "Failed to remove address");
        }

        return result;
    } catch (error) {
        console.error("Error in removing Address:", error);
        throw error;
    }
}

const getAddress = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/buyers/addresses', {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'GET',
            credentials: 'include',
        });

        const result = await response.json();
        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get address");
            throw new Error(result.message || "Failed to get address");
        }

        return result;
    } catch (error) {
        console.error("Error in get Address:", error);
        throw error;
    }
}

export { addAddress, updateAddress, removeAddress, getAddress };