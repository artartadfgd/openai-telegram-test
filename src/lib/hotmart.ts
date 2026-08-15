const TOKEN_URL = "https://api-sec-vlc.hotmart.com/security/oauth/token";
const SALES_URL = "https://developers.hotmart.com/payments/api/v1/sales/history";

const APPROVED_STATUSES = new Set(["APPROVED", "COMPLETE"]);

let cachedToken: { value: string; expiresAt: number } | null = null;

function getProductIds(): string[] {
  const raw = process.env.HOTMART_PRODUCT_IDS || process.env.HOTMART_PRODUCT_ID || "";
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isHotmartConfigured() {
  return Boolean(process.env.HOTMART_CLIENT_ID && process.env.HOTMART_CLIENT_SECRET && process.env.HOTMART_BASIC_TOKEN && getProductIds().length > 0);
}

function isAllowlisted(email: string): boolean {
  const raw = process.env.HOTMART_ALLOWLIST_EMAILS;
  if (!raw) return false;
  const list = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const clientId = process.env.HOTMART_CLIENT_ID!;
  const clientSecret = process.env.HOTMART_CLIENT_SECRET!;
  const basicToken = process.env.HOTMART_BASIC_TOKEN!.replace(/^Basic\s+/i, "");

  const url = `${TOKEN_URL}?grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Basic ${basicToken}` },
  });
  if (!res.ok) throw new Error("hotmart_auth_failed");
  const data = await res.json();
  const token = data.access_token as string;
  const expiresInMs = (Number(data.expires_in) || 3600) * 1000;
  cachedToken = { value: token, expiresAt: Date.now() + expiresInMs - 30_000 };
  return token;
}

async function hasApprovedPurchase(productId: string, email: string, token: string): Promise<boolean> {
  const url = `${SALES_URL}?product_id=${encodeURIComponent(productId)}&buyer_email=${encodeURIComponent(email)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("hotmart_lookup_failed");
  const data = await res.json();
  const items: Array<{ purchase?: { status?: string } }> = data.items ?? [];
  return items.some((item) => item.purchase?.status && APPROVED_STATUSES.has(item.purchase.status));
}

/**
 * Checks whether an approved (non-refunded/cancelled) Hotmart purchase of any
 * of the configured products (HOTMART_PRODUCT_IDS, comma-separated) exists
 * for this email. Fails OPEN (returns true) when Hotmart credentials aren't
 * configured yet, so the app isn't accidentally locked down before setup is
 * complete. Emails in HOTMART_ALLOWLIST_EMAILS always pass, regardless of
 * purchase status.
 */
export async function verifyPurchase(email: string): Promise<boolean> {
  if (isAllowlisted(email)) return true;
  if (!isHotmartConfigured()) return true;

  const token = await getAccessToken();
  for (const productId of getProductIds()) {
    if (await hasApprovedPurchase(productId, email, token)) return true;
  }
  return false;
}
