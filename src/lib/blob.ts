import { put } from '@vercel/blob';

const PRIVATE_BLOB_TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN_PVT ||
  process.env.BLOB_READ_WRITE_TOKEN_PRIVATE ||
  process.env.tt_blob_pvt_READ_WRITE_TOKEN;

export async function uploadPrivateBlob(file: File, folder: string) {
  if (!PRIVATE_BLOB_TOKEN) {
    throw new Error('Missing private blob token: set BLOB_READ_WRITE_TOKEN_PVT in environment variables.');
  }

  const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
    access: 'private',
    token: PRIVATE_BLOB_TOKEN
  });

  return blob.url;
}

export async function uploadOrderDeliveryBlob(file: File, orderId: string, itemId?: string) {
  const folder = itemId
    ? `orders/${orderId}/items/${itemId}`
    : `orders/${orderId}`;

  return uploadPrivateBlob(file, folder);
}
