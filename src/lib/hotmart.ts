const TOKEN_URL = "https://api-sec-vlc.hotmart.com/security/oauth/token";
const SALES_URL = "https://developers.hotmart.com/payments/api/v1/sales/history";

const APPROVED_STATUSES = new Set(["APPROVED", "COMPLETE"]);

let cachedToken: { value: string; expiresAt: number } | null = null;

export function isHotmartConfigured() {
  return Boolean(process.env.HOTMART_CLIENT_ID && process.env.HOTMART_CLIENT_SECRET && process.env.HOTMART_BASIC_TOKEN && process.env.HOTMART_PRODUCT_ID);
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

/**
 * Checks whether an approved (non-refunded/cancelled) Hotmart purchase of the
 * configured product exists for this email. Fails OPEN (returns true) when
 * Hotmart credentials aren't configured yet, so the app isn't accidentally
 * locked down before setup is complete.
 */
export async function verifyPurchase(email: string): Promise<boolean> {
  if (!isHotmartConfigured()) return true;

  const productId = process.env.HOTMART_PRODUCT_ID!;
  const token = await getAccessToken();

  const url = `${SALES_URL}?product_id=${encodeURIComponent(productId)}&buyer_email=${encodeURIComponent(email)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("hotmart_lookup_failed");
  const data = await res.json();
  const items: Array<{ purchase?: { status?: string } }> = data.items ?? [];
  return items.some((item) => item.purchase?.status && APPROVED_STATUSES.has(item.purchase.status));
}
