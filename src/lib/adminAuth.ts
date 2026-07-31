import crypto from 'crypto';

const COOKIE_NAME = 'tt_admin_session';

function expectedToken() {
  return crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD || '').digest('hex');
}

export function checkPassword(input: string) {
  return input === process.env.ADMIN_PASSWORD;
}

export function sessionCookie() {
  return {
    name: COOKIE_NAME,
    value: expectedToken(),
    options: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  };
}

export function isValidSessionValue(value: string | undefined) {
  if (!value) return false;
  return value === expectedToken();
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
