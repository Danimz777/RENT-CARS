"use client";

import { useEffect, useMemo, useState } from "react";

type CarStatus = "AVAILABLE" | "UNAVAILABLE";

type Car = {
  id: string;
  brand: string;
  model: string;
  pricePerDay: number;
  status: CarStatus;
};

type ReserveDraft = {
  userEmail: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
};

const box: React.CSSProperties = {
  border: "1px solid #2a2a2a",
  borderRadius: 14,
  padding: 16,
  marginBottom: 14,
  background: "#807d7d",
};

const input: React.CSSProperties = {
  padding: 10,
  border: "1px solid #333",
  borderRadius: 10,
  width: "100%",
  background: "#121212",
  color: "#fff",
};

const btn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "white",
  cursor: "pointer",
};

const btnLight: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #444",
  background: "#1f1f1f",
  color: "#fff",
  cursor: "pointer",
};

function formatCOP(value: number) {
  try {
    return new Intl.NumberFormat("es-CO").format(value);
  } catch {
    return String(value);
  }
}

export default function CarsPublicPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [error, setError] = useState<string | null>(null);

  // UI reserva inline
  const [openCarId, setOpenCarId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReserveDraft>({
    userEmail: "",
    startDate: "",
    endDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // email "usuario actual" (MVP)
  const defaultEmail = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("currentUserEmail") ?? "daniela@gmail.com";
  }, []);

  async function loadCars() {
    setError(null);
    try {
      const res = await fetch("/api/cars", { cache: "no-store" });
      const data = await res.json();
      setCars(Array.isArray(data) ? data : []);
    } catch {
      setError("Error cargando autos disponibles");
    }
  }

  useEffect(() => {
    loadCars();
    // setear email por defecto solo una vez
    setDraft((d) => ({ ...d, userEmail: defaultEmail }));
  }, [defaultEmail]);

  function toggleReserve(carId: string) {
    setSuccessMsg(null);
    setError(null);

    setOpenCarId((prev) => {
      const next = prev === carId ? null : carId;
      // si abrimos, reseteamos fechas pero mantenemos email
      if (next) {
        setDraft((d) => ({
          userEmail: d.userEmail || defaultEmail,
          startDate: "",
          endDate: "",
        }));
      }
      return next;
    });
  }

  async function submitReservation(car: Car) {
    setError(null);
    setSuccessMsg(null);

    const email = draft.userEmail.trim();
    if (!email) {
      setError("Ingresa un email de usuario.");
      return;
    }
    if (!draft.startDate || !draft.endDate) {
      setError("Selecciona fecha inicio y fecha fin.");
      return;
    }

    setSaving(true);
    try {
      // guardamos "usuario actual"
      localStorage.setItem("currentUserEmail", email);

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: email,
          carId: car.id,
          startDate: draft.startDate,
          endDate: draft.endDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // backend devuelve { message }
        throw new Error(data?.message ?? "No se pudo crear la reserva");
      }

      setSuccessMsg(
        `Reserva creada  Total: ${formatCOP(data.total)} (días: ${data.days})`
      );
      setOpenCarId(null);

      // recargar lista: ese carro debe desaparecer (queda UNAVAILABLE)
      await loadCars();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error creando reserva");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 20,
        fontFamily: "system-ui",
        color: "black",
      }}
    >
      <h1 style={{ fontSize: 44, marginBottom: 8 }}>Autos disponibles</h1>
      <p style={{ marginTop: 0, color: "#070707" }}>
        Listado público (solo autos con estado disponible).
      </p>

      {(error || successMsg) && (
        <div style={{ ...box, borderColor: error ? "crimson" : "#2f8f2f" }}>
          {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
          {successMsg && <p style={{ color: "#8dff8d", margin: 0 }}>{successMsg}</p>}
        </div>
      )}

      {cars.length === 0 ? (
        <div style={box}>
          <p style={{ margin: 0, color: "#faf9f9" }}>
            No hay autos disponibles por ahora.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {cars.map((c) => (
            <div key={c.id} style={box}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                    {c.brand} {c.model}
                  </div>
                  <div style={{ color: "#000000" }}>
                    Precio por día: <b>${formatCOP(c.pricePerDay)}</b>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #333",
                      background: "#141414",
                      color: "#dcdcdc",
                      fontSize: 12,
                      height: "fit-content",
                    }}
                  >
                    Disponible
                  </span>

                  <button style={btnLight} onClick={() => toggleReserve(c.id)}>
                    {openCarId === c.id ? "Cerrar" : "Reservar"}
                  </button>
                </div>
              </div>

              {/* Inline form */}
              {openCarId === c.id && (
                <div style={{ marginTop: 14, borderTop: "1px solid #222", paddingTop: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, color: "#bdbdbd" }}>Email (usuario actual)</label>
                      <input
                        style={input}
                        value={draft.userEmail}
                        onChange={(e) => setDraft((d) => ({ ...d, userEmail: e.target.value }))}
                        placeholder="daniela@gmail.com"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, color: "#bdbdbd" }}>Fecha inicio</label>
                      <input
                        style={input}
                        type="date"
                        value={draft.startDate}
                        onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, color: "#bdbdbd" }}>Fecha fin</label>
                      <input
                        style={input}
                        type="date"
                        value={draft.endDate}
                        onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button
                      style={btn}
                      disabled={saving}
                      onClick={() => submitReservation(c)}
                    >
                      {saving ? "Guardando..." : "Confirmar reserva"}
                    </button>

                    <button style={btnLight} onClick={() => setOpenCarId(null)}>
                      Cancelar
                    </button>
                  </div>

                  <p style={{ marginTop: 10, color: "#bdbdbd", fontSize: 12 }}>
                    * MVP: usamos email como “usuario actual” (sin login) para la prueba.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}