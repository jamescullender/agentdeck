// Verifies a user's Pro entitlement against RevenueCat, so the app can't
// simply claim to be Pro. Uses the secret (server-side) RevenueCat API key.

const RC_SECRET = process.env.REVENUECAT_SECRET_KEY;
const ENTITLEMENT = process.env.REVENUECAT_ENTITLEMENT ?? 'pro';

type Subscriber = {
  subscriber: { entitlements: Record<string, { expires_date: string | null }> };
};

export async function isPro(userId: string): Promise<boolean> {
  if (!RC_SECRET) return false;
  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${RC_SECRET}` },
  });
  if (!res.ok) return false;
  const data = (await res.json()) as Subscriber;
  const ent = data.subscriber.entitlements[ENTITLEMENT];
  if (!ent) return false;
  // A null expiry means a lifetime purchase.
  return ent.expires_date === null || new Date(ent.expires_date).getTime() > Date.now();
}
