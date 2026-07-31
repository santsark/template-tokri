import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const data = await request.json();

  const lead = await prisma.customOrderLead.update({
    where: { id },
    data: {
      ...(data.status !== undefined && { status: data.status })
    }
  });

  return NextResponse.json(lead);
}
