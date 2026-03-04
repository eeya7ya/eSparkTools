import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { getDb } from "@/lib/db/client";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        if (!email.endsWith("@esparktools.com")) {
          throw new Error("Only @esparktools.com emails are allowed");
        }

        const sql = getDb();
        const rows = await sql`
          SELECT id, name, email, password_hash, image, role
          FROM users WHERE email = ${email}
        `;

        const user = rows[0];

        if (!user || !user.password_hash) {
          throw new Error("Invalid email or password");
        }

        const isValid = await compare(password, user.password_hash as string);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id as string,
          name: user.name as string,
          email: user.email as string,
          image: user.image as string | null,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const sql = getDb();

        const existingAccounts = await sql`
          SELECT id FROM accounts
          WHERE provider = ${"google"}
          AND provider_account_id = ${account.providerAccountId}
        `;

        if (existingAccounts.length > 0) {
          return true;
        }

        const existingUsers = await sql`
          SELECT id FROM users WHERE email = ${user.email!}
        `;

        let userId: string;

        if (existingUsers.length > 0) {
          userId = existingUsers[0].id as string;
          await sql`
            UPDATE users SET name = ${user.name!}, image = ${user.image!}
            WHERE id = ${userId}
          `;
        } else {
          const newUsers = await sql`
            INSERT INTO users (name, email, image)
            VALUES (${user.name!}, ${user.email!}, ${user.image!})
            RETURNING id
          `;
          userId = newUsers[0].id as string;
        }

        await sql`
          INSERT INTO accounts (user_id, provider, provider_account_id)
          VALUES (${userId}, ${"google"}, ${account.providerAccountId})
        `;
      }

      return true;
    },
  },
});
