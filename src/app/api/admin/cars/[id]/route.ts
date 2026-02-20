import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "Falta el id del auto" }, { status: 400 });
    }

    await prisma.car.delete({ where: { id } });

    return NextResponse.json({ message: "Auto eliminado" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error al eliminar el auto" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const brand = String(body.brand ?? "").trim();
    const model = String(body.model ?? "").trim();
    const pricePerDay = Number(body.pricePerDay);
    const status = body.status as $Enums.CarStatus;

    if (!id) {
      return NextResponse.json({ message: "Falta el id del auto" }, { status: 400 });
    }

    if (!brand || !model || Number.isNaN(pricePerDay)) {
      return NextResponse.json(
        { message: "Marca, modelo y precio por día son obligatorios" },
        { status: 400 }
      );
    }

    const updated = await prisma.car.update({
      where: { id },
      data: { brand, model, pricePerDay, status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error al actualizar el auto" }, { status: 500 });
  }
}
