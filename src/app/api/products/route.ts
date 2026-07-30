import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('q');

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category && category !== 'All' ? { category: category as any } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { regionLanguage: { contains: search, mode: 'insensitive' } },
              { tags: { hasSome: [search] } }
            ]
          }
        : {})
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(products);
}
