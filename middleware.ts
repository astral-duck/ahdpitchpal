import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Paths that require authentication and profile completeness
const protectedPaths = [
  '/chat',
  '/admin',
  '/admin-dashboard',
  '/api/chat',
  '/api/blob',
  '/api/create-user',
  '/api/invite-user',
  '/api/list-users',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files, login, and complete-profile without checks
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/complete-profile') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Only check protected paths
  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Use Supabase Auth Helpers to get user session
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Profile completeness check for /chat only
  if (pathname.startsWith('/chat')) {
    // Query the profile table for first_name and last_name
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();
    if (
      profileError ||
      !profile ||
      !profile.first_name ||
      !profile.last_name
    ) {
      const completeProfileUrl = req.nextUrl.clone();
      completeProfileUrl.pathname = '/complete-profile';
      return NextResponse.redirect(completeProfileUrl);
    }
  }

  // Admin gating for /admin and /admin-dashboard
  if (pathname.startsWith('/admin') || pathname.startsWith('/admin-dashboard')) {
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    if (roleError || !userRole || userRole.role !== 'admin') {
      // Authenticated but not admin: redirect to /chat
      const chatUrl = req.nextUrl.clone();
      chatUrl.pathname = '/chat';
      return NextResponse.redirect(chatUrl);
    }
  }

  // All checks passed
  return res;
}

// PATCHED MATCHER: Exclude static, images, public, login, complete-profile, auth
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|public|api/auth|login|complete-profile).*)',
  ],
};
