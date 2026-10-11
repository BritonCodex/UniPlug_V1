import { Query } from "react-native-appwrite";
import { appwriteConfig, databases } from "./appwrite";

// true  -> if an item has no linked options, show every row from the customizations table
// false -> only ever show the options linked to that item
const FALLBACK_TO_ALL_OPTIONS = true;

export async function getMenuItem(id: string) {
  return databases.getDocument(
    appwriteConfig.databaseId,
    appwriteConfig.menuCollectionId,
    id,
  );
}

// Every row in the customizations table (toppings and sides).
export async function getCustomizations() {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.customizationsCollectionId,
    [Query.limit(100)],
  );
  return res.documents;
}

// Toppings and sides for one menu item.
// 1) the menu_customizations join table, 2) a `customizations` field on the menu row, 3) everything.
export async function getOptionsForItem(menuItem: any) {
  const all = await getCustomizations();

  // 1) Join table. Assumes its columns are named `menu` and `customizations`; rename here if not.
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCustomizationsCollectionId,
      [Query.equal("menu", menuItem.$id), Query.limit(100)],
    );
    const ids = new Set(
      res.documents
        .map((r: any) => {
          const c = r.customizations ?? r.customization;
          return typeof c === "string" ? c : c?.$id;
        })
        .filter(Boolean),
    );
    const linked = all.filter((c) => ids.has(c.$id));
    if (linked.length > 0) return linked;
  } catch {
    // column names differ or the query isn't allowed: fall through
  }

  // 2) Names, ids or related rows stored directly on the menu row.
  const names = new Set<string>();
  const ids = new Set<string>();
  for (const c of menuItem?.customizations ?? []) {
    if (typeof c === "string") {
      names.add(c);
      ids.add(c);
    } else if (c) {
      if (c.name) names.add(c.name);
      if (c.$id) ids.add(c.$id);
    }
  }
  const linked = all.filter((r) => names.has(r.name) || ids.has(r.$id));
  if (linked.length > 0 || !FALLBACK_TO_ALL_OPTIONS) return linked;

  // 3) Nothing linked: show everything.
  return all;
}
