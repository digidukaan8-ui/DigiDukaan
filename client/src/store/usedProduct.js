import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUsedProductStore = create(
    persist(
        (set) => ({
            usedProducts: [],

            addUsedProduct: (product) =>
                set((state) => ({ usedProducts: [...state.usedProducts, product] })),

            updateUsedProduct: (updatedProduct) =>
                set((state) => ({
                    usedProducts: state.usedProducts.map((p) =>
                        p._id === updatedProduct._id ? updatedProduct : p
                    ),
                })),

            removeUsedProduct: (productId) =>
                set((state) => ({
                    usedProducts: state.usedProducts.filter((p) => p._id !== productId),
                })),

            clearUsedProducts: () => set({ usedProducts: [] }),
        }),
        {
            name: "used-product-storage",
            partialize: (state) => ({
                usedProducts: state.usedProducts,
            }),
        }
    )
);

export default useUsedProductStore;