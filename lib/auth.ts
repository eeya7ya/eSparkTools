import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { sql } from "@/lib/db/client";

const ALLOWED_DOMAIN = "esparktools.com";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        // Enforce company domain whitelist
        const domain = email.split("@")[1];
        if (domain !== ALLOWED_DOMAIN) return null;

        const rows = await sql`
          SELECT id, name, email, password_hash, image, role
          FROM users
          WHERE email = ${email}
          LIMIT 1
        `;

        const user = rows[0];
        if (!user || !user.password_hash) return null;

        const passwordMatch = await bcryptjs.compare(password, user.password_hash as string);
        if (!passwordMatch) return null;

        return {
          id: user.id as string,
          name: user.name as string | null,
          email: user.email as string,
          image: user.image as string | null,
          role: user.role as string,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth, enforce domain and auto-provision user record
      if (account?.provider === "google") {
        const email = user.email ?? "";
        const domain = email.split("@")[1];
        if (domain !== ALLOWED_DOMAIN) return false;

        // Upsert user
        await sql`
          INSERT INTO users (name, email, image)
          VALUES (${user.name ?? null}, ${email}, ${user.image ?? null})
          ON CONFLICT (email) DO UPDATE
            SET name  = EXCLUDED.name,
                image = EXCLUDED.image
        `;

        // Upsert account link
        const userRow = await sql`
          SELECT id FROM users WHERE email = ${email} LIMIT 1
        `;
        const userId = userRow[0]?.id as string;

        await sql`
          INSERT INTO accounts (user_id, provider, provider_account_id)
          VALUES (${userId}, ${account.provider}, ${account.providerAccountId})
          ON CONFLICT (provider, provider_account_id) DO NOTHING
        `;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error — role is a custom field
        token.role = user.role ?? "user";
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        // @ts-expect-error — role is a custom field
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },
});
