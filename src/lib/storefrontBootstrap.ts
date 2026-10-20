export type StorefrontBootstrap = Record<string, string>;

export function getStorefrontBootstrap(): StorefrontBootstrap {
  if (typeof window === "undefined") return {};
  const source = document.getElementById("fontina-storefront-bootstrap");
  if (!source?.textContent) return {};
  try {
    const parsed = JSON.parse(source.textContent);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string"
      )
    );
  } catch {
    return {};
  }
}
