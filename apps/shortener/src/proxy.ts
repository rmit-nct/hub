import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function proxy(req: NextRequest): Promise<NextResponse> {
  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
