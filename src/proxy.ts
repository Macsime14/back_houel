import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Instance NextAuth dédiée à l'edge runtime : basée uniquement sur la config
// sans provider Credentials (voir src/lib/auth.config.ts), donc sans Prisma
// ni bcrypt. Ne remplace pas src/lib/auth.ts, utilisé côté route handlers.
const { auth } = NextAuth(authConfig);

// Protège toutes les routes métier de l'API : seules /api/auth/* (login) et
// /api/health restent publiques.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = pathname.startsWith("/api/auth") || pathname === "/api/health";

  if (!isPublic && !req.auth) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
});

export const config = {
  matcher: ["/api/:path*"],
};
