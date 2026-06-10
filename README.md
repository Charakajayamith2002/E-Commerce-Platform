# E-Commerce-Platform
**E-Commerce Platform** – A full-stack online shopping application built with **React (TypeScript/TSX)** and **ASP.NET Core (.NET)**. Features include user authentication, product browsing, shopping cart management, order processing, and a responsive, user-friendly interface.

# E-Commerce Platform

A production-ready full-stack e-commerce platform built with **.NET 8** and **React 18**, featuring Clean Architecture, CQRS, real-time notifications, Stripe payments, and a fully responsive admin dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | ASP.NET Core 8, Clean Architecture, CQRS + MediatR |
| **Database** | SQL Server 2022, Entity Framework Core 8 |
| **Cache** | Redis (StackExchange.Redis) |
| **Auth** | ASP.NET Identity, JWT + Refresh Tokens (HTTP-only cookies) |
| **Payments** | Stripe (PaymentIntents + Webhooks) |
| **Storage** | Cloudinary (images with auto-optimization) |
| **Email** | MailKit (SMTP with HTML templates) |
| **Background jobs** | Hangfire (SQL Server storage) |
| **Real-time** | SignalR (notifications, order tracking) |
| **Frontend** | React 18, Vite, TypeScript, Redux Toolkit + RTK Query |
| **Styling** | Tailwind CSS 3, Framer Motion, dark mode |
| **Containerization** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |

---

## Project Structure

```
E-Commerce Platform/
├── backend/
│   ├── src/
│   │   ├── ECommerce.Domain/          # Entities, enums, value objects
│   │   ├── ECommerce.Application/     # CQRS commands/queries, DTOs, interfaces
│   │   ├── ECommerce.Infrastructure/  # External services (Stripe, Cloudinary, Redis, Email)
│   │   ├── ECommerce.Persistence/     # EF Core DbContext, migrations, seeds
│   │   └── ECommerce.API/             # Controllers, middleware, SignalR hubs
│   └── tests/
│       └── ECommerce.UnitTests/
├── frontend/
│   └── src/
│       ├── components/                # Reusable UI components
│       ├── pages/                     # Route-level pages
│       ├── redux/                     # Store, slices, RTK Query APIs
│       ├── services/                  # Axios client, service helpers
│       ├── layouts/                   # MainLayout, AdminLayout
│       └── routes/                    # ProtectedRoute, AdminRoute
├── docker-compose.yml
├── .env.example
└── .github/workflows/ci-cd.yml
```

---

## Quick Start (Local Development)

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server) or Docker
- [Redis](https://redis.io/) or Docker

### 1. Clone & configure environment

```bash
git clone <your-repo-url>
cd "E-Commerce Platform"

# Copy env files and fill in your values
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 2. Start with Docker Compose (recommended)

```bash
# Build and start all services (SQL Server, Redis, backend, frontend)
docker compose --env-file .env up --build
```

The app will be available at **http://localhost**.  
The API is at **http://localhost:5000/api**.  
Swagger UI: **http://localhost:5000/swagger**  
Hangfire dashboard: **http://localhost:5000/hangfire**

### 3. Run locally without Docker

**Backend:**
```bash
cd backend/src/ECommerce.API

# Set your connection strings in appsettings.Development.json or user-secrets
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=ECommerceDb;..."
dotnet user-secrets set "JwtSettings:SecretKey" "your-secret-key-at-least-32-chars"
# ... set other secrets from backend/.env.example

dotnet run
# API runs on https://localhost:5001 / http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
# Edit .env.local with your values (see frontend/.env.example)
npm run dev
# Dev server on http://localhost:5173
```

---

## Environment Variables

### Root `.env` (for Docker Compose)

| Variable | Description | Required |
|---|---|---|
| `DB_PASSWORD` | SQL Server SA password | Yes |
| `JWT_SECRET` | JWT signing key (≥32 chars) | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) | Yes |
| `STRIPE_PUBLIC_KEY` | Stripe publishable key (`pk_test_...`) | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `SMTP_HOST` | SMTP server host | Yes |
| `SMTP_USER` | SMTP username/email | Yes |
| `SMTP_PASSWORD` | SMTP password or app password | Yes |
| `SMTP_FROM` | From email address | Yes |

---

## Seed Data

On first run the database is automatically seeded with:

| Data | Details |
|---|---|
| **Admin user** | `admin@ecommerce.com` / `Admin@123456` |
| **Roles** | Admin, Manager, Customer |
| **Categories** | 8 top-level categories |
| **Brands** | 8 brands |
| **Products** | 6 demo products with images |
| **Coupons** | `WELCOME10` (10% off), `SAVE20` (20% off), `FREESHIP` (free shipping) |

---

## API Overview

| Resource | Endpoint | Auth |
|---|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` | Public |
| Products | `GET /api/products`, `GET /api/products/{slug}` | Public |
| Cart | `GET /api/cart`, `POST /api/cart/items` | User |
| Orders | `GET /api/orders`, `POST /api/orders` | User |
| Payments | `POST /api/payments/create-intent`, `POST /api/payments/webhook` | User / Public |
| Wishlist | `GET /api/wishlist`, `POST /api/wishlist/{productId}` | User |
| Admin | `GET /api/admin/dashboard`, `GET /api/admin/users` | Admin/Manager |
| Hangfire | `/hangfire` | Admin |

Full interactive docs available at `/swagger`.

---

## Stripe Webhooks (Local Testing)

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:5000/api/payments/webhook

# Trigger a test event
stripe trigger payment_intent.succeeded
```

---

## CI/CD (GitHub Actions)

The pipeline in `.github/workflows/ci-cd.yml` runs on every push:

1. **backend-test** — restores, builds, runs unit tests
2. **frontend-test** — installs, type-checks, builds
3. **docker-publish** — builds and pushes images to GitHub Container Registry (main branch only)
4. **deploy** — SSHes into your server and runs `docker compose up` (main branch only)

### Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `STRIPE_PUBLIC_KEY` | Injected into frontend build |
| `DEPLOY_HOST` | Production server IP/hostname |
| `DEPLOY_USER` | SSH user |
| `DEPLOY_SSH_KEY` | Private SSH key for deployment |

---

## Features

- **Authentication** — JWT + refresh tokens, Google OAuth, email verification, password reset
- **Products** — Full catalog with categories, brands, variants, image gallery, ratings
- **Cart** — Persistent cart (guest + authenticated), coupon codes
- **Checkout** — Stripe Elements (card), Cash on Delivery option
- **Orders** — Order tracking with real-time status updates via SignalR
- **Wishlist** — Save and manage favourite products
- **Admin Dashboard** — Revenue charts (Recharts), order management, user management, inventory
- **Dark Mode** — System-aware, persisted to localStorage
- **Notifications** — Real-time push via SignalR, stored in DB

---

## License

MIT

