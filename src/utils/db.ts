/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { env } from "@/env.mjs";
import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export function PrismaAdapter(p: any): Adapter {
  return {
    createUser: (data) => {
      console.log("data", data);
      return p.user.create({ data });
    },
    getUser: (id) => p.user.findUnique({ where: { id } }),
    getUserByEmail: (email) => p.user.findUnique({ where: { email } }),
    async getUserByAccount(provider_providerAccountId) {
      const account = await p.account.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      });
      return account?.user ?? null;
    },
    updateUser: (data) => p.user.update({ where: { id: data.id }, data }),
    deleteUser: (id) => p.user.delete({ where: { id } }),
    linkAccount: (data) => p.account.create({ data }),
    unlinkAccount: (provider_providerAccountId) =>
      p.account.delete({ where: { provider_providerAccountId } }),
    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true }, //TODO:add additional fields here
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user, session };
    },
    createSession: (data) => p.session.create({ data }),
    updateSession: (data) =>
      p.session.update({ data, where: { sessionToken: data.sessionToken } }),
    deleteSession: (sessionToken) =>
      p.session.delete({ where: { sessionToken } }),
    createVerificationToken: (data) => p.verificationToken.create({ data }),
    async useVerificationToken(identifier_token) {
      try {
        return await p.verificationToken.delete({
          where: { identifier_token },
        });
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025ggk
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
          return null;
        throw error;
      }
    },
  };
}
