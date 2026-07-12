import { supabase } from '../config/supabase';
import { Trip, Vehicle, Driver } from '../types';

export class TripService {
    static async createTrip(data: Partial<Trip>) {
        const { vehicle_id, driver_id, source, destination, cargo_weight, planned_distance } = data;
        
        // Auto-generate trip number
        const year = new Date().getFullYear();
        const { data: latestTrip } = await supabase.from('trips').select('id').order('id', { ascending: false }).limit(1).maybeSingle();
        const nextNum = (latestTrip?.id || 0) + 1;
        const trip_number = `TRIP-${year}-${String(nextNum).padStart(3, '0')}`;

        // Calculate ETA (60 km/h)
        const speed = 60;
        const dist = planned_distance || 0;
        const estimated_travel_time = parseFloat((dist / speed).toFixed(2));
        const estimated_arrival_time = new Date(Date.now() + estimated_travel_time * 60 * 60 * 1000).toISOString();
        
        const { data: trip, error } = await supabase
            .from('trips')
            .insert([{
                trip_number,
                vehicle_id,
                driver_id,
                source,
                destination,
                cargo_weight,
                planned_distance,
                estimated_travel_time,
                estimated_arrival_time,
                status: 'DRAFT'
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return trip;
    }

    static async getAllTrips() {
        const { data, error } = await supabase
            .from('trips')
            .select(`*, vehicles(*), drivers(*)`)
            .order('id', { ascending: true });
            
        if (error) throw new Error(error.message);
        return data;
    }

    static async getTripById(id: string) {
        const { data, error } = await supabase
            .from('trips')
            .select(`*, vehicles(*), drivers(*)`)
            .eq('id', id)
            .single();
            
        if (error) throw new Error(error.message);
        return data;
    }

    static async updateTrip(id: string, data: Partial<Trip>) {
        const { data: trip, error } = await supabase
            .from('trips')
            .update(data)
            .eq('id', id)
            .select()
            .single();
            
        if (error) throw new Error(error.message);
        return trip;
    }

    static async deleteTrip(id: string) {
        const { error } = await supabase.from('trips').delete().eq('id', id);
        if (error) throw new Error(error.message);
    }

    static async dispatchTrip(id: string) {
        const { data: trip, error: tripError } = await supabase.from('trips').select('*').eq('id', id).single();
        if (tripError || !trip) throw { status: 404, message: 'Trip not found' };
        if (trip.status !== 'DRAFT') throw { status: 400, message: 'Only DRAFT trips can be dispatched' };

        const { data: vehicle } = await supabase.from('vehicles').select('*').eq('id', trip.vehicle_id).single();
        const { data: driver } = await supabase.from('drivers').select('*').eq('id', trip.driver_id).single();

        if (!vehicle) throw { status: 404, message: 'Vehicle not found' };
        if (!driver) throw { status: 404, message: 'Driver not found' };

        if (vehicle.status !== 'AVAILABLE') throw { status: 400, message: 'Vehicle is not available' };
        if (driver.status !== 'AVAILABLE') throw { status: 400, message: 'Driver is not available' };
        if (driver.status === 'SUSPENDED') throw { status: 400, message: 'Driver is suspended' };
        
        const today = new Date().toISOString().split('T')[0];
        if (driver.license_expiry < today) throw { status: 400, message: 'Driver license is expired' };
        if (trip.cargo_weight > vehicle.maximum_load_capacity) throw { status: 400, message: `Cargo weight (${trip.cargo_weight}) exceeds vehicle capacity (${vehicle.maximum_load_capacity})` };

        await Promise.all([
            supabase.from('vehicles').update({ status: 'ON_TRIP' }).eq('id', vehicle.id),
            supabase.from('drivers').update({ status: 'ON_TRIP' }).eq('id', driver.id),
            supabase.from('trips').update({ status: 'DISPATCHED', dispatch_time: new Date().toISOString() }).eq('id', trip.id)
        ]);
    }

    static async completeTrip(id: string) {
        const { data: trip, error: tripError } = await supabase.from('trips').select('*').eq('id', id).single();
        if (tripError || !trip) throw { status: 404, message: 'Trip not found' };
        if (trip.status !== 'DISPATCHED') throw { status: 400, message: 'Only DISPATCHED trips can be completed' };

        await Promise.all([
            supabase.from('vehicles').update({ status: 'AVAILABLE' }).eq('id', trip.vehicle_id),
            supabase.from('drivers').update({ status: 'AVAILABLE' }).eq('id', trip.driver_id),
            supabase.from('trips').update({ status: 'COMPLETED', completed_time: new Date().toISOString() }).eq('id', trip.id)
        ]);
    }

    static async cancelTrip(id: string) {
        const { data: trip, error: tripError } = await supabase.from('trips').select('*').eq('id', id).single();
        if (tripError || !trip) throw { status: 404, message: 'Trip not found' };
        if (trip.status !== 'DRAFT') throw { status: 400, message: 'Only DRAFT trips can be cancelled' };

        await Promise.all([
            supabase.from('vehicles').update({ status: 'AVAILABLE' }).eq('id', trip.vehicle_id),
            supabase.from('drivers').update({ status: 'AVAILABLE' }).eq('id', trip.driver_id),
            supabase.from('trips').update({ status: 'CANCELLED' }).eq('id', trip.id)
        ]);
    }

    static async getTripHistory() {
        const { data, error } = await supabase
            .from('trips')
            .select(`*, vehicles(*), drivers(*)`)
            .order('created_at', { ascending: false });
            
        if (error) throw new Error(error.message);
        return data;
    }
}
