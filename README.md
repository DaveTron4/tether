# 🔗 Tether

> A multi-tenant B2B SaaS platform for independent cell phone repair shops — CRM, inventory, repairs, subscriptions, and POS in one system.

⚠️ **PROPRIETARY SOFTWARE** — All rights reserved. See [License](#-license) below.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📋 About

Tether is a multi-tenant B2B SaaS application built for independent cell phone repair shops. Each store (tenant) gets its own isolated data, custom branding via URL subdomain, and a full suite of business tools — all served from a single codebase.

- 🏪 **Multi-Tenant Architecture** — Strict data isolation per store with UUID-based tenant IDs
- 🎨 **Dynamic White-Labeling** — Custom logo, colors, and branding per subdomain
- 👥 **CRM** — Client management with lifetime value tracking and detailed profiles
- 🔧 **Repair Tracking** — Intake → In Progress → Done → Picked Up workflow
- 📦 **Inventory** — Product catalog with barcode support, stock levels, and JSONB properties
- 💳 **POS & Sales** — Transactional checkout with sale items, stock deduction, and receipts
- 📱 **Subscription Management** — Phone & WiFi plan tracking with payment history
- 🔐 **Role-Based Access** — Superadmin → Admin → Employee hierarchy
- � **Stripe Billing** — Checkout, webhooks, billing portal, and tiered subscription plans
- 🚪 **Feature Gating** — Module access and entity limits enforced per subscription tier
- �🚀 **RESTful API** — Fully tenant-scoped Express API with JWT authentication

## 📊 Progress

### ✅ Completed
- [x] **Database Architecture** — Multi-tenant schema with `tenant_id` on all tables, UUID tenants, `ON DELETE CASCADE`, and tenant-scoped `client_lifetime_value` view
- [x] **Backend Security** — JWT auth with `tenant_id` in payload, `verifyToken` middleware, `AuthRequest` interface, all controllers scoped to `req.user.tenant_id`
- [x] **Tenant Management** — Superadmin-protected CRUD for tenants via `x-super-admin-secret` header
- [x] **User Onboarding Flow** — Superadmin creates tenant + admin; admin registers employees; no public registration
- [x] **CRM Module** — Client CRUD, client summary with lifetime value, balance due, active subscriptions, total repairs
- [x] **Inventory Module** — Product CRUD with barcode validation, JSONB properties, stock management
- [x] **Repairs Module** — Repair ticket CRUD with cost tracking and status workflow
- [x] **Sales Module** — Transactional POS with sale items, stock deduction, and receipt generation
- [x] **Subscriptions Module** — Subscription CRUD with payment history and status tracking
- [x] **Stripe Integration** — Checkout sessions, webhook handling, billing portal, and subscription status sync
- [x] **Feature Gating** — Tier-based module access (`requireFeature`) and entity limits (`requireLimit`) enforced via middleware
- [x] **Frontend** — Angular SPA with auth guards, feature guards, interceptors, responsive layouts, and Tailwind CSS v4

### 🔲 Upcoming
- [ ] **Frontend White-Labeling** — Subdomain detection, branding API, dynamic Tailwind CSS variables via Angular Signals
- [ ] **Branding API** — Public `GET /api/tenants/brand?subdomain=` endpoint for unauthenticated branding fetch
- [ ] **Row-Level Security** — PostgreSQL RLS policies per tenant
- [ ] **Multi-Location Support** — Multiple store locations per tenant with per-location inventory, employees, and analytics
- [ ] **Reporting & Analytics** — Sales reports, inventory alerts, repair metrics
- [ ] **Email Campaigns** — Personalized automated emails for reminders, promotions, and notifications

## 🏗️ Project Structure

```
tether/
├── docker-compose.yml
├── package.json
├── backend/
│   ├── nodemon.json
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── config/
│       │   ├── database.ts
│       │   ├── plans.ts
│       │   ├── reset.ts
│       │   └── stripe.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── client.controller.ts
│       │   ├── paymentHistory.controller.ts
│       │   ├── product.controller.ts
│       │   ├── repair.controller.ts
│       │   ├── sale.controller.ts
│       │   ├── stripe.controller.ts
│       │   ├── subscription.controller.ts
│       │   ├── tenants.controller.ts
│       │   └── user.controller.ts
│       ├── data/
│       │   └── schema.sql
│       ├── middleware/
│       │   ├── auth.middleware.ts
│       │   ├── featureGate.middleware.ts
│       │   └── subscription.middleware.ts
│       ├── models/
│       │   ├── authRequest.interface.ts
│       │   ├── client.interface.ts
│       │   ├── clientSummary.interface.ts
│       │   ├── paymentHistory.interface.ts
│       │   ├── product.interface.ts
│       │   ├── repair.interface.ts
│       │   ├── sale.interface.ts
│       │   ├── subscription.interface.ts
│       │   └── user.interface.ts
│       └── routes/
│           ├── auth.route.ts
│           ├── clients.route.ts
│           ├── index.route.ts
│           ├── paymentHistory.route.ts
│           ├── product.route.ts
│           ├── repair.route.ts
│           ├── sale.route.ts
│           ├── stripe.route.ts
│           ├── subscription.route.ts
│           ├── tenants.route.ts
│           └── user.route.ts
├── frontend/
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.spec.json
│   ├── public/
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.css
│       ├── environments/
│       │   ├── environment.ts
│       │   └── environment.development.ts
│       └── app/
│           ├── app.ts
│           ├── app.html
│           ├── app.config.ts
│           ├── app.routes.ts
│           ├── core/
│           │   ├── guards/
│           │   │   ├── admin-guard.ts
│           │   │   ├── auth-guard.ts
│           │   │   ├── feature-guard.ts
│           │   │   ├── leave-guard.ts
│           │   │   └── login-guard.ts
│           │   ├── interceptors/
│           │   │   └── auth.interceptor.ts
│           │   ├── layouts/
│           │   │   └── main-layout/
│           │   └── services/
│           │       ├── auth.ts
│           │       ├── client.ts
│           │       ├── employee.ts
│           │       ├── plan.ts
│           │       ├── stripe.ts
│           │       ├── subscription.ts
│           │       └── theme.ts
│           ├── features/
│           │   ├── auth/
│           │   │   ├── layout/
│           │   │   └── pages/
│           │   ├── crm/
│           │   │   ├── components/
│           │   │   └── pages/
│           │   ├── employees/
│           │   ├── inventory/
│           │   │   ├── components/
│           │   │   └── pages/
│           │   └── repairs/
│           │       └── pages/
│           └── shared/
│               ├── components/
│               │   ├── confirm-modal/
│               │   ├── footer/
│               │   ├── header/
│               │   └── sidebar/
│               └── models/
│                   ├── authResponse.interface.ts
│                   ├── client.interface.ts
│                   ├── clientSummary.interface.ts
│                   ├── paymentHistory.interface.ts
│                   ├── product.interface.ts
│                   ├── repair.interface.ts
│                   ├── sale.interface.ts
│                   ├── subscription.interface.ts
│                   └── user.interface.ts
```

## 🛠️ Tech Stack

### Frontend
- **Angular 21** - Modern web framework with Signals
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS with dynamic theming
- **RxJS** - Reactive programming

### Backend
- **Express.js 5** - Web framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Relational database with multi-tenant schema
- **Stripe** - Billing, subscriptions, and checkout
- **node-pg** - PostgreSQL client
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment management

### DevOps & Tools
- **Docker** - PostgreSQL & pgAdmin containers
- **Nodemon** - Auto-reload dev server
- **tsx** - TypeScript executor

## 🔐 Authentication & Authorization

### Role Hierarchy
| Role | Capabilities |
|------|-------------|
| **Superadmin** | Create/manage tenants, onboard tenant admins |
| **Admin** | Full access within their tenant, register employees |
| **Employee** | Operational access within their tenant (CRM, inventory, sales, repairs) |

### Flow
1. **Superadmin** creates a new tenant and its first admin user (protected by `x-super-admin-secret` header)
2. **Admin** logs in and registers employees for their tenant (protected by `verifyToken` + `isAdmin` middleware)
3. **Employees** log in and work within their tenant's data (protected by `verifyToken` middleware)
4. No public registration — accounts are created by authorized users only

## 💳 Stripe Integration & Subscription Tiers

### Billing Flow
1. **New tenant** selects a plan on the pricing page → redirected to Stripe Checkout
2. **Stripe webhook** (`checkout.session.completed`) creates the tenant + admin user in the database
3. **Subscription lifecycle** events (`invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`) keep the tenant's `subscription_status` and `subscription_tier` in sync
4. **Admins** can manage billing via Stripe's Billing Portal (upgrade, downgrade, cancel, update payment method)

### Subscription Tiers

| Feature | 🟢 Starter ($19/mo) | 🔵 Pro ($59/mo) | 🟣 Enterprise ($99/mo) |
|---|:---:|:---:|:---:|
| **Employees** | 3 | 15 | Unlimited |
| **Locations** | 1 | 3 | Unlimited |
| **Clients** | 250 | 2,000 | Unlimited |
| **Products** | 500 | 5,000 | Unlimited |
| **Inventory & POS** | ✅ | ✅ | ✅ |
| **Client CRM** | ✅ | ✅ | ✅ |
| **Repair Tracking** | — | ✅ | ✅ |
| **Subscription Tracking** | — | ✅ | ✅ |
| **Custom Branding** | — | ✅ | ✅ |
| **Reports** | — | ✅ | ✅ |
| **Analytics** | — | — | ✅ |
| **Multi-Location Hub** | — | — | ✅ |
| **Email Campaigns** | — | — | ✅ |
| **API Access** | — | — | ✅ |

> All tiers support both **monthly** and **yearly** billing cycles. Yearly plans offer a discounted rate.

### Feature Gating

Feature access is enforced at **two layers**:

- **Backend** — `requireFeature(module)` middleware blocks API routes for modules not included in the tenant's tier. `requireLimit(key)` middleware blocks entity creation when the tenant has reached their plan's cap (employees, clients, products).
- **Frontend** — `featureGuard(module)` Angular route guard prevents navigation to gated pages. `PlanService` exposes the tenant's features via signals for conditional UI rendering.

| Middleware | Purpose | Example |
|---|---|---|
| `requireActiveSubscription` | Blocks all access if subscription is inactive | Applied to all protected routes |
| `requireFeature('repairs')` | Blocks repair endpoints for Starter tenants | Applied to `/api/repairs` |
| `requireLimit('maxClients')` | Blocks client creation at plan cap | Applied to `POST /api/clients` |

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x (or Docker)
- **npm** >= 9.x

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tether
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up PostgreSQL Database (Docker)**

   This project runs PostgreSQL inside Docker (see `docker-compose.yml`).

   - Ensure the repository root `.env` contains the DB settings:
     ```env
     PGHOST=localhost
     PGPORT=5432
     PGDATABASE=tether_db
     PGUSER=david
     PGPASSWORD=password
     ```

   - Start the database container:
     ```bash
     docker compose up -d
     docker compose ps
     ```

   - Import the schema:
     ```bash
     docker cp backend/src/data/schema.sql tether_db:/tmp/schema.sql
     docker exec -i tether_db psql -U david -d tether_db -f /tmp/schema.sql
     ```

4. **Configure Environment Variables**

   Create `.env` in the backend directory (not committed):
   ```env
   PORT=3000
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=tether_db
   PGUSER=postgres
   PGPASSWORD=your_password_here
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=1h
   SUPER_ADMIN_SECRET=your_super_admin_key_here
   ADMIN_PASSWORD=your_admin_password_here
   ```

5. **Reset & Seed Database**
   ```bash
   cd backend
   npm run db:reset
   ```

6. **Run the Application**

   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on `http://localhost:3000`

   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```
   App runs on `http://localhost:4200`

## 📡 API Endpoints

All data endpoints (except login and health) require a valid JWT token via `Authorization: Bearer <token>` header. All data is scoped to the authenticated user's `tenant_id`.

### Auth
- `POST /api/auth/login` - User login (returns JWT)
- `POST /api/auth/register` - Register employee (Admin only, enforces employee limit)

### Stripe
- `POST /api/stripe/checkout` - Create Stripe Checkout session (public)
- `POST /api/stripe/webhook` - Stripe webhook handler (public, raw body)
- `POST /api/stripe/billing-portal` - Create billing portal session (Admin only)
- `GET /api/stripe/subscription-status` - Get tenant subscription status, tier, and features

### Tenants (Superadmin only — requires `x-super-admin-secret` header)
- `GET /api/tenants` - Get all tenants
- `POST /api/tenants` - Create new tenant
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `GET /api/clients/:id/summary` - Get client lifetime value & summary
- `POST /api/clients` - Create new client *(enforces client limit)*
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product *(enforces product limit)*
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Repairs *(Pro+ only)*
- `GET /api/repairs` - Get all repair tickets
- `GET /api/repairs/:id` - Get repair by ID
- `GET /api/repairs?client_id=` - Get repairs by client
- `POST /api/repairs` - Create repair ticket
- `PUT /api/repairs/:id` - Update repair ticket

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale with items (receipt)
- `POST /api/sales` - Create sale (transactional checkout)

### Subscriptions *(Pro+ only)*
- `GET /api/subscriptions?client_id=` - Get client subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription

### Payment History
- `GET /api/payment-histories` - Get all payment records
- `GET /api/payment-histories/:id` - Get payment by ID
- `POST /api/payment-histories` - Create payment record

### Health Check
- `GET /api/health` - API health status

## 🗄️ Database Schema

### Tenants Table
```sql
- id (UUID PRIMARY KEY, auto-generated)
- store_name, subdomain (UNIQUE)
- logo_url, theme_primary_color, theme_secondary_color
- contact_email, contact_phone, address fields
- stripe_customer_id, stripe_subscription_id
- subscription_status, subscription_tier
- tax_rate, currency
- created_at, updated_at
```

### Users Table
```sql
- id (SERIAL PRIMARY KEY)
- tenant_id (UUID, FK → tenants)
- username (UNIQUE), full_name, email (UNIQUE)
- password_hash, role ('admin' | 'employee')
- created_at
```

### Clients Table
```sql
- id (SERIAL PRIMARY KEY)
- tenant_id (UUID, FK → tenants)
- full_name, phone_number, email, zip_code
- status ('Active' | 'Inactive' | 'Debt')
- notes, last_visit, created_at
```

### Products Table
```sql
- id (SERIAL PRIMARY KEY)
- tenant_id (UUID, FK → tenants)
- name, barcode (UNIQUE), category, is_generic
- price, cost, stock_quantity, min_stock_level
- properties (JSONB), created_at
```

### Sales & Sale Items Tables
```sql
Sales: id, tenant_id, user_id, client_id, total_amount, payment_method, created_at
Sale Items: id, sale_id, product_id, quantity, price_at_sale
```

### Repair Tickets Table
```sql
- id (SERIAL PRIMARY KEY)
- tenant_id (UUID, FK → tenants)
- client_id, device_model, issue_description
- status ('Intake' | 'In Progress' | 'Done' | 'Picked Up')
- estimated_cost, parts_cost, labor_cost, charge_amount
- created_at, completed_at
```

### Subscriptions & Payment History Tables
```sql
Subscriptions: id, tenant_id, client_id, service_type, carrier, plan_amount, payment_due_day, status, is_active
Payment History: id, tenant_id, subscription_id, amount_paid, status, created_at
```

### Views
- **client_lifetime_value** — Aggregates sales, repairs, and subscription payments per client per tenant

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3000` |
| `PGHOST` | PostgreSQL host | `localhost` |
| `PGPORT` | PostgreSQL port | `5432` |
| `PGDATABASE` | Database name | — |
| `PGUSER` | Database user | — |
| `PGPASSWORD` | Database password | — |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `JWT_EXPIRES_IN` | JWT token expiration | `1h` |
| `SUPER_ADMIN_SECRET` | Secret key for superadmin endpoints | — |
| `ADMIN_PASSWORD` | Default admin password for DB seeding | — |
| `STRIPE_SECRET_KEY` | Stripe secret API key | — |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | — |
| `FRONTEND_URL` | Frontend URL for Stripe redirects | `http://localhost:4200` |
| `STRIPE_PRICE_STARTER_MONTHLY` | Stripe Price ID for Starter monthly | — |
| `STRIPE_PRICE_STARTER_YEARLY` | Stripe Price ID for Starter yearly | — |
| `STRIPE_PRICE_PRO_MONTHLY` | Stripe Price ID for Pro monthly | — |
| `STRIPE_PRICE_PRO_YEARLY` | Stripe Price ID for Pro yearly | — |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | Stripe Price ID for Enterprise monthly | — |
| `STRIPE_PRICE_ENTERPRISE_YEARLY` | Stripe Price ID for Enterprise yearly | — |

## 📝 Development Scripts

### Backend
```bash
npm run dev      # Start development server with auto-reload
npm run build    # Compile TypeScript to JavaScript
npm run db:reset # Reset and seed the database
npm start        # Run production server
```

### Frontend
```bash
npm start        # Start dev server (http://localhost:4200)
npm run build    # Build for production
npm run watch    # Build with watch mode
npm test         # Run tests
```

## 📦 Build for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Outputs to frontend/dist
```

## 📄 License

Copyright © 2025–2026 David Salas C. All rights reserved.

This is proprietary software. No part of this codebase may be reproduced, distributed, modified, reverse-engineered, or used in any form without prior written permission from the copyright holder.

Unauthorized use, copying, or distribution of this software is strictly prohibited and may result in legal action.

## 👤 Author

**David Salas C.**
