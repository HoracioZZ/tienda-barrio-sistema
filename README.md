# Sistema de Información — Tienda de Barrio

Proyecto de la materia Desarrollo de Sistemas 2. Sistema de gestión de ventas, inventario, clientes, compras y reportes para un negocio local.

## Arquitectura

Backend en capas (Controller → Service → Repository) + API REST, consumido por un frontend React (PWA-ready). Ver `/docs` para más detalle de la arquitectura y el modelo de datos.

## Estructura del repositorio

```
tienda-barrio/
├── backend/          # API REST (Node.js + Express + Prisma)
│   ├── prisma/        # Esquema de base de datos (PostgreSQL)
│   └── src/
│       ├── controllers/   # Reciben la petición HTTP
│       ├── services/      # Lógica de negocio
│       ├── repositories/  # Acceso a datos (Prisma)
│       ├── routes/        # Definición de endpoints
│       ├── middlewares/    # Auth, roles, etc.
│       └── config/        # Configuración (Prisma client, etc.)
├── frontend/         # React + Vite + Tailwind v4
│   └── src/
│       ├── modules/   # Un folder por módulo/épica (ventas, inventario, auth, clientes, compras, reportes)
│       ├── pages/      # Vistas/páginas
│       ├── components/ # Componentes reutilizables
│       └── services/   # Cliente API (axios)
└── docs/             # Documentación del proyecto
```

## Requisitos previos

- Node.js 20 LTS o superior
- PostgreSQL 15 o superior
- Git

## Instalación (primera vez, después del `git clone`)

> **Nota sobre el comando para copiar `.env.example`:** el comando `cp` es de Linux/Mac. En Windows depende de tu terminal:
> - **PowerShell** (recomendado, viene con Windows): usa `Copy-Item .env.example .env`
> - **CMD (Símbolo del sistema):** usa `copy .env.example .env`
> - **Git Bash** (si lo instalaste junto con Git): `cp` sí funciona igual que en Linux/Mac
> - O simplemente duplica el archivo `.env.example` en el Explorador de Windows y renómbralo a `.env`

### 1. Backend

**PowerShell / Git Bash / Mac / Linux:**
```bash
cd backend
npm install
cp .env.example .env        # en CMD usa: copy .env.example .env
```

Edita el archivo `.env` con los datos reales de tu base de datos PostgreSQL.

```bash
# Si la base de datos YA existe (creada con el script SQL de Enterprise Architect):
npx prisma db pull
npx prisma generate

# Si prefieres que Prisma cree las tablas desde el schema.prisma:
npx prisma migrate dev --name init

npm run dev
```

El backend corre en `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # en CMD usa: copy .env.example .env
npm run dev
```

El frontend corre en `http://localhost:5173`.

### Nota para usuarios de Windows

Todos los demás comandos (`npm install`, `npx prisma generate`, `npm run dev`, `git checkout`, etc.) son **idénticos** en Windows, Mac y Linux — no necesitas cambiar nada en esos. Solo el comando de copiar archivos (`cp` vs `copy`) cambia según la terminal que uses. Recomendamos usar **Git Bash** (se instala automáticamente junto con Git para Windows) porque ahí todos los comandos de este proyecto funcionan exactamente igual que en Mac/Linux, sin tener que recordar cuál usar.

## Ramas de trabajo (Git)

- `main` → rama estable, solo se mergea vía Pull Request revisado
- `develop` → rama de integración de todo el equipo
- `feature/<modulo>` → una rama por integrante/módulo, ejemplo:
  - `feature/ventas`
  - `feature/inventario`
  - `feature/auth`
  - `feature/clientes`
  - `feature/compras`
  - `feature/reportes`

Cada integrante trabaja en su rama `feature/<modulo>` y luego crea un Pull Request hacia `develop`.

## Módulos y responsables

| Módulo | Épica Jira | Carpeta backend | Carpeta frontend |
|---|---|---|---|
| Ventas | EPIC-1 | `src/*/venta.*` | `src/modules/ventas` |
| Inventario/Catálogo | EPIC-2 | `src/*/producto.*` | `src/modules/inventario` |
| Autenticación | EPIC-3 | `src/*/auth.*` | `src/modules/auth` |
| Clientes | EPIC-4 | `src/*/cliente.*` | `src/modules/clientes` |
| Compras/Proveedores | EPIC-5 | `src/*/pedido.*` | `src/modules/compras` |
| Reportes | EPIC-6 | `src/*/reporte.*` | `src/modules/reportes` |
