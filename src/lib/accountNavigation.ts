export const CUSTOMER_ACCOUNT_TABS = [
  "overview",
  "profile",
  "addresses",
  "orders",
  "invoices",
  "favorites",
  "tracking",
] as const;
export type CustomerAccountTab = (typeof CUSTOMER_ACCOUNT_TABS)[number];

export function customerAccountTabFromLocation(
  location: string
): CustomerAccountTab {
  const query = location.includes("?")
    ? location.slice(location.indexOf("?") + 1)
    : "";
  const requestedTab = new URLSearchParams(query).get("tab");
  return CUSTOMER_ACCOUNT_TABS.includes(requestedTab as CustomerAccountTab)
    ? (requestedTab as CustomerAccountTab)
    : "overview";
}

export function customerAccountTabHref(tab: CustomerAccountTab): string {
  return tab === "overview" ? "/account" : `/account?tab=${tab}`;
}
