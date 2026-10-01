import { Order } from "@/constants/props";
import { createOrderInDB, getUserOrdersFromDB } from "@/lib/appwrite";
import { create } from "zustand";

type OrderStore = {
  orders: Record<string, Order[]>;
  loading: boolean;

  createOrder: (userId: string, items: any[], total: number) => Promise<void>;

  fetchOrders: (userId: string) => Promise<void>;

  getUserOrders: (userId: string) => Order[];
};

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: {},
  loading: false,

  createOrder: async (userId, items, total) => {
    try {
      if (!userId || !items.length) return;

      set({ loading: true });

      const newOrder = {
        userId,
        items: JSON.stringify(items), // Appwrite-safe storage
        totalAmount: total,
        status: "pending",
        createdAt: Date.now(),
      };

      const created = await createOrderInDB(newOrder);

      const current = get().orders[userId] || [];

      set({
        orders: {
          ...get().orders,
          [userId]: [created as any, ...current],
        },
      });
    } catch (error) {
      console.log("Create order store error:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchOrders: async (userId) => {
    try {
      set({ loading: true });

      const orders = await getUserOrdersFromDB(userId);

      set({
        orders: {
          ...get().orders,
          [userId]: orders as any,
        },
      });
    } catch (error) {
      console.log("Fetch orders store error:", error);
    } finally {
      set({ loading: false });
    }
  },

  getUserOrders: (userId) => {
    return get().orders[userId] || [];
  },
}));
