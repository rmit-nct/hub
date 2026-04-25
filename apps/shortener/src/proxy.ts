import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(_req: NextRequest): NextResponse {
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
