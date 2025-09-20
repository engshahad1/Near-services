import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const providers = [
  // 🔐 تسجيل الدخول بالبريد/كلمة المرور
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "البريد الإلكتروني", type: "email" },
      password: { label: "كلمة المرور", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      // تحقق بسيط - استبدل لاحقاً بـ Prisma
      if (
        credentials.email === "admin@example.com" &&
        credentials.password === "123456"
      ) {
        return {
          id: "1",
          name: "مدير النظام",
          email: "admin@example.com",
          role: "admin",
        };
      }

      return null;
    },
  }),

  // 🟣 تسجيل الدخول عبر GitHub
  GitHubProvider({
    clientId: process.env.GITHUB_ID || "",
    clientSecret: process.env.GITHUB_SECRET || "",
  }),

  // 🔵 تسجيل الدخول عبر Google
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  }),
];
