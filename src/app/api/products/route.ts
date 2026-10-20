import { NextRequest, NextResponse } from 'next/server';
import { ProductsRepository } from '@/lib/productsRepository';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const sortBy = (searchParams.get('sortBy') as any) || undefined;

  try {
    const products = await ProductsRepository.getAllProducts({
      category,
      search,
      sortBy,
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'فشل جلب المنتجات' },
      { status: 500 }
    );
  }
}
