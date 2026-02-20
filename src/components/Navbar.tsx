"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navWrap: React.CSSProperties = {
  borderBottom: "1px solid #222",
  background: "#0b0b0b",
  color: "white",
};

const navInner: React.CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto",
  padding: "14px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  fontFamily: "system-ui",
};

const brand: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 10,
};

const badge: React.CSSProperties = {
  fontSize: 12,
  color: "#bdbdbd",
  border: "1px solid #2a2a2a",
  borderRadius: 999,
  padding: "4px 10px",
  background: "#111",
};

const links: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
};

const aStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid transparent",
};

const aHover: React.CSSProperties = {
  border: "1px solid #2a2a2a",
  background: "#111",
};

const input: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "#121212",
  color: "#fff",
  minWidth: 220,
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={href}
      style={{ ...aStyle, ...(hover ? aHover : null) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    // MVP: guardamos el "usuario actual" en localStorage
    const saved = localStorage.getItem("currentUserEmail") ?? "";
    setEmail(saved);
  }, []);

  function saveEmail(value: string) {
    setEmail(value);
    localStorage.setItem("currentUserEmail", value);
  }

  return (
    <header style={navWrap}>
      <div style={navInner}>
        <div style={brand}>
          <Link href="/" style={{ color: "white", textDecoration: "none", fontWeight: 800, fontSize: 18 }}>
            RENT-CARS
          </Link>
          <span style={badge}>MVP</span>
        </div>

        <nav style={links}>
          <NavLink href="/cars">Autos</NavLink>
          <NavLink href="/my-reservations">Mis reservas</NavLink>
          <NavLink href="/admin/cars">Admin</NavLink>

          <input
            style={input}
            placeholder="Usuario actual (email)"
            value={email}
            onChange={(e) => saveEmail(e.target.value)}
          />
        </nav>
      </div>
    </header>
  );
}