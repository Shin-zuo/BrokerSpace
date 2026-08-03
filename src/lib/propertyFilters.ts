import { prisma } from "./prisma";
import { Prisma } from "../generated/prisma/client";

export async function getVisibilityFilter(userId?: string, brokerId?: string): Promise<Prisma.PropertyWhereInput> {
  if (!userId || !brokerId) {
    return { visibility: "PUBLIC" };
  }

  const connections = await prisma.connection.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
  });

  const friendIds = connections.map((c) =>
    c.requesterId === userId ? c.receiverId : c.requesterId
  );

  return {
    OR: [
      { visibility: "PUBLIC" },
      { brokerId: brokerId },
      {
        visibility: "FRIENDS",
        broker: { user: { id: { in: friendIds } } },
      },
    ],
  };
}
