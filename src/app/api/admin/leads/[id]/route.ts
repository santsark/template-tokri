import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const data = await request.json();

  const lead = await prisma.customOrderLead.update({
    where: { id: params.id },
    data: {
      ...(data.status !== undefined && { status: data.status })
    }
  });

  return NextResponse.json(lead);
}
