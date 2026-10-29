import { account } from "./appwrite";

// .env:  EXPO_PUBLIC_ASSISTANT_API_URL=https://mpesa-gateway-962a.onrender.com/api/assistant
const API = (process.env.EXPO_PUBLIC_ASSISTANT_API_URL ?? "").replace(/\/+$/, "");

export type ChatTurn = { role: "user" | "assistant"; content: string };

// Appwrite JWTs last 15 minutes: reuse one instead of creating a new one per message.
let jwtCache: { token: string; expiresAt: number } | null = null;

async function getJwt() {
  if (jwtCache && Date.now() < jwtCache.expiresAt) return jwtCache.token;
  const { jwt } = await account.createJWT();
  jwtCache = { token: jwt, expiresAt: Date.now() + 10 * 60_000 };
  return jwt;
}

// Call this when the user signs out so the next user never reuses this token.
export const clearAssistantAuth = () => {
  jwtCache = null;
};

// Render's free tier sleeps when idle. Ping the health route to wake it early.
export const warmUp = () => {
  if (!API) return;
  const healthUrl = API.replace(/\/api\/assistant$/, "/");
  fetch(healthUrl)
    .then((r) => console.log("warmUp status:", r.status))
    .catch((e) => console.log("warmUp failed:", e?.message));
};

export async function sendToAssistant(messages: ChatTurn[]): Promise<string> {
  if (!API) throw new Error("The assistant isn't set up yet. Please try again later.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000); // allows for a cold start

  try {
    console.log("assistant url:", `${API}/chat`);

    // Step 1: Appwrite sign-in token
    let token: string;
    try {
      token = await getJwt();
      console.log("got jwt");
    } catch (e: any) {
      console.log("JWT failed:", e?.message);
      throw new Error("Couldn't verify your sign-in. Check your connection and sign in again.");
    }

    // Step 2: your Render gateway
    let res: Response;
    try {
      console.log("calling gateway...");
      res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: messages.slice(-10) }),
        signal: controller.signal,
      });
    } catch (e: any) {
      if (e?.name === "AbortError") throw e;
      console.log("gateway unreachable:", e?.message);
      throw new Error("Can't reach the assistant server. Check your internet and try again in a moment.");
    }
    console.log("gateway status:", res.status);

    const data = await res.json().catch(() => ({}));
    if (res.status === 401) jwtCache = null; // force a fresh token next time
    if (!res.ok || !data.reply) {
      throw new Error(
        data.error || `The assistant couldn't answer (error ${res.status}). Please try again.`,
      );
    }
    return data.reply as string;
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new Error("The assistant is taking too long. Please try again in a moment.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
