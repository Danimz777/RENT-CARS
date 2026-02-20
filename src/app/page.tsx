export default function Home() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "48px 20px",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ fontSize: 44, margin: 0 }}>Rent Cars</h1>
      <p style={{ marginTop: 10, fontSize: 16, color: "#444", lineHeight: 1.6 }}>
        Mini app de alquiler de carros: ver autos disponibles, crear una reserva y
        revisar el historial de alquileres del usuario.
      </p>

      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        <a
          href="/cars"
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
            textDecoration: "none",
            color: "#111",
            background: "#fff",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700 }}>Autos disponibles</div>
          <div style={{ marginTop: 6, color: "#555" }}>
            Ver listado público y reservar.
          </div>
        </a>

        <a
          href="/my-reservations"
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
            textDecoration: "none",
            color: "#111",
            background: "#fff",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700 }}>Mis reservas</div>
          <div style={{ marginTop: 6, color: "#555" }}>
            Consultar historial del usuario actual.
          </div>
        </a>

        <a
          href="/admin/cars"
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
            textDecoration: "none",
            color: "#111",
            background: "#fff",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700 }}>Admin</div>
          <div style={{ marginTop: 6, color: "#555" }}>
            CRUD de autos (módulo administrativo).
          </div>
        </a>
      </div>

      <div
        style={{
          marginTop: 22,
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 16,
          background: "#fafafa",
          color: "#333",
          lineHeight: 1.6,
        }}
      >
        <b>Checklist:</b>
        <ul style={{ margin: "10px 0 0 18px" }}>
          <li>Listado de autos disponibles</li>
          <li>Reserva con cálculo de total y cambio a “no disponible”</li>
          <li>Historial por usuario</li>
          <li>Validación de solapamiento de fechas</li>
          <li>Módulo Admin (CRUD de autos)</li>
        </ul>
      </div>
    </main>
  );
}