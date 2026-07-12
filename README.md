# FleetX - Fuel & Expense Management Module

A full-stack Fleet Management System with Fuel & Expense tracking and Analytics.

## Tech Stack
- **Backend:** Node.js + Express.js (ES Modules)
- **Database:** Supabase (PostgreSQL)
- **Frontend:** React + Vite

## Features
- 🚗 Vehicle Management (Custom Vehicle IDs, optional License Plate, Acquisition Cost)
- ⛽ Fuel Log Tracking (Quantity, Cost, Date, Odometer)
- 💸 Expense Logging (Maintenance, Toll, Parking, Insurance, Fine, Miscellaneous)
- 📊 Analytics Dashboard
  - Fuel Efficiency (km/L)
  - Fleet Utilization (active days per vehicle)
  - Operational Cost (Fuel + Maintenance + Expenses)
  - Vehicle ROI `(Revenue - (Maintenance + Fuel)) / Acquisition Cost`
- 🔍 Fuel Theft Detection
- 📈 Expense Forecasting (3-month moving average)
- 📥 CSV Export for Analytics, Fuel Logs, and Expense Logs

## Setup

### 1. Database
Run `supabase_schema.sql` in your Supabase SQL Editor.

### 2. Backend
```bash
cd backend
cp .env.example .env   # Add your SUPABASE_URL and SUPABASE_ANON_KEY
npm install
node server.js
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicle` | List all vehicles |
| POST | `/api/vehicle` | Add a vehicle |
| GET | `/api/fuel` | Get fuel logs |
| POST | `/api/fuel` | Add fuel log |
| GET | `/api/expense` | Get expense logs |
| POST | `/api/expense` | Add expense log |
| GET | `/api/analytics/dashboard` | Get analytics dashboard |
| GET | `/api/analytics/health` | Vehicle health scores |
| GET | `/api/analytics/theft` | Fuel theft alerts |
| GET | `/api/export/csv?type=analytics` | Export CSV |
| GET | `/api/export/csv?type=fuel` | Export fuel logs CSV |
| GET | `/api/export/csv?type=expense` | Export expense logs CSV |
