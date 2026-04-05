# 🚀 ISPANI — Full Technical Architecture & Build Structure

## 📌 Overview

**Ispani** is a multi-tenant SaaS labour marketplace and fintech platform designed to connect:

* Workers (job seekers)
* Clients (individuals)
* Organizations (businesses, government, enterprises)

It provides a **trusted, compliant, and fair-pay-driven ecosystem** for managing and executing work at scale.

---

## 🛠️ Quick Start

### Prerequisites

* **Node.js** >= 20.0.0 ([download](https://nodejs.org/))
* **pnpm** 9.15.0 (`npm install -g pnpm@9.15.0`)
* **Docker** & Docker Compose ([download](https://docker.com/))

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Katlego-Bruce/ispani-main.git
cd ispani-main

# 2. Install dependencies
pnpm install

# 3. Start infrastructure (PostgreSQL + Redis)
docker compose up -d

# 4. Copy environment variables
cp apps/api/.env.example apps/api/.env.local

# 5. Start all apps in development mode
pnpm dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all apps and packages |
| `pnpm test` | Run tests across all apps |
| `pnpm format` | Format code with Prettier |
| `pnpm clean` | Clean all build outputs |

### Development URLs

| App | URL | Port |
|-----|-----|------|
| Web (Tenant Dashboard) | http://localhost:3000 | 3000 |
| Admin Panel | http://localhost:3001 | 3001 |
| API (NestJS) | http://localhost:8080 | 8080 |
| Mobile (Expo) | Expo Dev Client | 8081 |

### Using GitHub Codespaces

1. Click **"Code"** → **"Codespaces"** → **"Create codespace on main"**
2. Wait for the devcontainer to build (~3 min)
3. Run `pnpm install` then `pnpm dev`
4. Ports are auto-forwarded for instant access

---

## 🧠 Architecture Summary

### Architecture Style

* Multi-tenant SaaS (B2B)
* Marketplace (B2C)
* Fintech (payments + escrow)

### Pattern

* Modular Monolith (initial)
* Event-Driven (internally)
* Microservices-ready (future scaling)

---

## 🏗️ High-Level System Design

```
Mobile App (React Native)
        ↓
Web App (Next.js SaaS Dashboard)
        ↓
API Gateway (NestJS)
        ↓
----------------------------------
Core Services (Modules)
----------------------------------
Auth | Users | Jobs | Escrow | Wallet | Trust | Disputes | Billing
----------------------------------
        ↓
PostgreSQL (Primary DB)
Redis (Cache + Queue + Realtime)
        ↓
External Services (Payments, SMS, Storage)
```

---

## 📦 Monorepo Structure (Turborepo)

```
ispani/
├── apps/
│   ├── mobile/          # React Native (Expo)
│   ├── web/             # Next.js (Tenant + Marketing)
│   ├── admin/           # Super Admin Panel
│   └── api/             # NestJS backend
│
├── packages/
│   ├── shared/          # Types, DTOs, constants
│   ├── ui/              # Shared UI components
│   ├── config/          # ESLint, TSConfig, Prettier
│   ├── utils/           # Helpers
│   └── sdk/             # API client SDK
│
├── infra/
│   ├── docker/
│   ├── terraform/
│   └── ci-cd/
│
├── .devcontainer/       # GitHub Codespace config
├── .github/workflows/   # CI/CD pipelines
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 🧩 Core Technology Stack

### Frontend

* React Native (Expo) — Mobile app
* Next.js 14 (App Router) — Web + Admin

### Backend

* NestJS (Node.js + TypeScript) — API

### Infrastructure

* PostgreSQL (with PostGIS) — Database
* Redis — Cache, queues, WebSockets
* BullMQ — Job queue
* Docker Compose — Local development

---

## 💳 Payments Stack (South Africa Optimized)

* PayFast → subscriptions
* Peach Payments / iKhokha → job funding
* PayShap → worker payouts
* Ozow → instant EFT

---

## 🏢 Multi-Tenancy Model

* Row-level multi-tenancy using `organization_id`
* PostgreSQL Row-Level Security (RLS)

---

## 🧠 Backend Modules (NestJS)

```
modules/
├── auth/          ├── escrow/        ├── notifications/
├── users/         ├── wallet/        ├── realtime/
├── organizations/ ├── ledger/        ├── analytics/
├── billing/       ├── trust/         ├── community/
├── jobs/          ├── disputes/      ├── fair-pay/
├── job-execution/                    └── audit/
```

---

## ⚡ Event-Driven Architecture

### Events

* job.created → job.assigned → escrow.funded → job.completed → payout.processed

### Queue System

* BullMQ (Redis)

---

## 🔐 Security

* JWT authentication + OTP via SMS
* Rate limiting (Redis) + Device tracking
* KYC verification (ID + selfie + bank verification)

---

## 🚀 Build Phases

### Phase 1 (MVP)

* Authentication
* Job posting & assignment
* Escrow system
* Wallet & payouts

### Phase 2

* Trust system
* Disputes
* Fair pay enforcement

### Phase 3

* Analytics
* Community features
* Enterprise capabilities

---

## 💡 Vision

Ispani is designed to become:

* A **trusted labour marketplace**
* A **fintech-enabled payment system**
* A **scalable SaaS platform**
* A **fair-pay enforcement engine**

---

## 📄 License

Private — All rights reserved.

---
