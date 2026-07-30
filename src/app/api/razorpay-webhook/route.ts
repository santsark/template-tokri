import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { notifyAdminOfNewOrder } from '@/lib/brevo';

// Configure this exact URL in the Razorpay dashboard:
// Settings -> Webhooks -> Add new webhook -> https://<your-domain>/api/razorpay-webhook
// Subscribe to the "payment.captured" event.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature') || '';

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const razorpayOrderId = payment.order_id;

    const order = await prisma.order.update({
      where: { razorpayOrderId },
      data: {
        status: 'PAID',
        razorpayPaymentId: payment.id
      },
      include: { items: { include: { product: true } } }
    });

    const summary = `Order ${order.id} paid — ₹${order.totalAmount} — ${order.customerName} (${order.customerPhone}). Items: ${order.items
      .map((i) => `${i.product.title} x${i.quantity}`)
      .join(', ')}`;
    await notifyAdminOfNewOrder(summary);
  }

  return NextResponse.json({ received: true });
}
