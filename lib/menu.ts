import { Query } from "react-native-appwrite";
// Adjust to however your lib/appwrite.ts exports these.
import { appwriteConfig, databases } from "./appwrite";

// Your customizations table (from the Appwrite console URL).
const DATABASE_ID = "69e8b933003795dc4810";
const CUSTOMIZATIONS_TABLE_ID = "customizations";

// true  -> if an item has no linked options, show every row from the table (grouped by type)
// false -> only ever show the options linked to that item
const FALLBACK_TO_ALL_OPTIONS = true;

export async function getMenuItem(id: string) {
  return databases.getDocument(
    DATABASE_ID,
    (appwriteConfig as any).menuCollectionId,
    id,
  );
}

// Every row in the customizations table (toppings and sides).
export async function getCustomizations() {
  const res = await databases.listDocuments(
    DATABASE_ID,
    CUSTOMIZATIONS_TABLE_ID,
    [Query.limit(100)],
  );
  return res.documents;
}

// A menu row's `customizations` can be names, row ids, or related rows, so handle all three.
export function pickOptions(menuItem: any, rows: any[]) {
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

  const linked = rows.filter((r) => names.has(r.name) || ids.has(r.$id));
  return linked.length > 0 || !FALLBACK_TO_ALL_OPTIONS ? linked : rows;
}
