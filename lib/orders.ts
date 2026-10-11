import { ID, Permission, Query, Role } from "react-native-appwrite";
import { account, appwriteConfig, databases } from "./appwrite";

const DATABASE_ID = appwriteConfig.databaseId;
const ORDERS_TABLE_ID = appwriteConfig.orderCollectionId;

// ---- Match these to the enum values you defined in Appwrite --------------------------
// Left side is how the app refers to it, right side is the exact enum value in your table.
export const PAYMENT_METHOD_MPESA = "MPESA"; // enum options: MPESA, MANUAL, POD
export const ORDER_STATUS = {
  // A new order is saved only after M-Pesa confirms payment, so it starts as "verified".
  // Change to "pending" if you'd rather confirm payments yourself first.
  placed: "verified",
};
// ---------------------------------------------------------------------------------------

// Your status enum: pending, verified, processing, shipped, delivered, cancelled, failed
export const isFailedStatus = (status?: string) =>
  ["cancelled", "canceled", "failed"].includes(String(status ?? "").toLowerCase());

// Which of the 4 tracker steps a status belongs to:
// pending/verified -> 0 placed, processing -> 1 preparing, shipped -> 2 on the way, delivered -> 3.
export const stepIndexForStatus = (status?: string) => {
  const s = String(status ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  if (["delivered", "completed", "complete"].includes(s)) return 3;
  if (["on_the_way", "out_for_delivery", "dispatched", "shipped", "delivering"].includes(s)) return 2;
  if (["preparing", "cooking", "processing", "in_progress", "accepted"].includes(s)) return 1;
  return 0;
};

export async function createOrder(p: {
  userId: string; // the users-table row id (the relationship value)
  accountId?: string; // the Appwrite auth account id, if your user object has it
  customerName?: string;
  customerEmail?: string;
  phoneNumber: string;
  address: string;
  items: any[];
  totalPrice: number;
  transactionCode: string;
}) {
  // Compact snapshot so it fits the 10,000-character items column.
  const compact = (withImages: boolean) =>
    JSON.stringify(
      p.items.map((it) => ({
        id: it.id,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        ...(withImages ? { image_url: it.image_url } : {}),
        customizations: (it.customizations ?? []).map((c: any) => ({ name: c.name, price: c.price })),
      })),
    );
  let items = compact(true);
  if (items.length > 10000) items = compact(false);

  const data: Record<string, unknown> = {
    userId: p.userId,
    address: p.address.slice(0, 100),
    phoneNumber: p.phoneNumber,
    items,
    totalPrice: p.totalPrice,
    transactionCode: p.transactionCode.slice(0, 20),
    paymentMethod: PAYMENT_METHOD_MPESA,
    status: ORDER_STATUS.placed,
  };
  if (p.customerName) data.customerName = p.customerName.slice(0, 100);
  if (p.customerEmail) data.customerEmail = p.customerEmail;

  // Only set row permissions when we know the auth account id; otherwise rely on the table's own Security settings.
  const permissions = p.accountId ? [Permission.read(Role.user(p.accountId))] : undefined;

  try {
    return await databases.createDocument(DATABASE_ID, ORDERS_TABLE_ID, ID.unique(), data, permissions);
  } catch (e) {
    if (__DEV__) console.log("[order] rejected payload:", JSON.stringify(data));
    throw e;
  }
}

export async function getOrder(id: string) {
  const doc: any = await databases.getDocument(DATABASE_ID, ORDERS_TABLE_ID, id);
  let items: any[] = [];
  try {
    items = JSON.parse(doc.items || "[]");
  } catch {
    // leave empty if the snapshot is unreadable
  }
  return { ...doc, items };
}

// The signed-in customer's orders, newest first.
// `userRowId` is the users-table row id (user.$id), the value stored in the userId relationship.
export async function getMyOrders(userRowId: string) {
  const base = [Query.orderDesc("$createdAt"), Query.limit(50)];

  let docs: any[];
  try {
    const res = await databases.listDocuments(DATABASE_ID, ORDERS_TABLE_ID, [
      Query.equal("userId", userRowId),
      ...base,
    ]);
    docs = res.documents;
  } catch {
    // Some Appwrite versions can't filter on a relationship column; filter below instead.
    const res = await databases.listDocuments(DATABASE_ID, ORDERS_TABLE_ID, base);
    docs = res.documents;
  }

  return docs
    .filter((o: any) => {
      const owner = typeof o.userId === "string" ? o.userId : o.userId?.$id;
      return !owner || owner === userRowId; // keep rows whose owner isn't returned
    })
    .map((o: any) => {
      let items: any[] = [];
      try {
        items = JSON.parse(o.items || "[]");
      } catch {
        // ignore unreadable snapshot
      }
      return { ...o, items };
    });
}

// ---- Admin side: move orders through their statuses ---------------------------------

// Exact values from your status enum.
export const STATUS_VALUE = {
  preparing: "processing",
  on_the_way: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
} as const;

// An admin is an Appwrite account that has the label "admin" (Auth -> Users -> Labels).
export async function isAdmin() {
  try {
    const acc: any = await account.get();
    return (acc.labels ?? []).includes("admin");
  } catch {
    return false;
  }
}

// Every order, newest first. Only works for accounts the table lets read all rows.
export async function getAllOrders() {
  const res = await databases.listDocuments(DATABASE_ID, ORDERS_TABLE_ID, [
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);
  return res.documents.map((o: any) => {
    let items: any[] = [];
    try {
      items = JSON.parse(o.items || "[]");
    } catch {
      // ignore unreadable snapshot
    }
    return { ...o, items };
  });
}

export async function updateOrderStatus(orderId: string, status: string) {
  return databases.updateDocument(DATABASE_ID, ORDERS_TABLE_ID, orderId, { status });
}