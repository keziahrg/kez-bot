import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const createAcceleratedPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  }).$extends(withAccelerate());
};

// Define a type for the accelerated client.
type PrismaClientAccelerated = ReturnType<typeof createAcceleratedPrismaClient>;

declare global {
  var prisma: PrismaClientAccelerated | undefined;
}

const prisma = global.prisma || createAcceleratedPrismaClient();

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
