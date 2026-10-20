import { NextRequest, NextResponse } from 'next/server';
import { ProductsRepository } from '@/lib/productsRepository';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const product = await ProductsRepository.getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'حدث خطأ أثناء جلب المنتج' },
      { status: 500 }
    );
  }
}
