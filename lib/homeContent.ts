import { appwriteConfig, databases } from "./appwrite";

// A promo banner on the home screen, one row in the `promos` table.
export type Promo = {
  $id: string;
  title: string;
  subtitle?: string;
  color?: string; // e.g. "#d9480f"
  image_url?: string;
  menu_item_id?: string; // opens that menu item
  category_id?: string; // opens Search filtered to that category
  active?: boolean;
  show_days?: string; // e.g. "5,6,0" = Fri, Sat, Sun (0 = Sunday). Empty = every day
  sort_order?: number;
};
const PROMOS_TABLE_ID = appwriteConfig.promosCollectionId;

// Loads the banners. Filtering and sorting happen here so the table needs no indexes.
// If the table doesn't exist yet this quietly returns [] and the app shows its built-in banners.
export async function getPromos(): Promise<Promo[]> {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      PROMOS_TABLE_ID,
    );
    const today = String(new Date().getDay());

    return (res.documents as any[])
      .filter((p) => p.active !== false)
      .filter(
        (p) =>
          !p.show_days ||
          String(p.show_days)
            .split(",")
            .map((d) => d.trim())
            .includes(today),
      )
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  } catch (e) {
    if (__DEV__) console.log("[promos] not loaded:", e);
    return [];
  }
}

// Appwrite Storage links need ?project=... to load in the app; other links are used as they are.
export const withProject = (url?: string) => {
  if (!url) return undefined;
  if (url.includes("project=")) return url;
  if (url.includes("/storage/bucket/")) {
    return `${url}${url.includes("?") ? "&" : "?"}project=${appwriteConfig.projectId}`;
  }
  return url;
};
