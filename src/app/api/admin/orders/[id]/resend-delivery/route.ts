import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSignedDownloadUrl } from '@/lib/blob';
import { sendEmail } from '@/lib/brevo';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await context.params;
  const { orderItemId } = await request.json();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } }
  });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const orderItem = order.items.find((i) => i.id === orderItemId);
  if (!orderItem?.deliveredFileUrl) {
    return NextResponse.json({ error: 'No delivered file found for this item yet' }, { status: 400 });
  }
  if (!order.customerEmail) {
    return NextResponse.json({ error: 'No email on file for this order' }, { status: 400 });
  }

  const downloadUrl = await getSignedDownloadUrl(orderItem.deliveredFileUrl);
  await sendEmail({
    to: [{ email: order.customerEmail, name: order.customerName }],
    subject: `Your ${orderItem.product.title} — download link (resent) — Template Tokri`,
    htmlContent: `<p>Hi ${order.customerName},</p><p>Here's a fresh download link for your <strong>${orderItem.product.title}</strong>:</p><p><a href="${downloadUrl}">${downloadUrl}</a></p><p>This link is valid for 7 days.</p><p>Thank you for choosing Template Tokri!</p>`
  });

  return NextResponse.json({ success: true });
}