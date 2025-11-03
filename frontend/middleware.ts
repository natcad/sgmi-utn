import { NextResponse  } from "next/server";
import { NextRequest } from "next/server";

export function middleware(req: NextRequest){
    const token = req.cookies.get('token')?.value || '';
    const isAuthRoute = req.nextUrl.pathname.startsWith('/login');

    if( token && isAuthRoute){
        return NextResponse.redirect(new URL('/grupos',req.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|register).*)'],
};

