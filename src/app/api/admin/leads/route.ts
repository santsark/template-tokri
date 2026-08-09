import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const leads = await prisma.customOrderLead.findMany({
    orderBy: { createdAt: 'desc' },
    include: { convertedOrder: true }
  });
  return NextResponse.json(leads);
}