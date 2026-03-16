import GoogleProvider from "next-auth/providers/google";

/**
 * NextAuth config — ใช้ใน route handler และ getServerSession (lib/auth.ts)
 * session.user.id = UID จาก Google (ใช้เป็นหัวข้อหลักในการค้นหา user ใน DB)
 */
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    jwt({ token, account, profile }: { token: Record<string, unknown>; account?: { providerAccountId?: string }; profile?: { sub?: string } }) {
      if (account?.providerAccountId) token.uid = account.providerAccountId;
      if (profile?.sub) token.sub = profile.sub;
      return token;
    },
    session({ session, token }: { session: { user?: { id?: string } }; token: Record<string, unknown> }) {
      if (session.user) {
        session.user.id = (token.sub ?? token.uid) as string;
      }
      return session;
    },
    redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
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
