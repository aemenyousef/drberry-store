export function buildProductInquiryMessage(input: {
  title: string;
  formattedPrice: string;
  productUrl: string;
  sku?: string | null;
}) {
  return [
    "مرحباً، أود الاستفسار عن هذا الفستان من فونتينا.",
    `الفستان: ${input.title}`,
    `السعر: ${input.formattedPrice}`,
    input.sku ? `رمز المنتج: ${input.sku}` : null,
    `رابط المنتج: ${input.productUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}
