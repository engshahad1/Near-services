// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

// ✅ في pages/api لازم default export (مو GET/POST)
export default NextAuth(authConfig);
