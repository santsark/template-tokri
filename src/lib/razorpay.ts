import Razorpay from 'razorpay';
import crypto from 'crypto';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

/**
 * Verifies the signature Razorpay sends on the checkout success callback.
 * NEVER mark an order as paid from the client redirect alone — always
 * verify server-side, either here or via the webhook handler.
 */
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

/**
 * Verifies the signature on incoming Razorpay webhook events.
 * This uses a separate webhook secret configured in the Razorpay dashboard,
 * not the API key secret.
 */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
}

/**
 * Creates a Razorpay Payment Link for a custom order lead — a shareable
 * link for a specific amount (full or partial advance) that the admin
 * sends manually via WhatsApp/email. Doesn't require the customer to
 * visit the site.
 */
export async function createPaymentLink(params: {
  amount: number; // whole rupees
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description: string;
  referenceId: string;
}) {
  const link = await razorpay.paymentLink.create({
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
