export function prepareStorefrontCurrencyConfigSync(
  previousSignature: string | null,
  config: unknown
) {
  const signature = JSON.stringify(config);
  return { signature, shouldPersist: signature !== previousSignature };
}
