import { NextResponse, NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, isValidSessionValue } from '@/lib/adminAuth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/admin/login';
  const isLoginApi = pathname === '/api/admin/login';
  const isProtectedPage = pathname.startsWith('/admin') && !isLoginPage;
  const isProtectedApi = pathname.startsWith('/api/admin') && !isLoginApi;

  if (isProtectedPage || isProtectedApi) {
    const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const valid = await isValidSessionValue(cookie);
    if (!valid) {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
