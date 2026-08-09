import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const data = await request.json();

  const lead = await prisma.customOrderLead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const updated = await prisma.customOrderLead.update({
    where: { id },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.amountQuoted !== undefined && { amountQuoted: parseInt(data.amountQuoted, 10) })
    }
  });

  // Auto-create a linked Order the first time a lead is marked Converted.
  // From here, delivery tracking happens on the Order itself (PAID -> IN_PROGRESS -> DELIVERED).
  if (data.status === 'CONVERTED' && !lead.convertedOrderId) {
    const totalAmount = updated.amountQuoted ?? 0;
    const order = await prisma.order.create({
      data: {
        customerName: updated.name,
        customerPhone: updated.phone,
        customerEmail: updated.email,
        status: 'PAID',
        totalAmount,
        notes: `Converted from custom order lead (${updated.occasion}).`,
        items: {
          create: [
            {
              customTitle: `${updated.occasion} — Custom Design`,
              quantity: 1,
              unitPrice: totalAmount,
              inputDetails: updated.freeText || JSON.stringify(updated.occasionDetails || {})
            }
          ]
        }
      }
    });

    await prisma.customOrderLead.update({
      where: { id },
      data: { convertedOrderId: order.id }
    });
  }

  const final = await prisma.customOrderLead.findUnique({
    where: { id },
    include: { convertedOrder: true }
  });

  return NextResponse.json(final);
}