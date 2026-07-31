import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const data = await request.json();

  const product = await prisma.product.create({
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description,
      category: data.category,
      regionLanguage: data.regionLanguage,
      track: data.track,
      price: parseInt(data.price, 10),
      images: data.images || [],
      tags: data.tags || [],
      isActive: data.isActive ?? true,
      isSeasonal: data.isSeasonal ?? false
    }
  });

  return NextResponse.json(product);
}
