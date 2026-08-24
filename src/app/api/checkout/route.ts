import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createOrder } from '@/lib/razorpay';

// Expected body:
// {
//   customerName, customerPhone, customerEmail?,
//   items: [{ productId, quantity, inputDetails, referenceImageUrl? }]
// }
export async function POST(request: Request) {
  const body = await request.json();
  const { customerName, customerPhone, customerEmail, items } = body;

  if (!customerName || !customerPhone || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Re-fetch prices from the DB — never trust prices sent from the client.
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
      items: { create: orderItemsData }
    }
  });

  const razorpayOrder = await createOrder(totalAmount, order.id);

  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: razorpayOrder.id }
  });

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: totalAmount,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID
  });
}
