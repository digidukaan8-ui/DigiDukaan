import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAddressStore = create(
    persist(
        (set) => ({
            addresses: [],
            isFetched: false,

            setAddresses: (data) => set({ addresses: data, isFetched: true }),

            addAddress: (data) => set((state) => ({ addresses: [...state.addresses, data] })),

            updateAddress: (id, data) => set((state) => ({ addresses: state.addresses.map((a) => a._id === id ? { ...a, ...data } : a) })),

            removeAddress: (id) => set((state) => ({ addresses: state.addresses.filter((a) => a._id !== id) })),

            clearAddress: () => set({ addresses: [], isFetched: false }),
        }),
        {
            name: 'address-storage',
            partialize: (state) => ({
                addresses: state.addresses,
                isFetched: state.isFetched
            }),
        }
    )
);

export default useAddressStore;