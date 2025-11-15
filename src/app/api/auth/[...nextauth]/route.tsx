import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { userDb, loginAttemptDb } from "@/lib/db";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        const email = credentials.email;

        // Check if account is locked
        const isLocked = await loginAttemptDb.isLocked(email);
        if (isLocked) {
          throw new Error("Account locked due to multiple failed login attempts. Try again in 15 minutes.");
        }

        // Find user
        const user = await userDb.findByEmail(email);
        if (!user) {
          await loginAttemptDb.recordFailedAttempt(email);
          throw new Error("Invalid email or password");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          await loginAttemptDb.recordFailedAttempt(email);
          
          // Get attempt count to inform user
          const attempts = await loginAttemptDb.getAttempts(email);
          const remainingAttempts = 5 - (attempts?.attempts || 0);
          
          if (remainingAttempts > 0) {
            throw new Error(`Invalid email or password. ${remainingAttempts} attempts remaining.`);
          } else {
            throw new Error("Account locked due to multiple failed login attempts. Try again in 15 minutes.");
          }
        }

        // Reset login attempts on successful login
        await loginAttemptDb.resetAttempts(email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/signIn",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };