export type TripStatus = 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';
export type MaintenanceStatus = 'OPEN' | 'CLOSED';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED';

export interface Vehicle {
    id: number;
    registration_number: string;
    vehicle_name: string;
    vehicle_type: string;
    maximum_load_capacity: number;
    status: VehicleStatus;
    service_score: number;
}

export interface Driver {
    id: number;
    name: string;
    license_number: string;
    license_expiry: string;
    contact_number: string;
    status: DriverStatus;
}

export interface Trip {
    id: number;
    trip_number: string;
    vehicle_id: number;
    driver_id: number;
    source: string;
    destination: string;
    cargo_weight: number;
    planned_distance: number;
    estimated_travel_time: number;
    estimated_arrival_time: string;
    status: TripStatus;
    created_at: string;
    dispatch_time?: string;
    completed_time?: string;
}

export interface Maintenance {
    id: number;
    vehicle_id: number;
    issue: string;
    description: string;
    maintenance_type: string;
    priority: MaintenancePriority;
    estimated_cost: number;
    actual_cost?: number;
    mechanic_name: string;
    status: MaintenanceStatus;
    opened_at: string;
    closed_at?: string;
    notes?: string;
}
