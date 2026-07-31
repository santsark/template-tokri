import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const data = await request.json();

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.regionLanguage !== undefined && { regionLanguage: data.regionLanguage }),
      ...(data.track !== undefined && { track: data.track }),
      ...(data.price !== undefined && { price: parseInt(data.price, 10) }),
      ...(data.images !== undefined && { images: data.images }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.isSeasonal !== undefined && { isSeasonal: data.isSeasonal })
    }
  });

  return NextResponse.json(product);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
