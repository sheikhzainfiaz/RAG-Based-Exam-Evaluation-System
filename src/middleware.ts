import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value

    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
        const user = JSON.parse(session)
        const path = request.nextUrl.pathname

        if (path.startsWith('/admin') && user.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        if (path.startsWith('/teacher') && user.role !== 'TEACHER') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        if (path.startsWith('/student') && user.role !== 'STUDENT') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    } catch (e) {
        // If JSON parse fails, clear cookie and redirect
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('session')
        return response
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*'],
}
