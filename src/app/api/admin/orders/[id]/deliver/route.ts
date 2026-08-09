import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadPrivateFile, getSignedDownloadUrl } from '@/lib/blob';
import { sendEmail } from '@/lib/brevo';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await context.params;
  const form = await request.formData();
  const file = form.get('file') as File | null;
  const orderItemId = form.get('orderItemId') as string | null;

  if (!file || !orderItemId) {
    return NextResponse.json({ error: 'Missing file or orderItemId' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } }
  });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const orderItem = order.items.find((i) => i.id === orderItemId);
  if (!orderItem) return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
  const itemTitle = orderItem.product?.title || orderItem.customTitle || 'Your design';

  const pathname = `deliveries/${orderId}/${orderItemId}-${file.name}`;
  await uploadPrivateFile(pathname, file);

  await prisma.orderItem.update({
    where: { id: orderItemId },
    data: { deliveredFileUrl: pathname }
  });

  // Mark the order delivered once every item has a delivered file.
  const updatedOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  const allDelivered = updatedOrder?.items.every((i) => i.deliveredFileUrl);
  if (allDelivered) {
    await prisma.order.update({ where: { id: orderId }, data: { status: 'DELIVERED' } });
  }

  if (order.customerEmail) {
    const downloadUrl = await getSignedDownloadUrl(pathname);
    await sendEmail({
      to: [{ email: order.customerEmail, name: order.customerName }],
      subject: `Your ${itemTitle} is ready! — Template Tokri`,
      htmlContent: `<p>Hi ${order.customerName},</p><p>Your personalised <strong>${itemTitle}</strong> is ready! Download it here:</p><p><a href="${downloadUrl}">${downloadUrl}</a></p><p>This link is valid for 7 days — if it expires, just reply to this email or WhatsApp us and we'll send a fresh one.</p><p>Thank you for choosing Template Tokri!</p>`
    });
  }

  return NextResponse.json({ success: true });
}