import { create } from "zustand";
import { persist } from "zustand/middleware";

const useProductStore = create(
    persist(
        (set) => ({
            products: [],

            addProduct: (product) =>
                set((state) => ({ products: [...state.products, product] })),

            updateProduct: (updatedProduct) =>
                set((state) => ({
                    products: state.products.map((p) =>
                        p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
                    ),
                })),

            removeProduct: (productId) =>
                set((state) => ({
                    products: state.products.filter((p) => p.id !== productId),
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
