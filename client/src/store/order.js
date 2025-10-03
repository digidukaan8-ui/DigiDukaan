import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useOrderStore = create(
    persist(
        (set) => ({
            orders: [],
            isFetched: false,

            setOrders: (orders) => {
                set({ orders: orders, isFetched: true })
            },
            addOrder: (order) => {
                set((state) => ({
                    orders: [...state.orders, order]
                }))
            },
            clearOrders: () => {
                set({ orders: [], isFetched: false })
            }
        }),
        {
            name: 'order-storage',
            partialize: (state) => ({
                orders: state.orders,
                isFetched: state.isFetched
            })
        }
    )
)

export default useOrderStore;