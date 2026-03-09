import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getUserByEmail, upsertUser } from "@/lib/db";

let handlers;
let auth;
let signIn;
let signOut;
const isPreview = process.env.VERCEL_ENV === "preview";
const providers = [
  Credentials({
    name: "Rate My Bean",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.toString().trim();
      const password = credentials?.password?.toString();
      if (!email || !password) return null;

      const user = await getUserByEmail(email);
      if (!user?.password_hash) return null;

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    },
  }),
];

if (!isPreview) {
  providers.unshift(Google);
}

({ handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        await upsertUser({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
}));

export { handlers, auth, signIn, signOut };
