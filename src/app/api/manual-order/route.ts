import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyAdminOfNewOrder } from '@/lib/brevo';

// Temporary: creates an order without going through Razorpay's order-creation
// API, for use while live API keys are pending verification. Order sits as
// PENDING_PAYMENT until the admin manually confirms payment (sent via a
// Razorpay Payment Link outside this flow) and updates the status.
export async function POST(request: Request) {
  const body = await request.json();
  const { customerName, customerPhone, customerEmail, items } = body;

  if (!customerName || !customerPhone || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  let totalAmount = 0;
  const orderItemsData = items.map((item: any) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product || !product.isActive) {
      throw new Error(`Product ${item.productId} not available`);
    }
    const lineTotal = product.price * item.quantity;
    totalAmount += lineTotal;
    return {
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.price,
      inputDetails: item.inputDetails || '',
      referenceImageUrl: item.referenceImageUrl || null
    };
  });

  const order = await prisma.order.create({
    data: {
      customerName,
      customerPhone,
      customerEmail,
      totalAmount,
      status: 'PENDING_PAYMENT',
      notes: 'Placed during temporary manual-payment mode — send Razorpay payment link and confirm manually.',
      items: { create: orderItemsData }
    }
  });

  await notifyAdminOfNewOrder(
    `MANUAL PAYMENT NEEDED — Order ${order.id} — ₹${totalAmount} — ${customerName} (${customerPhone}). Send them the Razorpay payment link directly.`
  );

  return NextResponse.json({ orderId: order.id, amount: totalAmount });
}