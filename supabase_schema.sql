-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: vehicles
CREATE TABLE vehicles (
    id VARCHAR(50) PRIMARY KEY, -- Custom Vehicle ID
    license_plate VARCHAR(50),
    make VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    fuel_capacity NUMERIC(10, 2) NOT NULL,
    acquisition_cost NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: fuel_logs
CREATE TABLE fuel_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE CASCADE,
    fuel_date DATE NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL, -- Liters
    price_per_liter NUMERIC(10, 2) NOT NULL,
    total_cost NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * price_per_liter) STORED,
    odometer NUMERIC(10, 2) NOT NULL,
    station VARCHAR(255),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: expense_logs
CREATE TABLE expense_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Maintenance', 'Toll', 'Parking', 'Insurance', 'Fine', 'Miscellaneous')),
    amount NUMERIC(12, 2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: maintenance_logs (Required for Analytics)
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    description TEXT NOT NULL,
    cost NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: trip_logs (Required for Analytics)
CREATE TABLE trip_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    distance NUMERIC(10, 2) NOT NULL,
    start_odometer NUMERIC(10, 2),
    end_odometer NUMERIC(10, 2),
    revenue NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Functions to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_vehicles_modtime BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_fuel_logs_modtime BEFORE UPDATE ON fuel_logs FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_expense_logs_modtime BEFORE UPDATE ON expense_logs FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_maintenance_logs_modtime BEFORE UPDATE ON maintenance_logs FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_trip_logs_modtime BEFORE UPDATE ON trip_logs FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
