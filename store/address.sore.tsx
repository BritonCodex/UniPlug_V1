import { create } from "zustand";

type AddressState = {
  address: string;
  setAddress: (addr: string) => void;
};

export const useAddressStore = create<AddressState>((set) => ({
  address: "",
  setAddress: (addr) => set({ address: addr }),
}));
