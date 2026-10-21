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

// Safaricom's STK prompt expires after ~90s if the customer doesn't respond.
const POLL_TIMEOUT_MS = 90_000;
const REQUEST_TIMEOUT_MS = 15_000;

// Polling backs off so many customers paying at once don't hammer the gateway:
// 3s for the first 5 checks, then 5s.
const pollDelay = (attempt: number) => (attempt < 5 ? 3000 : 5000);

// One source of truth for what the cart shows and what gets charged.
// Keep your own real values here.
export const DELIVERY_FEE = 0; //200
export const DISCOUNT = 0;
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

// fetch with a timeout, plus retries for the "server is waking up" errors (502/503/504).
// `retryNetworkErrors` is false for the payment POST: if the request may have reached the
// server, retrying could send a second prompt to the customer's phone.
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  {
    retries = 2,
    retryNetworkErrors = true,
  }: { retries?: number; retryNetworkErrors?: boolean } = {},
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      if ([502, 503, 504].includes(res.status) && attempt < retries) {
        await sleep(1000 * 2 ** attempt); // 1s, 2s
        continue;
      }
      return res;
    } catch (e) {
      clearTimeout(timer);
      lastError = e;
      if (!retryNetworkErrors || attempt === retries) break;
      await sleep(1000 * 2 ** attempt);
    }
  }
  throw lastError ?? new Error("Network request failed");
}

async function getJson(path: string) {
  const res = await fetchWithRetry(`${API_BASE_URL}${path}`, {
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

  let res: Response;
  try {
    res = await fetchWithRetry(
      url,
      {
        method: "POST",
        headers: { ...BASE_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify(params),
      },
      { retryNetworkErrors: false },
    );
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new Error(
        "The payment server is taking too long. Wait a moment and try again.",
      );
    }
    throw e;
  }

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
  let attempt = 0;

  while (Date.now() < deadline) {
    await sleep(pollDelay(attempt++));
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
