# RENT-CARS — Prueba Técnica (Sistema de alquiler de carros)

Repo: https://github.com/Danimz777/RENT-CARS.git  
Demo (Vercel): https://rent-cars-six.vercel.app

Mini app:
- **Módulo visual:** ver autos disponibles, reservar y ver historial.
- **Módulo admin:** CRUD de autos.

---

## Decisiones tomadas 

### 1 Tecnologías elegidas 
- **Next.js + React**: lo hice con Next.js (App Router) porque me permite tener **frontend y API en el mismo proyecto** (páginas y endpoints en `src/app`), y así entregar una miniapp completa.
- **TypeScript**: lo mantuve desde el inicio porque la prueba lo evalúa. Tipé entidades (`Car`, `Reservation`), estados `AVAILABLE/UNAVAILABLE` y el manejo de datos en componentes para reducir errores.
- **PostgreSQL (Neon)**: usé Neon porque para **desplegar en Vercel** necesitaba una base en la nube, no algo local como SQLite.
- **Prisma**: lo usé como ORM para definir el modelo (`User`, `Car`, `Reservation`), manejar migraciones y tener consultas tipadas en el backend.

### 2 Por qué terminé usando Prisma v7 + adapter (deploy estable)
En despliegue apareció el caso de Prisma v7 donde el cliente requiere un **adapter**, por eso:
- configuré `PrismaClient` con `pg` (Pool) + `@prisma/adapter-pg` en `src/lib/prisma.ts`.
- dejé `postinstall: prisma generate` en `package.json` para que Vercel genere Prisma Client al instalar dependencias.

La idea fue evitar errores en producción y que el deploy sea estable.

### 3 “Usuario actual” sin login (MVP)
La prueba pide “mostrar reservas del usuario actual”, pero no exige autenticación.
Entonces lo resolví como MVP:
- el usuario actual se identifica por **email**,
- para el historial uso `GET /api/reservations/me` enviando el header `x-user-email`,
- y en la UI lo guardo en `localStorage` para que sea fácil probar.

### 4  auto-creación del usuario
Para que cualquiera pueda probar con cualquier email:
- al reservar, si el usuario no existe, lo creo automáticamente con `upsert` como `CUSTOMER`.
Así evito el error típico de “Usuario no encontrado” durante la demo.

### 5 Reglas importantes en backend 
Para mantener consistencia:
- el cálculo de `days` y `total` lo hago en backend (`total = pricePerDay * days`),
- el cambio de estado del auto a **UNAVAILABLE** también es backend,
- la validación de fechas y errores también.



### 6 Validación de solapamiento (no doble reserva por fechas)
Antes de crear una reserva valido que el auto no tenga otra reserva que se cruce con esas fechas
(usando la regla típica de overlap: `start <= endNuevo` y `end >= startNuevo`).

### 7 Consistencia usando transacción
Al crear una reserva hago 2 cambios:
1) creo la reserva,
2) actualizo el auto a `UNAVAILABLE`.

Eso lo hago en una **transacción** para no dejar el sistema a medias si algo falla.

### 8 “SOLID” aplicado sin sobrecomplicar
No hice arquitectura exagerada, pero sí separé por responsabilidades:
- UI: `src/app/**` (páginas)
- API: `src/app/api/**` (rutas)
- Services: `src/services/**` (lógica de negocio)
- Domain: `src/domain/**` (reglas puras de fechas/cálculos)
- Lib: `src/lib/**` (Prisma / utilidades)

La idea es que las rutas sean delgadas y la lógica viva en services (más fácil de mantener y explicar).

### 9 Fix de enums en deploy
En Vercel apareció un error con enums exportados, así que en algunos puntos usé `$Enums` de Prisma
para que el build quedara estable.

### 10 Manejo de promesas y asincronía (async/await)
La app trabaja con operaciones asíncronas tanto en frontend como en backend:

- **Backend (API Routes y Services):** usé `async/await` para manejar consultas a la base de datos con Prisma (por ejemplo crear/listar reservas, actualizar estado del carro y CRUD de autos). Esto se ve en los endpoints dentro de `src/app/api/**` y en el service `src/services/reservation.service.ts`.  
- **Transacciones:** al reservar, la creación de la reserva y la actualización del auto se ejecutan dentro de `prisma.$transaction(...)`, que es una operación asíncrona y se controla con `await`.
- **Frontend:** para consumir la API usé `fetch` con `await` y manejo de estados como `loading` y `error` (por ejemplo en `/my-reservations` para cargar historial y en `/cars` para crear reservas). La idea fue dar feedback al usuario mientras se resuelven las promesas.

En general, la app controla los flujos asíncronos con `try/catch` para responder con errores claros cuando algo falla.

PASO A PASO DE COMO LEVANTAR EL PROYECTO 

> Requisitos:
> - Node.js instalado (recomendado 18+)
> - Una base PostgreSQL (en esta prueba se usó Neon)
> - La variable `DATABASE_URL` configurada

## Paso 1 — Clonar el repositorio
```bash
git clone https://github.com/Danimz777/RENT-CARS.git
cd RENT-CARS

## Paso 2 - Instalar dependencias
npm install 

## Paso 3 - Crear archivo .env
Crear un archivo `.env` en la raíz del proyecto:
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

Configurar esta variable con una base PostgreSQL propia (por ejemplo Neon).

## Paso 4 - aplicar migraciones(crear tablas)
npx prisma migrate deploy 

## paso 5 - ejecutar en modo desarrollo 
npm run dev 

Abrir:

Home: http://localhost:3000/

Visual: http://localhost:3000/cars

Historial: http://localhost:3000/my-reservations

Admin: http://localhost:3000/admin/cars

---

 