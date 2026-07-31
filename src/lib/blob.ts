import { put, issueSignedToken, presignUrl } from '@vercel/blob';

const PVT_TOKEN = process.env.tt_pvt_READ_WRITE_TOKEN;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function uploadPrivateFile(pathname: string, file: File) {
  const blob = await put(pathname, file, {
    access: 'private',
    token: PVT_TOKEN
  });
  // We store the pathname, not the raw URL — private blob URLs aren't
  // accessible on their own, so a fresh signed link is minted whenever needed.
  return blob.pathname;
}

/**
 * Mints a link the customer can use to download their file, valid for up to
 * 7 days (the maximum Vercel currently allows). If they miss the window,
 * the admin can re-send using the stored pathname to generate a new one.
 */
export async function getSignedDownloadUrl(pathname: string) {
  const token = await issueSignedToken({
    pathname,
    operations: ['get'],
    validUntil: Date.now() + SEVEN_DAYS_MS,
    token: PVT_TOKEN
  });
  const { presignedUrl } = await presignUrl(token, {
    operation: 'get',
    pathname,
    access: 'private',
    validUntil: Date.now() + SEVEN_DAYS_MS
  });
  return presignedUrl;
}