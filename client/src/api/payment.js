import toast from "react-hot-toast";
import logoutHelper from "../utils/logoutHelper";

const payNow = async (data) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/payments/used-product/create-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data),
        }
        );

        const result = await res.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to create order");
            throw new Error(result.message || "Failed to create order");
        }

        const { payment_session_id } = result.data;

        if (!payment_session_id) {
            toast.error("Payment session id missing");
            return;
        }

        if (!window.Cashfree) {
            toast.error("Cashfree SDK not loaded yet");
            return;
        }

        const cashfree = new window.Cashfree({ mode: "sandbox" });

        cashfree.checkout({
            paymentSessionId: payment_session_id,
            redirectTarget: "_self",
            onSuccess: async (event) => {
                console.log("Payment success event:", event);
            },
            onFailure: async (event) => {
                console.error("Payment failed event:", event);
            },
        });
    } catch (error) {
        console.error("Error to create order:", error);
        toast.error("Something went wrong in payment");
    }
};

const verifyPayment = async (orderId, productId) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/payments/used-product/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ orderId, productId }),
        });

        const result = await res.json();

        if (!result.success) {
            toast.error("Payment not completed");
            console.log("Verification failed:", result.data);
        }

        return result;
    } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("Something went wrong while verifying payment");
    }
};

const fetchSellerIncome = async (storeId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sellers/revenue/${storeId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            credentials: "include",
        });

        const result = await response.json();

        if (!response.ok) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to fetch seller income.");
            throw new Error(result.message || "Failed to fetch seller income.");
        }

        return result;
    } catch (error) {
        console.error("Error fetching seller income: ", error);
        throw error;
    }
};

const requestWithdrawal = async (storeId, amount) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sellers/withdraw/${storeId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            credentials: "include",
            body: JSON.stringify({ amount: amount })
        });

        const result = await response.json();

        if (!response.ok) {
            logoutHelper(result.message);
            toast.error(result.message || "Withdrawal request failed.");
            throw new Error(result.message || "Withdrawal request failed.");
        }

        return result;
    } catch (error) {
        console.error("Error requesting withdrawal: ", error);
        throw error;
    }
};

export { payNow, verifyPayment, fetchSellerIncome, requestWithdrawal };