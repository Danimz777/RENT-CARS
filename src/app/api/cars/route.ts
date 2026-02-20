import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CarStatus } from "@prisma/client";

export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      where: { status: CarStatus.AVAILABLE },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cars);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al listar autos disponibles" },
      { status: 500 }
    );
  }
}