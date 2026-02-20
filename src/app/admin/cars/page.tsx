"use client";

import { useEffect, useState } from "react";

type CarStatus = "AVAILABLE" | "UNAVAILABLE";

type Car = {
  id: string;
  brand: string;
  model: string;
  pricePerDay: number;
  status: CarStatus;
};

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

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [status, setStatus] = useState<CarStatus>("AVAILABLE");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadCars() {
    try {
      const res = await fetch("/api/admin/cars");
      const data = await res.json();
      setCars(data);
    } catch {
      setError("Error cargando autos");
    }
  }

  useEffect(() => {
    loadCars();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const price = Number(pricePerDay);
    if (!brand.trim() || !model.trim() || Number.isNaN(price)) {
      setError("Completa marca, modelo y un precio válido.");
      return;
    }

    try {
      const url = editingId ? `/api/admin/cars/${editingId}` : "/api/admin/cars";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: brand.trim(),
          model: model.trim(),
          pricePerDay: price,
          status,
        }),
      });

      if (!res.ok) throw new Error("No se pudo guardar el auto");

      setBrand("");
      setModel("");
      setPricePerDay("");
      setStatus("AVAILABLE");
      setEditingId(null);
      await loadCars();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error guardando auto");
    }
  }

  function startEdit(c: Car) {
    setEditingId(c.id);
    setBrand(c.brand);
    setModel(c.model);
    setPricePerDay(String(c.pricePerDay));
    setStatus(c.status);
  }

  function cancelEdit() {
    setEditingId(null);
    setBrand("");
    setModel("");
    setPricePerDay("");
    setStatus("AVAILABLE");
  }

  async function removeCar(c: Car) {
    const ok = window.confirm(`¿Seguro que deseas eliminar: ${c.brand} ${c.model}?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/cars/${c.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar");
      await loadCars();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error eliminando auto");
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <h1>Admin - Autos</h1>

      <section style={box}>
        <h2 style={{ marginTop: 0 }}>{editingId ? "Editar auto" : "Crear auto"}</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <label>Marca</label>
              <input style={input} value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>

            <div>
              <label>Modelo</label>
              <input style={input} value={model} onChange={(e) => setModel(e.target.value)} />
            </div>

            <div>
              <label>Precio por día</label>
              <input
                style={input}
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                placeholder="150000"
              />
            </div>

            <div>
              <label>Estado</label>
              <select style={input} value={status} onChange={(e) => setStatus(e.target.value as CarStatus)}>
                <option value="AVAILABLE">Disponible</option>
                <option value="UNAVAILABLE">No disponible</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button style={btn} type="submit">
                {editingId ? "Guardar" : "Crear"}
              </button>

              {editingId && (
                <button style={btnLight} type="button" onClick={cancelEdit}>
                  Cancelar
                </button>
              )}
            </div>

            {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
          </div>
        </form>
      </section>

      <section style={box}>
        <h2 style={{ marginTop: 0 }}>Autos registrados</h2>

        {cars.length === 0 ? (
          <p>No hay autos todavía.</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {cars.map((c) => (
              <li key={c.id} style={{ marginBottom: 10 }}>
                <b>{c.brand}</b> {c.model} — ${c.pricePerDay} —{" "}
                {c.status === "AVAILABLE" ? "Disponible" : "No disponible"}{" "}
                <button style={{ ...btnLight, marginLeft: 8 }} onClick={() => startEdit(c)}>
                  Editar
                </button>
                <button style={{ ...btnLight, marginLeft: 8 }} onClick={() => removeCar(c)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}