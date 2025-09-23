import logoutHelper from '../utils/logoutHelper';

const addMessage = async (type, data) => {
    try {
        let bodyData;
        let headers = {};

        if (type === "message") {
            headers['Content-Type'] = 'application/json';
            bodyData = JSON.stringify(data);
        } else {
            bodyData = new FormData();
            bodyData.append("file", data.img || data.video || data.file);
            bodyData.append('sender', data.sender);
            bodyData.append('receiver', data.receiver);
            if (data.chatId) bodyData.append('chatId',data.chatId);
            if (data.storeId) bodyData.append('storeId',data.storeId);
        }

        const response = await fetch('http://localhost:3000/api/chats/add', {
            headers,
            method: 'POST',
            credentials: 'include',
            body: bodyData
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Network error");
        }

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to add message");
            throw new Error(result.message || "Failed to add message");
        }

        return result;
    } catch (error) {
        console.error("Error in sending message:", error);
        throw error;
    }
};

const getChatMessages = async (chatId, skip = 0) => {
    try {
        const res = await fetch(`http://localhost:3000/api/chats/messages/${chatId}?skip=${skip}`, {
            credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed to fetch messages");

        return data;
    } catch (err) {
        console.error("Error fetching chat messages:", err);
        throw err;
    }
};

const getChats = async () => {
    try {
        const res = await fetch(`http://localhost:3000/api/chats`, {
            credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch chats");

        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed to fetch chats");

        return data;
    } catch (err) {
        console.error("Error fetching chats:", err);
        throw err;
    }
};

export { addMessage, getChats, getChatMessages };