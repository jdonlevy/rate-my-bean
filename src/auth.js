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
        // upsertUser returns the canonical DB id (handles the case where a
        // Google sign-in matches an existing credentials account by email)
        const dbId = await upsertUser({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        });
        // Store the DB id so the session always uses the same id as the
        // users table, even if the provider id (token.sub) differs
        if (dbId) token.dbId = dbId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        // Prefer the canonical DB id over the provider sub
        session.user.id = token.dbId || token.sub;
      }
      return session;
    },
  },
}));

export { handlers, auth, signIn, signOut };
