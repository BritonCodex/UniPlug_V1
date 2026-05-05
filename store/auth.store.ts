import { User } from "@/constants/props";
import { getCurrentUser, signOut } from "@/lib/appwrite";
import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  //setter functions
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  logout: () => Promise<void>;

  //fetch
  fetchAuthenticatedUser: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),

  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),

  fetchAuthenticatedUser: async () => {
    set({ isLoading: true });

    try {
      const user = await getCurrentUser();

      if (user) set({ isAuthenticated: true, user: user as unknown as User });
    } catch (error) {
      console.log("fetchAuthenticateduser error", error);
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    try {
      set({ isLoading: true });

      await signOut();

      set({
        isAuthenticated: false,
        user: null,
      });
    } catch (error) {
      console.log("logout error", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
