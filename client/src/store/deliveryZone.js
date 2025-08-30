import { create } from "zustand";
import { persist } from "zustand/middleware";

const useDeliveryStore = create(
  persist(
    (set) => ({
      deliveryZone: [],

      setZones: (zones) => set({ deliveryZone: zones }),

      addZone: (zone) =>
        set((state) => ({
          deliveryZone: [...state.deliveryZone, zone],
        })),

      updateZone: (id, zone) =>
        set((state) => ({
          deliveryZone: state.deliveryZone.map((z) =>
            z._id === id ? { ...z, ...zone } : z
          ),
        })),

      removeZone: (id) =>
        set((state) => ({
          deliveryZone: state.deliveryZone.filter((z) => z._id !== id),
        })),

      clearZones: () => set({ products: [] }),
    }),
    {
      name: "deliveryZone-storage",
      partialize: (state) => ({
        deliveryZone: state.deliveryZone,
      }),
    }
  )
);

export default useDeliveryStore;