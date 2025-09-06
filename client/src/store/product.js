import { create } from "zustand";
import { persist } from "zustand/middleware";

const useProductStore = create(
    persist(
        (set, get) => ({
            products: [],

            addProduct: (product) =>
                set((state) => ({ products: [...state.products, product] })),

            updateProduct: (updatedProduct) =>
                set((state) => ({
                    products: state.products.map((p) =>
                        p._id === updatedProduct._id ? updatedProduct : p
                    ),
                })),

            getProduct: (id) => {
                return get().products.find((p) => p._id === id);
            },

            removeProduct: (productId) =>
                set((state) => ({
                    products: state.products.filter((p) => p._id !== productId),
                })),

            clearProducts: () => set({ products: [] }),
        }),
        {
            name: "product-storage",
            partialize: (state) => ({
                products: state.products,
            }),
        }
    )
);

export default useProductStore;