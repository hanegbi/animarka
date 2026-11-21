import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Render links are signed, so only the worker (which holds the secret) can open the print route.
 * Dev uses a fixed dev value; production refuses to run without RENDER_SECRET.
 */
function secret(): string {
  const s = process.env.RENDER_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SHOW_DESIGN)
    throw new Error("RENDER_SECRET is not set");
  return "dev-only-render-secret";
}

export function renderToken(id: string, width: number, kind: string): string {
  return createHmac("sha256", secret()).update(`${id}.${width}.${kind}`).digest("hex");
}

export function validToken(id: string, width: number, kind: string, token: string | undefined): boolean {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return false;
  const want = Buffer.from(renderToken(id, width, kind), "hex");
  const got = Buffer.from(token, "hex");
  return want.length === got.length && timingSafeEqual(want, got);
}
