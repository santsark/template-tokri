import Razorpay from 'razorpay';
import crypto from 'crypto';

let _razorpay: Razorpay | null = null;

function getRazorpay() {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    });
  }
  return _razorpay;
}

export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const body = `${params.orderId}|${params.paymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  return expected === params.signature;
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
}

export async function createOrder(amount: number, receipt: string) {
  return getRazorpay().orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt
  });
}

export async function createPaymentLink(params: {
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description: string;
  referenceId: string;
}) {
  const link = await getRazorpay().paymentLink.create({
    amount: params.amount * 100,
    currency: 'INR',
    description: params.description,
    customer: {
      name: params.customerName,
      contact: params.customerPhone,
      email: params.customerEmail
    },
    notify: { sms: true, email: !!params.customerEmail },
    reference_id: params.referenceId
  });
  return link;
}