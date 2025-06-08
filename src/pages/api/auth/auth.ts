import { AuthOptions } from "next-auth";
// import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

// Extend the built-in session types
// declare module "next-auth" {
//   interface Session {
//     accessToken?: string;
//     refreshToken?: string;
//   }
// }

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
  }
}

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/drive.file",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile) {
        // Verificação type-safe das propriedades do Google
        const hasEmailVerified =
          "email_verified" in profile &&
          (profile as Record<"email_verified", unknown>).email_verified ===
            true;
        const hasValidEmail = profile.email?.endsWith("@ifsudestemg.edu.br");

        return hasEmailVerified && Boolean(hasValidEmail);
      }
      return false;
    },
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (token.refreshToken) {
        session.refreshToken = token.refreshToken;
      }
      return session;
    },
  },
};
