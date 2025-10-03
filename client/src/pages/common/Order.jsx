import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import useLoaderStore from "../../store/loader";
import { verifyOrder } from "../../api/order";
import { toast } from 'react-hot-toast';
import useOrderStore from "../../store/order";

function Order() {
    const { orders, isFetched, setOrders, addOrder, clearOrders } = useOrderStore();
    const { startLoading, stopLoading } = useLoaderStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        const fetchOrder = async () => {
            startLoading('fetchOrder')
            try {
                const result = await verifyOrder(orderId);
                if (result.success) {
                    clearOrders();
                    setOrders(result.data);
                    toast.success("Order fetched successfully");
                }
            } finally {
                stopLoading();
            }
        }
        if (orders.length === 0 && !isFetched) {
            fetchOrder();
        }
    }, []);

    useEffect(() => {
        if (!orderId) return;
        const fetchPaymentDetail = async () => {
            startLoading('confirmingPayment')
            try {
                const result = await verifyOrder(orderId);
                if (result.success) {
                    toast.success("Payment confirmed");
                    searchParams.delete('orderId');
                    setSearchParams(searchParams);
                    if (orders.length >= 0 && isFetched) {
                        addOrder(result.order);
                    }
                }
            } finally {
                stopLoading();
            }
        }
        fetchPaymentDetail();
    }, [orderId]);

    return (
        <div>Order</div>
    )
}

export default Order;