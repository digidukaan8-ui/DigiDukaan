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
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
      partialize: (state) => ({
        stores: state.stores,
      }),
    }
  )
);

export default useStores;