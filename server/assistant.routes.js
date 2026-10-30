// UniPlug 24/7 assistant: an Express router that talks to OpenRouter.
//
//   npm i express express-rate-limit node-appwrite
//   (mounted by server.js at /api/assistant)
//
// The OpenRouter key lives ONLY here (env var OPENROUTER_API_KEY), never in the app.
const express = require("express");
const rateLimit = require("express-rate-limit");
const { Client, Account, Databases, Query } = require("node-appwrite");

const router = express.Router();
router.use(express.json({ limit: "20kb" }));

const MODEL = process.env.ASSISTANT_MODEL || "anthropic/claude-haiku-4.5"; // any model id from openrouter.ai/models
const DAILY_LIMIT = Number(process.env.ASSISTANT_DAILY_LIMIT || 60); // messages per user per day
const SUPPORT_PHONE = process.env.SUPPORT_PHONE || "";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Calls OpenRouter (OpenAI-style chat API) and returns the reply text.
async function askModel(system, messages) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const r = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "https://uniplug.app", // optional, shows in your OpenRouter stats
        "X-Title": "UniPlug Assistant", // optional
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        messages: [{ role: "system", content: system }, ...messages],
      }),
      signal: controller.signal,
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      // 401 bad key, 402 out of credits, 429 rate limited, 5xx provider trouble
      const err = new Error(data?.error?.message || `OpenRouter replied ${r.status}`);
      err.status = r.status;
      throw err;
    }
    const content = data?.choices?.[0]?.message?.content;
    return (typeof content === "string" ? content : "").trim();
  } finally {
    clearTimeout(timer);
  }
}

const ENDPOINT = process.env.APPWRITE_ENDPOINT; // e.g. https://nyc.cloud.appwrite.io/v1
const PROJECT = process.env.APPWRITE_PROJECT_ID;
const DB = process.env.APPWRITE_DATABASE_ID || "69e8b933003795dc4810";
const TABLES = {
  menu: "menu",
  categories: "categories",
  customizations: "customizations",
  pickup: "pickup_locations",
  orders: "orders",
  users: process.env.USERS_COLLECTION_ID || "69e8baeb003e07b8bfc5",
};

// Server-side Appwrite client (API key: read-only access to the database).
const adminDb = new Databases(
  new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(process.env.APPWRITE_API_KEY),
);

// ---------------------------------------------------------------------------------------
// 1. Who is asking? The app sends the signed-in user's Appwrite JWT; we verify it with Appwrite.
// ---------------------------------------------------------------------------------------
async function requireUser(req, res, next) {
  const jwt = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!jwt) return res.status(401).json({ error: "Please sign in to chat." });
  try {
    const userClient = new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setJWT(jwt);
    req.account = await new Account(userClient).get();
    next();
  } catch {
    res.status(401).json({ error: "Your session expired. Please sign in again." });
  }
}

// ---------------------------------------------------------------------------------------
// 2. Cost and abuse limits
// ---------------------------------------------------------------------------------------
const burstLimiter = rateLimit({
  windowMs: 60_000,
  max: 12, // 12 messages a minute per user
  keyGenerator: (req) => req.account.$id,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "You're sending messages very fast. Wait a few seconds and try again." },
});

const daily = new Map(); // userId -> { day, count }
function underDailyLimit(userId) {
  const day = new Date().toISOString().slice(0, 10);
  const e = daily.get(userId);
  if (!e || e.day !== day) {
    daily.set(userId, { day, count: 1 });
    return true;
  }
  if (e.count >= DAILY_LIMIT) return false;
  e.count += 1;
  return true;
}
setInterval(() => {
  const today = new Date().toISOString().slice(0, 10);
  for (const [k, v] of daily) if (v.day !== today) daily.delete(k);
}, 60 * 60_000).unref();

// ---------------------------------------------------------------------------------------
// 3. What the assistant knows: the live menu (cached 5 min) + this user's own recent orders
// ---------------------------------------------------------------------------------------
let shop = { at: 0, menuText: "", extrasText: "", pickupText: "", ids: new Set() };

const list = (table) =>
  adminDb.listDocuments(DB, table, [Query.limit(100)]).then((r) => r.documents);

async function getShopContext() {
  if (Date.now() - shop.at < 5 * 60_000 && shop.menuText) return shop;

  const [menu, cats, customs, pickups] = await Promise.all([
    list(TABLES.menu),
    list(TABLES.categories),
    list(TABLES.customizations),
    list(TABLES.pickup).catch(() => []),
  ]);

  const catName = new Map(cats.map((c) => [c.$id, c.name]));
  const categoryOf = (m) =>
    typeof m.categories === "string" ? catName.get(m.categories) : m.categories?.name;

  const menuText = menu
    .map((m) => {
      const was = Number(m.old_price) > Number(m.price) ? ` (was Ksh ${m.old_price})` : "";
      const bits = [
        `id:${m.$id}`,
        m.name,
        `Ksh ${m.price}${was}`,
        categoryOf(m) || "",
        m.rating ? `rating ${m.rating}` : "",
        m.calories ? `${m.calories} cal` : "",
        m.protein ? `${m.protein}g protein` : "",
        m.description || "",
      ].filter(Boolean);
      return `- ${bits.join(" | ")}`;
    })
    .join("\n");

  const extrasText = ["topping", "side"]
    .map((type) => {
      const rows = customs.filter((c) => String(c.type).toLowerCase() === type);
      return rows.length
        ? `${type === "topping" ? "Toppings" : "Sides"}: ${rows.map((c) => `${c.name} (+Ksh ${c.price})`).join(", ")}`
        : "";
    })
    .filter(Boolean)
    .join("\n");

  const pickupText = pickups.map((p) => `- ${p.name}: ${p.address}`).join("\n");

  shop = { at: Date.now(), menuText, extrasText, pickupText, ids: new Set(menu.map((m) => m.$id)) };
  return shop;
}

const STATUS_TEXT = {
  pending: "payment received, waiting to be confirmed",
  verified: "confirmed",
  processing: "being prepared",
  shipped: "on the way",
  delivered: "delivered",
  cancelled: "cancelled",
  failed: "failed",
};

async function getUserContext(account) {
  const firstName = String(account.name || "").split(" ")[0];

  const users = await adminDb.listDocuments(DB, TABLES.users, [
    Query.equal("accountId", account.$id),
    Query.limit(1),
  ]);
  const row = users.documents[0];
  if (!row) return { firstName, ordersText: "No orders found." };

  let docs;
  try {
    docs = (
      await adminDb.listDocuments(DB, TABLES.orders, [
        Query.equal("userId", row.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(5),
      ])
    ).documents;
  } catch {
    // Some Appwrite versions can't filter on a relationship: filter here instead.
    const all = await adminDb.listDocuments(DB, TABLES.orders, [
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    docs = all.documents
      .filter((o) => (typeof o.userId === "string" ? o.userId : o.userId?.$id) === row.$id)
      .slice(0, 5);
  }

  const ordersText = docs.length
    ? docs
        .map((o) => {
          let items = [];
          try {
            items = JSON.parse(o.items || "[]");
          } catch {}
          const what = items
            .map((it) => {
              const extras = (it.customizations || []).map((c) => c.name).join(", ");
              return `${it.quantity ?? 1}x ${it.name}${extras ? ` (+${extras})` : ""}`;
            })
            .join("; ");
          const status = STATUS_TEXT[String(o.status).toLowerCase()] || o.status;
          return `- #${String(o.$id).slice(-6).toUpperCase()} | ${status} | Ksh ${o.totalPrice} | ${o.$createdAt} | ${what} | deliver to: ${o.address || "n/a"} | M-Pesa receipt: ${o.transactionCode || "n/a"}`;
        })
        .join("\n")
    : "This customer has no orders yet.";

  return { firstName, ordersText };
}

// ---------------------------------------------------------------------------------------
// 4. The assistant's instructions
// ---------------------------------------------------------------------------------------
function buildSystemPrompt(shopCtx, userCtx) {
  return `You are "Plug", the friendly 24/7 AI assistant inside UniPlug, a food ordering app for students (comrades) in Kenya.
${userCtx.firstName ? `You are chatting with ${userCtx.firstName}.` : ""}

WHAT YOU CAN HELP WITH
- The menu: what's available, prices, ratings, calories, protein, spicy picks, budget picks, toppings and sides.
- Their orders: status and details, using ONLY the order list below.
- How things work: payment is an M-Pesa prompt sent to their phone (STK push) after they tap "Order now" in the cart; they choose a delivery point on the home screen; the app shows an estimated delivery time of about 20 to 30 minutes; the delivery fee and total are shown in the cart before paying.

RULES
- Use ONLY the menu, prices and data below. Never invent dishes, prices, discounts, opening hours or delivery promises. If you don't know, say so and point to support.
- You cannot place, change or cancel orders, issue refunds, or move money. For cancellations, refunds, or payment problems, tell them to contact support${SUPPORT_PHONE ? ` on ${SUPPORT_PHONE}` : " using the support button in this chat"} and to have their M-Pesa receipt code ready.
- Never ask for or accept an M-Pesa PIN, password or card details. If the user shares one, tell them not to and to keep it private.
- Order statuses: confirmed = payment received; being prepared; on the way; delivered. Explain these simply.
- Reply in the user's language (English, Kiswahili or Sheng), warm and brief, at most about 80 words. No long lists unless asked.
- When you recommend or mention a specific menu item, write it exactly as [[item:ITEM_ID|Item Name]] using an id from the menu below, so the app can show a button for it.
- Stay on topic (UniPlug, food, orders, payments). Politely steer other requests back.
- You are an AI, not a human. If asked, say so.

MENU (id | name | price | category | rating | nutrition | description)
${shopCtx.menuText || "(menu unavailable right now)"}

EXTRAS
${shopCtx.extrasText || "(none)"}

DELIVERY POINTS
${shopCtx.pickupText || "(not available)"}

THIS CUSTOMER'S RECENT ORDERS (newest first)
${userCtx.ordersText}`;
}

// Keep only item tokens whose id really exists in the menu; otherwise show the plain name.
function sanitizeItemTokens(text, ids) {
  return text.replace(/\[\[item:([^|\]]+)\|([^\]]+)\]\]/g, (m, id, name) =>
    ids.has(id.trim()) ? `[[item:${id.trim()}|${name.trim()}]]` : name.trim(),
  );
}

function cleanMessages(raw) {
  if (!Array.isArray(raw)) return [];
  const out = raw
    .slice(-10)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 500) }));
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

// ---------------------------------------------------------------------------------------
// 5. The endpoint
// ---------------------------------------------------------------------------------------
router.post("/chat", requireUser, burstLimiter, async (req, res) => {
  const messages = cleanMessages(req.body?.messages);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Send a message first." });
  }
  if (!underDailyLimit(req.account.$id)) {
    return res.status(429).json({
      error: "You've reached today's chat limit. Please try again tomorrow or contact support.",
    });
  }

  try {
    const [shopCtx, userCtx] = await Promise.all([getShopContext(), getUserContext(req.account)]);

    const text = await askModel(buildSystemPrompt(shopCtx, userCtx), messages);

    res.json({ reply: sanitizeItemTokens(text, shopCtx.ids) || "Sorry, I didn't catch that. Could you rephrase?" });
  } catch (e) {
    // Log the reason (never the key) so you can see it in Render -> Logs.
    console.error("assistant failed:", e?.status, e?.message);
    res.status(503).json({ error: "The assistant is busy right now. Please try again in a moment." });
  }
});

module.exports = router;