import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
  const category = await prisma.category.create({ data: { name: name.trim(), slug } });
  return NextResponse.json(category);
}