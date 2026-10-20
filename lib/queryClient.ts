// Client-side caching for UniPlug.
//
// Install once:
//   npx expo install @react-native-async-storage/async-storage
//   npm i @tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-async-storage-persister
//
// Then wrap your root layout (app/_layout.tsx):
//
//   import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
//   import { persister, queryClient, DAY } from "@/lib/queryClient";
//
//   <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: DAY }}>
//     {/* your existing <Stack /> or layout */}
//   </PersistQueryClientProvider>

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { getCategories, getMenu, getPickupLocations } from "./appwrite";

export const MINUTE = 60_000;
export const DAY = 24 * 60 * MINUTE;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * MINUTE, // data younger than this is served from cache, no request
      gcTime: DAY, // keep unused data for a day (also what gets saved to disk)
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000), // 1s, 2s, 4s... covers server cold starts
      refetchOnWindowFocus: false,
    },
  },
});

export const persister = createAsyncStoragePersister({ storage: AsyncStorage });

// ---- Things that rarely change: cache them -----------------------------------------------------
// Identical requests from different screens (Home and Search both load categories) are merged into one.

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 30 * MINUTE,
  });

export const usePickupLocations = () =>
  useQuery({
    queryKey: ["pickup-locations"],
    queryFn: getPickupLocations,
    staleTime: 30 * MINUTE,
  });

export const useMenu = (category = "", query = "") =>
  useQuery({
    queryKey: ["menu", category, query],
    queryFn: () => getMenu({ category, query } as any),
    staleTime: 5 * MINUTE,
  });

// ---- How to use them -------------------------------------------------------------------------
// Replace  const { data, loading } = useAppwrite({ fn: getCategories });
// with     const { data, isLoading: loading, refetch } = useCategories();
//
// Pull-to-refresh: call refetch().
// After you change data yourself, drop the stale copy:  queryClient.invalidateQueries({ queryKey: ["menu"] });
//
// Do NOT cache for long: orders, payment status, the cart. Fetch those fresh (or with staleTime: 0).
