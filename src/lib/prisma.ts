import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
