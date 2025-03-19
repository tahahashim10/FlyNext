import prisma from "@/utils/db";

export async function getUserBookings(userId: number): Promise<any> {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      hotel: {
        select: { name: true, location: true },
      },
      room: {
        select: { name: true, pricePerNight: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
