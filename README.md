# 🔗 Tether

> A modern client management and payment tracking system for ISP service management

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📋 About

Tether is a full-stack web application designed to manage ISP clients and track their payment history. Built with a modern tech stack, it provides:

- 📊 Client management with detailed profiles
- 💳 Payment history tracking
- 🔄 Automated payment processing
- 📱 Responsive UI with Angular
- 🚀 RESTful API with Express & PostgreSQL

## 🏗️ Project Structure

```
tether/
├── frontend/          # Angular application
│   ├── src/
│   │   └── app/      # Components, routes, services
│   └── public/       # Static assets
├── backend/          # Express.js API
│   ├── src/
│   │   ├── config/   # Database & environment config
│   │   ├── controllers/  # Business logic
│   │   ├── routes/   # API routes
│   │   └── data/     # Database schema
│   └── .env         # Environment variables (not committed)
└── README.md        # This file
```

## 🛠️ Tech Stack

### Frontend
- **Angular 21** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **RxJS** - Reactive programming

### Backend
- **Express.js 5** - Web framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Relational database
- **node-pg** - PostgreSQL client
- **dotenv** - Environment management

### DevOps & Tools
- **Nodemon** - Auto-reload dev server
- **tsx** - TypeScript executor
- **Playwright** - End-to-end testing

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **npm** >= 9.x

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tether
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies (Playwright)
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up PostgreSQL Database**
   ```bash
   # Create database
   psql -U postgres
   CREATE DATABASE tether_db;
   \q

   # Run schema
   psql -U postgres -d tether_db -f backend/src/data/schema.sql
   ```

4. **Configure Environment Variables**

   Create `backend/.env`:
   ```env
   PORT=3000

   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=tether_db
   PGUSER=postgres
   PGPASSWORD=your_password_here
   ```

   See `backend/.env.example` for all available options.

5. **Run the Application**

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

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Payment History
- `GET /api/payment-histories` - Get all payment records
- `GET /api/payment-histories/:id` - Get payment by ID
- `POST /api/payment-histories` - Create payment record

### Health Check
- `GET /api/health` - API health status

## 🗄️ Database Schema

### Clients Table
```sql
- id (SERIAL PRIMARY KEY)
- full_name (VARCHAR)
- phone_number (VARCHAR)
- zip_code (VARCHAR)
- carrier (VARCHAR)
- plan_amount (DECIMAL)
- payment_due_day (INTEGER)
- status (VARCHAR)
- last_payment_at (TIMESTAMP)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Payment History Table
```sql
- id (SERIAL PRIMARY KEY)
- client_id (INTEGER, FOREIGN KEY)
- amount_paid (DECIMAL)
- status (VARCHAR)
- error_message (TEXT)
- attempted_at (TIMESTAMP)
```

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3000` |
| `PGHOST` | PostgreSQL host | `localhost` |
| `PGPORT` | PostgreSQL port | `5432` |
| `PGDATABASE` | Database name | `db_name` |
| `PGUSER` | Database user | `db_user` |
| `PGPASSWORD` | Database password | `db_password` |

## 📝 Development Scripts

### Backend
```bash
npm run dev      # Start development server with auto-reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Run production server
```

### Frontend
```bash
npm start        # Start dev server (http://localhost:4200)
npm run build    # Build for production
npm run watch    # Build with watch mode
npm test         # Run tests
```

## 🧪 Testing

Run Playwright tests:
```bash
npm run test:playwright
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

This project is licensed under the ISC License.

## 👤 Author

**David Salas C.**

---

⭐️ Star this repo if you find it helpful!
