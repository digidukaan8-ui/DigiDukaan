import toast from 'react-hot-toast';

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
            toast.error(result.message || "Failed to create store");
            throw new Error(result.message || "Failed to create store");
        }

        return result;
    } catch (error) {
        console.error("Error creating store: ", error);
        throw error;
    }
};

export { createStore };