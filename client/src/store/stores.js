import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStores = create(
  persist(
    (set) => ({
      stores: [],

      addStores: (data) => set({ stores: data }),

      addStore: (store) =>
        set((state) => ({
          stores: [...state.stores, store],
        })),

      updateStore: (data) =>
        set((state) => ({
          stores: state.stores.map((s) =>
            s._id === data._id ? { ...s, ...data } : s
          ),
        })),

      removeStore: (id) =>
        set((state) => ({
          stores: state.stores.filter((s) => s._id !== id),
        })),

      clearStores: () => set({ stores: [] }),
    }),
    {
      name: "stores-storage",
      partialize: (state) => ({
        stores: state.stores,
      }),
    }
  )
);

export default useStores;
