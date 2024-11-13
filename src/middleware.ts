// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ENV } from '@/utils/env'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    if (path.startsWith('/api')) {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            console.log(`❌ No Authorization header found`)
            return new NextResponse(
                JSON.stringify({ error: 'Missing Authorization header' }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
            console.log(`❌ Invalid Authorization format`)
            return new NextResponse(
                JSON.stringify({ error: 'Invalid Authorization format' }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        if (token !== ENV.API_KEY) {
            console.log(`❌ Invalid API key`)
            return new NextResponse(
                JSON.stringify({ error: 'Invalid API key' }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
