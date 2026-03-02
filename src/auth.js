import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { upsertUser } from "@/lib/db";

const isPreview = process.env.VERCEL_ENV === "preview";

let handlers;
let auth;
let signIn;
let signOut;

if (isPreview) {
  handlers = {
    GET: async () => new Response("OAuth disabled in preview.", { status: 404 }),
    POST: async () => new Response("OAuth disabled in preview.", { status: 404 }),
  };
  auth = async () => null;
  signIn = async () => {
    throw new Error("OAuth disabled in preview.");
  };
  signOut = async () => null;
} else {
  ({ handlers, auth, signIn, signOut } = NextAuth({
    providers: [Google],
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
}

export { handlers, auth, signIn, signOut };
