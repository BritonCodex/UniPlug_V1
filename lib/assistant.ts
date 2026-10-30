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

export async function sendToAssistant(messages: ChatTurn[]): Promise<string> {
  if (!API) throw new Error("The assistant isn't set up yet. Please try again later.");

  const controller = new AbortController();
  // A sleeping free Render service can take up to a minute to wake up.
  const timer = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getJwt()}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ messages: messages.slice(-10) }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));
    if (res.status === 401) jwtCache = null; // force a fresh token next time
    if (!res.ok || !data.reply) {
      throw new Error(data.error || "The assistant couldn't answer just now. Please try again.");
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