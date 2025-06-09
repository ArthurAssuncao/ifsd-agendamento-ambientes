import jwt from "jsonwebtoken";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          hd: "ifsudestemg.edu.br", // Restringe a emails @ifsudestemg.edu.br
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // adapter: SupabaseAdapter({
  //   url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  // }),
  callbacks: {
    async signIn({ profile }) {
      // Permite apenas logins do domínio ifsudestemg.edu.br
      return profile?.email?.endsWith("@ifsudestemg.edu.br") ?? false;
    },
    async jwt({ token, user }) {
      // Adiciona o ID do usuário ao token JWT
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      // Gera um token JWT compatível com o Supabase
      const supabaseToken = jwt.sign(
        {
          sub: token.sub, // ID do usuário
          email: session.user.email,
          aud: "authenticated",
          exp: Math.floor(Date.now() / 1000) + 3600, // Expira em 1 hora
          role: "authenticated",
        },
        process.env.SUPABASE_JWT_SECRET! // Encontre em Project Settings > API no Supabase
      );

      session.supabaseAccessToken = supabaseToken;
      return session;
    },
  },
};
