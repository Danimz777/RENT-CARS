import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CarStatus } from "@prisma/client";

export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(cars);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al obtener los autos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brand, model, pricePerDay, status } = body;

    if (!brand || !model || typeof pricePerDay !== "number") {
      return NextResponse.json(
        { message: "brand, model y pricePerDay son obligatorios" },
        { status: 400 }
      );
    }

    const car = await prisma.car.create({
      data: {
        brand,
        model,
        pricePerDay,
        status: status ?? CarStatus.AVAILABLE,
      },
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error al crear el auto" }, { status: 500 });
  }
}
