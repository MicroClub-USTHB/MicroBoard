import { env } from "@/env.mjs";
import { Role } from "@/types";
import { prisma, PrismaAdapter } from "@/utils/db";
import type { User as PrismaUser } from "@prisma/client";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import NextAuth from "next-auth/next";
import DiscordProvider, {
  type DiscordProfile,
} from "next-auth/providers/discord";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number;
      role: Role;
      familyName: string;
    } & DefaultSession["user"];
  }
  interface User extends PrismaUser {
    // student?: Student[]
    role: Role;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = parseInt(user.id);
        session.user.role = user.role;
        session.user.familyName = user.familyName ?? "";
        session.user.name = user.name;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      maxAge: 6 * 60 * 60, // 6 hours
    }),
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      profile(profile: DiscordProfile) {
        if (profile.avatar === null) {
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        } else {
          const format = profile.avatar.startsWith("a_") ? "gif" : "png";
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }
        return {
          id: profile.id,
          email: profile.email,
          image: profile.image_url,
          name: profile.username,
          role: "USER",
          emailVerified: profile.verified ? new Date() : null,
          lastLogin: new Date(),
          isActive: true,
          createdAt: new Date(),
          familyName: profile.username,
        };
      },
      authorization:
        "https://discord.com/api/oauth2/authorize?scope=identify+email+guilds",
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          image: profile.picture,
          role: "USER",
          email: profile.email,
          name: profile.name,
          emailVerified: profile.email_verified ? new Date() : null,
          createdAt: new Date(),
          lastLogin: new Date(),
          isActive: true,
          familyName: profile.family_name,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
    newUser: "/home/new",
    //verifyRequest: "/verify-request",
  },
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

export default NextAuth(authOptions);
