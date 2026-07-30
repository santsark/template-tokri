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
