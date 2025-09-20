import { NextAuthOptions } from "next-auth";
import { providers } from "./providers";

export const authConfig: NextAuthOptions = {
  providers,
  pages: {
    signIn: "/auth/login", // صفحة تسجيل الدخول
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 يوم
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
