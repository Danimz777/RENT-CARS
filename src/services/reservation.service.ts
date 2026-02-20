// src/services/reservation.service.ts
import { prisma } from "@/lib/prisma";
import { CarStatus } from "@prisma/client";
import {
  toStartOfDay,
  toEndOfDay,
  validateDateRange,
  diffDaysInclusive,
  computeTotal,
} from "@/domain/reservation/reservation.rules";

type CreateReservationInput = {
  userEmail: string; // MVP: usuario actual por email (sin login)
  carId: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
};

export async function createReservation(input: CreateReservationInput) {
  const start = toStartOfDay(input.startDate);
  const end = toEndOfDay(input.endDate);

  // valida fechas (incluye NaN y end < start)
  validateDateRange(start, end);

  // 1) Usuario por email (MVP). Si NO existe, lo crea automáticamente como CUSTOMER
  // Esto evita fricción en deploy/demo (no dependes de crear users manualmente)
  const email = input.userEmail.trim();

  const user = await prisma.user.upsert({
    where: { email },
    update: {}, // si existe, no lo cambia
    create: {
      email,
      name: email.split("@")[0] || "Customer",
      role: "CUSTOMER", // enum en Prisma
    },
  });

  // 2) Verificar carro y que esté disponible
  const car = await prisma.car.findUnique({
    where: { id: input.carId },
  });

  if (!car) throw new Error("Auto no encontrado");
  if (car.status !== CarStatus.AVAILABLE) {
    throw new Error("Este auto no está disponible");
  }

  // 3) Validar solapamiento de fechas (no puede reservarse dos veces el mismo rango)
  const overlap = await prisma.reservation.findFirst({
    where: {
      carId: input.carId,
      startDate: { lte: end },
      endDate: { gte: start },
    },
  });

  if (overlap) {
    throw new Error("Este auto ya tiene una reserva en esas fechas");
  }

  // 4) Calcular días y total
  const days = diffDaysInclusive(start, end);
  const total = computeTotal(car.pricePerDay, days);

  // 5) Transacción: crear reserva y cambiar carro a UNAVAILABLE
  const reservation = await prisma.$transaction(async (tx) => {
    const created = await tx.reservation.create({
      data: {
        userId: user.id,
        carId: car.id,
        startDate: start,
        endDate: end,
        days,
        total,
      },
    });

    await tx.car.update({
      where: { id: car.id },
      data: { status: CarStatus.UNAVAILABLE },
    });

    return created;
  });

  return reservation;
}

export async function getReservationsByUserEmail(userEmail: string) {
  const email = userEmail.trim();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Usuario no encontrado");

  return prisma.reservation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { car: true },
  });
}