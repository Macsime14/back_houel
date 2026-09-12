import type { NextAuthConfig } from "next-auth";

const SESSION_MAX_AGE_REMEMBERED = 60 * 60 * 24 * 30; // 30 jours
const SESSION_MAX_AGE_DEFAULT = 60 * 60 * 24; // 1 jour

// Config "edge-safe" : ne contient aucun provider ni callback qui dépend de
// modules Node.js (Prisma, bcrypt...), car elle tourne dans le proxy/edge
// runtime (voir src/proxy.ts). La config complète avec le provider
// Credentials vit dans src/lib/auth.ts et ne s'exécute que côté route
// handlers (runtime Node classique).
export const authConfig = {
  // Plafond global du cookie/JWT (session "mémorisée"). Auth.js recalcule
  // systématiquement l'expiration du cookie à partir de cette valeur statique
  // à chaque requête (voir @auth/core/lib/actions/session.js), donc un `exp`
  // personnalisé posé sur le token serait ignoré et écrasé au prochain appel.
  // Pour une session "non mémorisée" plus courte, on invalide donc
  // manuellement le token ci-dessous plutôt que de jouer sur son `exp`.
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_REMEMBERED },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.role = user.role;
        token.id = user.id;
        token.rememberMe = Boolean(user.rememberMe);
        token.loginAt = Math.floor(Date.now() / 1000);
        return token;
      }

      // Requêtes suivantes (pas de `user`) : si la session n'est pas
      // "mémorisée" et dépasse la durée réduite, on la fait expirer en
      // renvoyant null — Auth.js supprime alors le cookie (déconnexion).
      if (!token.rememberMe && typeof token.loginAt === "number") {
        const age = Math.floor(Date.now() / 1000) - token.loginAt;
        if (age > SESSION_MAX_AGE_DEFAULT) {
          return null;
        }
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
