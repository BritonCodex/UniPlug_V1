import { writable } from "svelte/store";

// /c:/Projects/UniPlug/client/store/location.store.ts

export interface Location {
  id: string;
  name: string;
  address: string;
}

export const dummyLocations: Location[] = [
  {
    id: "1",
    name: "Downtown Station",
    address: "123 Main St, City Center",
  },
  {
    id: "2",
    name: "Uptown Plaza",
    address: "456 North Ave, Uptown",
  },
  {
    id: "3",
    name: "Suburb Hub",
    address: "789 Suburb Rd, Suburbia",
  },
];

// Example: selected location state (for use with a state management library)

export const selectedLocation = writable<Location | null>(null);
/**
 * Function to set the selected location by id.
 * Usage: setSelectedLocation('1');
 */
export function setSelectedLocation(id: string) {
  const location = dummyLocations.find((loc) => loc.id === id) || null;
  selectedLocation.set(location);
}
