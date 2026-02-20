// src/domain/reservation/reservation.rules.ts

export type ReservationDraft = {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
};

export function toStartOfDay(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export function toEndOfDay(dateStr: string) {
  return new Date(`${dateStr}T23:59:59.999Z`);
}

export function validateDateRange(start: Date, end: Date) {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Fechas inválidas");
  }
  if (end < start) {
    throw new Error("La fecha final no puede ser menor que la inicial");
  }
}

export function diffDaysInclusive(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function computeTotal(pricePerDay: number, days: number) {
  return pricePerDay * days;
}

/**
 * Regla de solapamiento (sin Prisma, pura).
 * Si existe una reserva con start <= endNueva y end >= startNueva => se cruza.
 */
export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart <= bEnd && aEnd >= bStart;
}