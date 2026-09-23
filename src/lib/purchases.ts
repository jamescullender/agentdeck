import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import { PRO_ENTITLEMENT, REVENUECAT_KEY } from './config';

// Subscriptions are handled by RevenueCat, which wraps StoreKit (App Store)
// and Google Play Billing behind one API and gives the server a way to verify
// entitlements. Without a key (e.g. local dev) purchases are disabled.

export const purchasesEnabled = REVENUECAT_KEY !== '' && Platform.OS !== 'web';

let configured = false;
const listeners = new Set<(isPro: boolean) => void>();
let lastIsPro = false;

function emit(info: CustomerInfo) {
  lastIsPro = PRO_ENTITLEMENT in info.entitlements.active;
  listeners.forEach((l) => l(lastIsPro));
}

export function initPurchases() {
  if (!purchasesEnabled || configured) return;
  Purchases.configure({ apiKey: REVENUECAT_KEY });
  configured = true;
  Purchases.addCustomerInfoUpdateListener(emit);
  Purchases.getCustomerInfo().then(emit).catch(() => {});
}

/** Stable anonymous ID the server uses for usage quotas and entitlement checks. */
export async function getUserId(fallback: string): Promise<string> {
  if (!configured) return fallback;
  try {
    return await Purchases.getAppUserID();
  } catch {
    return fallback;
  }
}

export function useIsPro(): boolean {
  const [isPro, setIsPro] = useState(lastIsPro);
  useEffect(() => {
    listeners.add(setIsPro);
    return () => {
      listeners.delete(setIsPro);
    };
  }, []);
  return isPro;
}

export async function getPackages(): Promise<PurchasesPackage[]> {
  if (!configured) return [];
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

/** Returns true if the purchase completed, false if the user cancelled. */
export async function buy(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    emit(customerInfo);
    return PRO_ENTITLEMENT in customerInfo.entitlements.active;
  } catch (e) {
    if ((e as { userCancelled?: boolean }).userCancelled) return false;
    throw e;
  }
}

export async function restore(): Promise<boolean> {
  if (!configured) return false;
  const info = await Purchases.restorePurchases();
  emit(info);
  return PRO_ENTITLEMENT in info.entitlements.active;
}
