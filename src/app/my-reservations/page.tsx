"use client";

import { useEffect, useState } from "react";
import { getCurrentUserEmail, setCurrentUserEmail } from "@/lib/currentUser";

type Reservation = {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  total: number;
  createdAt: string;
  car: {
    id: string;
    brand: string;
    model: string;
    pricePerDay: number;
    status: "AVAILABLE" | "UNAVAILABLE";
  };
};

// === mismos estilos que AdminCarsPage ===
const box: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: 16,
  marginBottom: 16,
};

const input: React.CSSProperties = {
  padding: 8,
  border: "1px solid #ccc",
  borderRadius: 8,
  width: "100%",
};

const btn: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #111",
  background: "#111",
  color: "white",
  cursor: "pointer",
};

const btnLight: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #444",
  background: "#1f1f1f",
  color: "#fff",
  cursor: "pointer",
};

function formatCOP(value: number) {
  return value.toLocaleString("es-CO");
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CO");
}

export default function MyReservationsPage() {
  const [email, setEmail] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setError(null);

    const userEmail = email.trim();
    if (!userEmail) {
      setReservations([]);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/reservations/me", {
        headers: { "x-user-email": userEmail },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message ?? "Error cargando reservas");

      setReservations(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando reservas");
    } finally {
      setLoading(false);
    }
  }

  // 1) cargar email guardado
  useEffect(() => {
    const saved = getCurrentUserEmail();
    if (saved) setEmail(saved);
  }, []);

  // 2) autoload cuando cambie el email (incluye cuando llega el saved)
  useEffect(() => {
    if (email.trim()) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <h1>Mis reservas</h1>

      <section style={box}>
        <h2 style={{ marginTop: 0 }}>Usuario actual</h2>

        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <label>Email</label>
            <input
              style={input}
              value={email}
              onChange={(e) => {
                const v = e.target.value;
                setEmail(v);
                setCurrentUserEmail(v);
              }}
              placeholder="daniela@gmail.com"
            />
            <p style={{ fontSize: 12, opacity: 0.75, marginTop: 6, marginBottom: 0 }}>
              * MVP: usamos este email como “usuario actual” (sin login) para la prueba.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button style={btn} onClick={load} disabled={loading}>
              {loading ? "Cargando..." : "Recargar"}
            </button>

            <button
              style={btnLight}
              type="button"
              onClick={() => {
                setEmail("");
                setCurrentUserEmail("");
                setReservations([]);
                setError(null);
              }}
            >
              Limpiar
            </button>
          </div>

          {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
        </div>
      </section>

      <section style={box}>
        <h2 style={{ marginTop: 0 }}>Historial</h2>

        {reservations.length === 0 ? (
          <p>No tienes reservas aún.</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {reservations.map((r) => (
              <li key={r.id} style={{ marginBottom: 12 }}>
                <b>
                  {r.car.brand} {r.car.model}
                </b>{" "}
                — ${formatCOP(r.car.pricePerDay)} / día
                <div style={{ marginTop: 4, fontSize: 14 }}>
                  <div>
                    <b>Fechas:</b> {formatDate(r.startDate)} → {formatDate(r.endDate)}
                  </div>
                  <div>
                    <b>Días:</b> {r.days} | <b>Total:</b> ${formatCOP(r.total)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}