# 🚀 ISPANI — Full Technical Architecture & Build Structure

## 📌 Overview

**Ispani** is a multi-tenant SaaS labour marketplace and fintech platform designed to connect:

* Workers (job seekers)
* Clients (individuals)
* Organizations (businesses, government, enterprises)

It provides a **trusted, compliant, and fair-pay-driven ecosystem** for managing and executing work at scale.

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
├── turbo.json
└── package.json
```

---

## 🧩 Core Technology Stack

### Frontend

* React Native (Expo)
* Next.js 14 (App Router)

### Backend

* NestJS (Node.js + TypeScript)

### Infrastructure

* PostgreSQL (with PostGIS)
* Redis (cache, queues, WebSockets)

---

## 💳 Payments Stack (South Africa Optimized)

* PayFast → subscriptions
* Peach Payments / iKhokha → job funding
* PayShap → worker payouts
* Ozow → instant EFT

---

## 🏢 Multi-Tenancy Model

### Approach

* Row-level multi-tenancy using `organization_id`
* PostgreSQL Row-Level Security (RLS)

```sql
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON jobs
USING (organization_id = current_setting('app.current_org')::uuid);
```

---

## 🗄️ Database Architecture

### Users & Organizations

```sql
users
- id
- type
- phone
- email
- kyc_status
- trust_score
- created_at

organizations
- id
- name
- plan
- plan_status
- subscription_id
- created_at
```

---

### Jobs

```sql
jobs
- id
- organization_id
- client_id
- title
- description
- location (PostGIS)
- payment_amount
- status
- created_at
```

---

### Wallet & Ledger

```sql
wallets
- user_id
- available_balance
- held_balance
- pending_balance

ledger_entries
- wallet_id
- type (debit|credit)
- amount
- reference_type
- reference_id
```

---

### Escrow

```sql
escrow
- job_id
- amount
- status

escrow_events
- escrow_id
- event_type
- amount
```

---

### Disputes

```sql
disputes
- job_id
- status
- evidence_urls
- resolution_deadline
```

---

### Trust System

```sql
ratings
- job_id
- score
- comment

trust_score_events
- user_id
- score_delta
- reason
```

---

### Fair Pay Engine

```sql
pay_rules
- category
- region
- min_rate
```

---

### Audit Logs

```sql
audit_logs
- actor_id
- action
- entity_type
- metadata
- created_at
```

---

## 🧠 Backend Modules (NestJS)

```
modules/
├── auth/
├── users/
├── organizations/
├── billing/
├── jobs/
├── job-execution/
├── escrow/
├── wallet/
├── ledger/
├── trust/
├── disputes/
├── notifications/
├── realtime/
├── analytics/
├── community/
├── fair-pay/
└── audit/
```

---

## ⚡ Event-Driven Architecture

### Events

* job.created
* job.assigned
* escrow.funded
* job.completed
* payout.processed

### Queue System

* BullMQ (Redis)

---

## 📍 Geolocation Engine

* PostGIS for location queries
* GIST indexing for performance

### Matching Algorithm

* Distance
* Trust score
* Skill match
* Availability
* Completion rate

---

## 🔐 Security Architecture

* JWT authentication
* OTP via SMS
* Rate limiting (Redis)
* Device tracking
* KYC verification (ID + selfie + bank verification)

---

## 📱 Mobile App Structure

```
mobile/src/
├── screens/
├── components/
├── services/
├── store/
├── hooks/
└── utils/
```

### Features

* Job feed
* Accept job
* GPS check-in
* Proof upload
* Wallet & payouts

---

## 💻 Web Platform (Tenant Dashboard)

```
web/src/app/
├── onboarding/
├── dashboard/
├── jobs/
├── workers/
├── analytics/
├── disputes/
├── billing/
```

---

## 🧑‍💼 Super Admin Panel

```
admin/
├── tenants/
├── kyc-queue/
├── fraud/
├── revenue/
```

---

## 📡 Notifications

* Firebase Cloud Messaging (push)
* Twilio (SMS)

---

## 📊 Analytics & Metrics

Track:

* Monthly Recurring Revenue (MRR)
* Active jobs
* Worker retention
* Dispute rate
* Fraud incidents

---

## ☁️ Infrastructure

* AWS / GCP
* Docker (containers)
* Kubernetes (future)
* Cloudflare (CDN)

---

## 🔄 CI/CD Pipeline

* GitHub Actions
* Build → Test → Deploy

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

## 🏁 Final Note

This architecture is designed to be:

* Scalable
* Secure
* Compliant
* South African-focused

It supports growth from MVP to enterprise-level deployment without major rewrites.

---
