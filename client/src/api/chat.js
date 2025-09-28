import logoutHelper from '../utils/logoutHelper';
import { toast } from 'react-hot-toast';

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
            if (data.chatId) bodyData.append('chatId', data.chatId);
            if (data.storeId) bodyData.append('storeId', data.storeId);
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
        const response = await fetch(`http://localhost:3000/api/chats/messages/${chatId}?skip=${skip}`, {
            credentials: "include",
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get messages");
            throw new Error(result.message || "Failed to get messages");
        }

        return result;
    } catch (err) {
        console.error("Error in fetching chat messages:", err);
        throw err;
    }
};

const getChats = async () => {
    try {
        const response = await fetch(`http://localhost:3000/api/chats`, {
            credentials: "include",
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get chats");
            throw new Error(result.message || "Failed to get chats");
        }

        return result;
    } catch (err) {
        console.error("Error in fetching chats:", err);
        throw err;
    }
};

const updateMessage = async (messageId, message) => {
    try {
        const response = await fetch(`http://localhost:3000/api/chats/messages/${messageId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify({ message }),
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to update message");
            throw new Error(result.message || "Failed to update message");
        }

        return result;
    } catch (err) {
        console.error("Error in updating message:", err);
        throw err;
    }
}

const removeMessage = async (messageId) => {
    try {
        const response = await fetch(`http://localhost:3000/api/chats/messages/${messageId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'DELETE',
            credentials: 'include',
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to remove message");
            throw new Error(result.message || "Failed to remove message");
        }

        return result;
    } catch (err) {
        console.error("Error in removing message:", err);
        throw err;
    }
}

const markAllMessagesSeen = async (chatId) => {
    try {
        const response = await fetch(`http://localhost:3000/api/chats/messages/seen/${chatId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'PUT',
            credentials: 'include',
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to mark all message seen");
            throw new Error(result.message || "Failed to mark all message seen");
        }

        return result;
    } catch (err) {
        console.error("Error in mark all message seen:", err);
        throw err;
    }
}

export { addMessage, getChats, getChatMessages, updateMessage, removeMessage, markAllMessagesSeen };