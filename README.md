# Fleet Management System - Module 3.5 & 3.6 (TypeScript)

This module implements Trip Management (3.5) and Maintenance (3.6) using **Node.js, TypeScript, Express, and Supabase**. It uses a strict `snake_case` schema as requested, and features advanced Maintenance tracking (priorities, mechanic assignments, cost tracking).

## Setup Instructions

### 1. Supabase Database Configuration (REQUIRED UPDATE)
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
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE'
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
    vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id INT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    cargo_weight DECIMAL(10, 2) NOT NULL CHECK (cargo_weight > 0),
    planned_distance DECIMAL(10, 2) NOT NULL CHECK (planned_distance > 0),
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
INSERT INTO vehicles (registration_number, vehicle_name, vehicle_type, maximum_load_capacity, status) VALUES
('TRK-001', 'Volvo FH16', 'Heavy Truck', 20000, 'AVAILABLE'),
('TRK-002', 'Scania R500', 'Heavy Truck', 18000, 'AVAILABLE'),
('TRK-003', 'Mercedes Sprinter', 'Van', 3000, 'AVAILABLE');

INSERT INTO drivers (name, license_number, license_expiry, contact_number, status) VALUES
('John Doe', 'LIC-1001', '2030-12-31', '555-0101', 'AVAILABLE'),
('Jane Smith', 'LIC-1002', '2028-05-15', '555-0102', 'AVAILABLE'),
('Mike Johnson', 'LIC-1003', '2022-01-01', '555-0103', 'AVAILABLE'); -- Expired for testing constraints

NOTIFY pgrst, 'reload schema';
```

### 2. Environment Variables
Your `.env` file is already configured properly.

### 3. Run the Application
Start the TypeScript development server:
```bash
npm run dev
```

Visit the testing dashboard at `http://localhost:8080`.
