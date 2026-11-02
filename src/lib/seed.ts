import { prisma } from "./db";

/**
 * Gets or creates the primary local active user without generating synthetic scans or reports.
 */
export async function getOrCreateDemoUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "User",
      },
    });
  }
  return user;
}
