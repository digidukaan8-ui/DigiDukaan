import toast from 'react-hot-toast';
import logoutHelper from '../utils/logoutHelper';

const addAdress = async (data) => {
    try {
        const response = await fetch(`http://localhost:3000/api/buyers/order/${storeId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(data),
        });

        const result = response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to add address");
            throw new Error(result.message || "Failed to add address");
        }

        return result;
    } catch (error) {
        console.error("Error in add Address:", error);
        throw error;
    }
}

export { addAdress };