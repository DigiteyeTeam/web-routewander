import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";

/**
 * NextAuth config — ใช้ใน route handler และ getServerSession (lib/auth.ts)
 * session.user.id = "{provider}{sub}" (เช่น google{googleSub})
 * ใช้เป็นหัวข้อหลักในการค้นหา user ใน DB รองรับอนาคตหลาย provider (Apple ฯลฯ)
 */
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? process.env.FIREBASE_GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? process.env.FIREBASE_GOOGLE_CLIENT_SECRET ?? "",
    }),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? [
          AppleProvider({
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account?.providerAccountId) token.uid = account.providerAccountId;
      if (profile?.sub) token.sub = profile.sub;
      if (account?.provider) token.provider = account.provider;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const provider = (token.provider as string | undefined) ?? "google";
        const subOrUid = (token.sub ?? token.uid) as string;
        session.user.id = `${provider}${subOrUid}`;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
