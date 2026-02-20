import { NextResponse } from "next/server";
import {
  createReservation,
  getReservationsByUserEmail,
} from "@/services/reservation.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { message: "Debes enviar ?email= para listar reservas" },
        { status: 400 }
      );
    }

    const data = await getReservationsByUserEmail(email);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error listando reservas";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.userEmail || !body.carId || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { message: "Faltan campos: userEmail, carId, startDate, endDate" },
        { status: 400 }
      );
    }

    const reservation = await createReservation({
      userEmail: body.userEmail,
      carId: body.carId,
      startDate: body.startDate,
      endDate: body.endDate,
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error creando reserva";
    return NextResponse.json({ message }, { status: 400 });
  }
}