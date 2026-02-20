import { NextResponse } from "next/server";
import { getReservationsByUserEmail } from "@/services/reservation.service";

export async function GET(req: Request) {
  try {
    const email = req.headers.get("x-user-email");

    if (!email) {
      return NextResponse.json(
        { message: "Falta el header x-user-email" },
        { status: 401 }
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