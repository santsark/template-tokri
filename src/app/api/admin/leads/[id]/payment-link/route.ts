import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPaymentLink } from '@/lib/razorpay';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { amount } = await request.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'A valid amount is required' }, { status: 400 });
  }

  const lead = await prisma.customOrderLead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const link = await createPaymentLink({
    amount,
    customerName: lead.name,
    customerPhone: lead.phone,
    customerEmail: lead.email || undefined,
    description: `${lead.occasion} custom design — Template Tokri`,
    referenceId: lead.id
  });

  await prisma.customOrderLead.update({
    where: { id },
    data: { paymentLinkUrl: link.short_url, paymentLinkId: link.id }
  });

  return NextResponse.json({ paymentLinkUrl: link.short_url });
}