# FleetX: Smart Transport Operations Platform

**Hackathon Duration:** 8 Hours

**Objective:** Build an end-to-end transport operations platform that digitizes vehicle, driver, dispatch, maintenance, and expense management while enforcing business rules and providing operational insights.

---

## Trip Management (Module 3.5) & Maintenance (Module 3.6)

This sub-module implements Trip Management and Maintenance using **Node.js, TypeScript, Express, and Supabase**. It uses a strict `snake_case` schema as requested, and features advanced Maintenance tracking (priorities, mechanic assignments, cost tracking).

### Setup Instructions

#### 1. Supabase Database Configuration
Since we shifted to strict snake_case and added several new fields, **you must completely drop your old tables and run this new script** in your Supabase SQL Editor.

```sql
-- 1. Drop existing tables if they exist
DROP TABLE IF EXISTS maintenance CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;

-- 2. Create Vehicles Table (Updated Schema)
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(255) UNIQUE NOT NULL,
    vehicle_name VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(255) NOT NULL,
    maximum_load_capacity DECIMAL(10, 2) NOT NULL CHECK (maximum_load_capacity > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    service_score INT NOT NULL DEFAULT 100
);

-- 3. Create Drivers Table (Updated Schema)
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(255) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    contact_number VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE'
);

-- 4. Create Trips Table (Updated Schema)
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    trip_number VARCHAR(255) NOT NULL,
    vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id INT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    cargo_weight DECIMAL(10, 2) NOT NULL CHECK (cargo_weight > 0),
    planned_distance DECIMAL(10, 2) NOT NULL CHECK (planned_distance > 0),
    estimated_travel_time DECIMAL(10, 2) NOT NULL DEFAULT 0,
    estimated_arrival_time TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    dispatch_time TIMESTAMP,
    completed_time TIMESTAMP
);

-- 5. Create Maintenance Table (Advanced Features)
CREATE TABLE maintenance (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    issue VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    estimated_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    actual_cost DECIMAL(10, 2),
    mechanic_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    opened_at TIMESTAMP NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMP,
    notes TEXT
);

-- 6. Disable RLS for testing
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance DISABLE ROW LEVEL SECURITY;

-- 7. Insert Dummy Seed Data
INSERT INTO vehicles (registration_number, vehicle_name, vehicle_type, maximum_load_capacity, status, service_score) VALUES
('TRK-001', 'Volvo FH16', 'Heavy Truck', 20000, 'AVAILABLE', 100),
('TRK-002', 'Scania R500', 'Heavy Truck', 18000, 'AVAILABLE', 100),
('TRK-003', 'Mercedes Sprinter', 'Van', 3000, 'AVAILABLE', 100);

INSERT INTO drivers (name, license_number, license_expiry, contact_number, status) VALUES
('John Doe', 'LIC-1001', '2030-12-31', '555-0101', 'AVAILABLE'),
('Jane Smith', 'LIC-1002', '2028-05-15', '555-0102', 'AVAILABLE'),
('Mike Johnson', 'LIC-1003', '2022-01-01', '555-0103', 'AVAILABLE');

NOTIFY pgrst, 'reload schema';
```

#### 2. Environment Variables
Your `.env` file is already configured properly.

#### 3. Run the Application
Start the TypeScript development server:
```bash
npm run dev
```

Visit the testing dashboard at `http://localhost:8080`.

---

## 1. Business Context
Many logistics companies still rely on spreadsheets and manual logbooks to manage their transport operations. This often leads to scheduling conflicts, underutilized vehicles, missed maintenance, expired driver licenses, inaccurate expense tracking, and poor operational visibility.

Your task is to build FleetX, a centralized platform that allows organizations to manage the complete lifecycle of their transport operations—from vehicle registration and driver management to dispatching, maintenance, fuel logging, and analytics.

## 2. Target Users
- **Fleet Manager:** Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency.
- **Driver:** Creates trips, assigns vehicles and drivers, and monitors active deliveries.
- **Safety Officer:** Ensures driver compliance, tracks license validity, and monitors safety scores.
- **Financial Analyst:** Reviews operational expenses, fuel consumption, maintenance costs, and profitability.

## 3. Functional Requirements

### 3.1 Authentication
- Implement secure login using email and password.
- Support Role-Based Access Control (RBAC).
- Only authenticated users should access the application.

### 3.2 Dashboard
- Display KPIs such as Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, and Fleet Utilization (%).
- Provide filters by vehicle type, status, and region.

### 3.3 Vehicle Registry
- Maintain a master list of vehicles with Registration Number (unique), Vehicle Name/Model, Type, Maximum Load Capacity, Odometer, Acquisition Cost, and Status.
- Status values: `Available`, `On Trip`, `In Shop`, `Retired`.

### 3.4 Driver Management
- Maintain driver profiles including Name, License Number, License Category, License Expiry Date, Contact Number, Safety Score, and Status.
- Status values: `Available`, `On Trip`, `Off Duty`, `Suspended`.

### 3.5 Trip Management
- Create trips by selecting a source, destination, available vehicle, available driver, cargo weight, and planned distance.
- Trip lifecycle: `Draft` → `Dispatched` → `Completed` → `Cancelled`.

### 3.6 Maintenance
- Create maintenance records for vehicles.
- Adding a vehicle to a "Maintenance Log" automatically switches its status to `In Shop`, removing it from the Driver's selection pool.

### 3.7 Fuel & Expense Management
- Record fuel logs (liters, cost, date) and other expenses such as tolls or maintenance.
- Automatically compute total operational cost (Fuel + Maintenance) per vehicle.

### 3.8 Reports & Analytics
- Display Fuel Efficiency (Distance/Fuel), Fleet Utilization, Operational Cost, and Vehicle ROI: `(Revenue - (Maintenance + Fuel)) / Acquisition Cost`.
- Support CSV export; PDF export is optional.

## 4. Mandatory Business Rules
- The vehicle registration number must be unique.
- Retired or `In Shop` vehicles must never appear in the dispatch selection.
- Drivers with expired licenses or `Suspended` status cannot be assigned to trips.
- A driver or vehicle already marked `On Trip` cannot be assigned to another trip.
- Cargo Weight must not exceed the vehicle's maximum load capacity.
- Dispatching a trip automatically changes both the vehicle and driver status to `On Trip`.
- Completing a trip automatically changes both the vehicle and driver status back to `Available`.
- Cancelling a dispatched trip restores the vehicle and driver to `Available`.
- Creating an active maintenance record automatically changes vehicle status to `In Shop`.
- Closing maintenance restores the vehicle to `Available` (unless retired).

## 5. Expected Database Entities
- Users, Roles, Vehicles, Drivers, Trips, Maintenance Logs, Fuel Logs, Expenses

## 6. Mandatory Deliverables
- Responsive web interface
- Authentication with RBAC
- CRUD for Vehicles and Drivers
- Trip Management with validations
- Automatic status transitions
- Maintenance workflow
- Fuel & Expense tracking
- Dashboard with KPIs

---
**Mockup:** [View on Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/1FHGDNgD2td)
