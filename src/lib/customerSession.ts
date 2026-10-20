export type CustomerSession = {
  id: number;
  fullName: string;
  email: string | null;
  phoneE164: string;
  countryCode: string;
  city: string | null;
  address: string | null;
};

/**
 * An explicit client-side authentication result is newer than a concurrent
 * `me` request. This prevents an in-flight anonymous response from briefly
 * replacing a just-authenticated customer's UI state.
 */
export function resolveCustomerSession(
  serverCustomer: CustomerSession | null | undefined,
  sessionOverride: CustomerSession | null | undefined
): CustomerSession | null {
  return sessionOverride === undefined
    ? (serverCustomer ?? null)
    : sessionOverride;
}

export function canUseCustomerOnlyOperations(
  customer: CustomerSession | null,
  sessionReady: boolean
): boolean {
  return Boolean(customer) && sessionReady;
}
