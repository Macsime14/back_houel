import type { NextAuthConfig } from "next-auth";

// Config "edge-safe" : ne contient aucun provider ni callback qui dépend de
// modules Node.js (Prisma, bcrypt...), car elle tourne dans le proxy/edge
// runtime (voir src/proxy.ts). La config complète avec le provider
// Credentials vit dans src/lib/auth.ts et ne s'exécute que côté route
// handlers (runtime Node classique).
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "OWNER" | "EMPLOYEE";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
