"use client";

import { useEffect, useState } from "react";

type Car = {
  id: string;
  brand: string;
  model: string;
  pricePerDay: number;
  status: "AVAILABLE" | "UNAVAILABLE";
};

export default function PublicCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadCars() {
    try {
      setError(null);
      const res = await fetch("/api/cars");
      if (!res.ok) throw new Error("No se pudo cargar la lista");
      const data = await res.json();
      setCars(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando autos");
    }
  }

  useEffect(() => {
    loadCars();
  }, []);

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, marginBottom: 8 }}>Autos disponibles</h1>
      <p style={{ opacity: 0.8, marginBottom: 18 }}>
        Listado público (solo autos con estado disponible).
      </p>

      {error && <p style={{ color: "tomato" }}>{error}</p>}

      {cars.length === 0 ? (
        <p>No hay autos disponibles por ahora.</p>
      ) : (
        <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
          {cars.map((c) => (
            <li
              key={c.id}
              style={{
                border: "1px solid #444",
                borderRadius: 12,
                padding: 14,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <strong style={{ fontSize: 18 }}>
                    {c.brand} {c.model}
                  </strong>
                  <div style={{ opacity: 0.85, marginTop: 4 }}>
                    Precio por día: <b>${c.pricePerDay}</b>
                  </div>
                </div>

                <span
                  style={{
                    alignSelf: "start",
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid #666",
                    fontSize: 12,
                    opacity: 0.9,
                  }}
                >
                  Disponible
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}