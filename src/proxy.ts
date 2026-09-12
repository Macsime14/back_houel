import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Instance NextAuth dédiée à l'edge runtime : basée uniquement sur la config
// sans provider Credentials (voir src/lib/auth.config.ts), donc sans Prisma
// ni bcrypt. Ne remplace pas src/lib/auth.ts, utilisé côté route handlers.
const { auth } = NextAuth(authConfig);

// Protège les routes API (401 JSON) et les pages du dashboard (redirect vers
// /login). Seules /api/auth/*, /api/health et /login restent publiques.
export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) {
    const isPublicApi = pathname.startsWith("/api/auth") || pathname === "/api/health";
    if (!isPublicApi && !req.auth) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return;
  }

  if (pathname.startsWith("/dashboard") && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && req.auth) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/login"],
};
