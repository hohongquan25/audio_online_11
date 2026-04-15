import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "USER" | "VIP" | "ADMIN";
      vipExpiredAt: Date | null;
      code: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: "USER" | "VIP" | "ADMIN";
    vipExpiredAt: Date | null;
    code: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        // Check if user is banned
        if (user.isBanned) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          vipExpiredAt: user.vipExpiredAt,
          code: user.code,
          isBanned: user.isBanned,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.role = (user as any).role;
        token.vipExpiredAt = (user as any).vipExpiredAt;
        token.code = (user as any).code;
      }

      // Always refresh role and vipExpiredAt from DB to catch admin promotions and VIP changes
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true, vipExpiredAt: true, code: true, isBanned: true },
          });
          if (dbUser) {
            // Check if user is banned - force logout
            if (dbUser.isBanned) {
              return null as any; // This will invalidate the token
            }

            token.role = dbUser.role as "USER" | "VIP" | "ADMIN";
            token.vipExpiredAt = dbUser.vipExpiredAt;
            token.code = dbUser.code;

            // Check VIP expiration
            if (
              dbUser.role === "VIP" &&
              dbUser.vipExpiredAt &&
              new Date(dbUser.vipExpiredAt) < new Date()
            ) {
              await prisma.user.update({
                where: { id: token.id },
                data: { role: "USER", vipExpiredAt: null },
              });
              token.role = "USER";
              token.vipExpiredAt = null;
            }
          }
        } catch {
          // Keep existing token values on DB error
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = (token.id as string) || "";
      session.user.email = (token.email as string) || "";
      session.user.role = (token.role as any) || "USER";
      session.user.vipExpiredAt = (token.vipExpiredAt as any) || null;
      session.user.code = token.code;
      return session;
    },
  },
});
