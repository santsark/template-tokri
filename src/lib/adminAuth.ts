const COOKIE_NAME = 'tt_admin_session';

async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function expectedToken() {
  return sha256(process.env.ADMIN_PASSWORD || '');
}

export function checkPassword(input: string) {
  return input === process.env.ADMIN_PASSWORD;
}

export async function sessionCookie() {
  return {
    name: COOKIE_NAME,
    value: await expectedToken(),
    options: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  };
}

export async function isValidSessionValue(value: string | undefined) {
  if (!value) return false;
  return value === (await expectedToken());
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
