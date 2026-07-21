import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "insureflow_access_token";
const PUBLIC_PATHS = new Set(["/login", "/accept-invitation"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(ACCESS_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.has(pathname);

  if (!hasSession && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
