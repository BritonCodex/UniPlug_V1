// Client for your existing backend (/stkpush, /status/:id, /query/:id).
// Put the URL in .env so dev (ngrok) and production differ without code changes:
//   EXPO_PUBLIC_MPESA_API_URL=https://your-backend-url.com/api/mpesa
const API_BASE_URL = (process.env.EXPO_PUBLIC_MPESA_API_URL ?? "").replace(
  /\/+$/,
  "",
);

// Fail loudly instead of sending payments to an unset or example URL.
if (!API_BASE_URL || API_BASE_URL.includes("your-backend-url")) {
  console.warn(
    "[mpesa] EXPO_PUBLIC_MPESA_API_URL is missing or still the placeholder:",
    API_BASE_URL || "(empty)",
  );
}

const POLL_INTERVAL_MS = 3000;
// Safaricom's STK prompt expires after ~90s if the customer doesn't respond.
const POLL_TIMEOUT_MS = 90_000;

// One source of truth for what the cart shows and what gets charged.
export const DELIVERY_FEE = 200;
export const DISCOUNT = 10;
export const computeTotal = (subtotal: number) =>
  subtotal > 0
    ? Math.max(0, Math.round(subtotal + DELIVERY_FEE - DISCOUNT))
    : 0; // whole shillings; no fees on an empty cart

// 0712345678, 0112345678, +254712345678, 254712345678 -> 254712345678
export const normalizePhone = (input: string): string | null => {
  const m = input.replace(/[\s-]/g, "").match(/^(?:\+?254|0)?([17]\d{8})$/);
  return m ? `254${m[1]}` : null;
};

export type PaymentOutcome =
  | { status: "success"; receipt?: string }
  | { status: "failed"; message: string }
  | { status: "timeout" };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Free ngrok URLs return an HTML warning page unless this header is sent.
// Harmless on a real backend.
const BASE_HEADERS = { "ngrok-skip-browser-warning": "true" };

async function getJson(path: string) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: BASE_HEADERS,
  });
  return res.json();
}

export async function startStkPush(params: {
  phone: string;
  amount: number;
  accountReference?: string;
  description?: string;
}): Promise<string> {
  if (!API_BASE_URL || API_BASE_URL.includes("your-backend-url")) {
    throw new Error(
      "Payment server URL isn't set. Check EXPO_PUBLIC_MPESA_API_URL and restart Expo.",
    );
  }
  const url = `${API_BASE_URL}/stkpush`;
  const res = await fetch(url, {
    method: "POST",
    headers: { ...BASE_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  // Read as text first so an HTML/empty reply doesn't get swallowed.
  const raw = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(raw);
  } catch {
    // not JSON
  }

  if (__DEV__) {
    console.log("[mpesa] POST", url, "->", res.status, raw.slice(0, 500));
    console.log("[mpesa] sent", JSON.stringify(params));
  }

  const checkoutRequestId = data.checkoutRequestId ?? data.CheckoutRequestID;
  if (!res.ok || !checkoutRequestId) {
    throw new Error(
      data.error ||
        data.message ||
        `Could not start the payment (server replied ${res.status}).`,
    );
  }
  return checkoutRequestId as string;
}

// Polls /status until the callback lands, then falls back to one direct /query.
// Pass isCancelled so polling stops if the screen unmounts mid-payment.
export async function waitForPayment(
  checkoutRequestId: string,
  isCancelled: () => boolean = () => false,
): Promise<PaymentOutcome> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);
    if (isCancelled()) return { status: "timeout" };

    try {
      const data = await getJson(`/status/${checkoutRequestId}`);
      if (data.status === "success") {
        return {
          status: "success",
          receipt: data.mpesaReceiptNumber || undefined,
        };
      }
      if (data.status === "failed") {
        return {
          status: "failed",
          message: data.resultDesc || "Payment was not completed.",
        };
      }
      // "pending": keep polling
    } catch {
      // transient network error: keep trying until the deadline
    }
  }

  // The callback can arrive late, so ask Safaricom directly before giving up.
  try {
    const q = await getJson(`/query/${checkoutRequestId}`);
    const code = q?.ResultCode;
    if (code === "0" || code === 0) return { status: "success" };
    if (code !== undefined && code !== null) {
      return {
        status: "failed",
        message: q?.ResultDesc || "Payment was not completed.",
      };
    }
  } catch {
    // fall through to timeout
  }

  return { status: "timeout" };
}
