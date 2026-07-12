import { supabase } from '../config/supabase';
import { Maintenance } from '../types';

export class MaintenanceService {
    static async createMaintenance(data: Partial<Maintenance>) {
        const { vehicle_id, issue, description, maintenance_type, priority, estimated_cost, mechanic_name, notes } = data;
        
        const { data: vehicle, error: vehicleError } = await supabase.from('vehicles').select('*').eq('id', vehicle_id).single();
        if (vehicleError || !vehicle) throw { status: 404, message: 'Vehicle not found' };

        await supabase.from('vehicles').update({ status: 'IN_SHOP' }).eq('id', vehicle_id);
        
        const { data: maintenance, error } = await supabase
            .from('maintenance')
            .insert([{ 
                vehicle_id, 
                issue, 
                description,
                maintenance_type,
                priority,
                estimated_cost,
                mechanic_name,
                notes,
                status: 'OPEN'
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return maintenance;
    }

    static async getAllMaintenance() {
        const { data, error } = await supabase
            .from('maintenance')
            .select(`*, vehicles(*)`)
            .order('id', { ascending: true });
            
        if (error) throw new Error(error.message);
        return data;
    }

    static async getMaintenanceById(id: string) {
        const { data, error } = await supabase
            .from('maintenance')
            .select(`*, vehicles(*)`)
            .eq('id', id)
            .single();
            
        if (error) throw { status: 404, message: 'Maintenance record not found' };
        return data;
    }

    static async updateMaintenance(id: string, data: Partial<Maintenance>) {
        const { data: existing, error: err } = await supabase.from('maintenance').select('*').eq('id', id).single();
        if (err || !existing) throw { status: 404, message: 'Maintenance not found' };
        if (existing.status !== 'OPEN') throw { status: 400, message: 'Only OPEN maintenance records can be updated' };

        const { issue, description, priority, mechanic_name, estimated_cost, notes } = data;
        
        const { data: updated, error } = await supabase
            .from('maintenance')
            .update({ issue, description, priority, mechanic_name, estimated_cost, notes })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return updated;
    }

    static async closeMaintenance(id: string, data: { actual_cost: number, completion_notes: string }) {
        const { data: maintenance, error: mainError } = await supabase.from('maintenance').select('*').eq('id', id).single();
        if (mainError || !maintenance) throw { status: 404, message: 'Maintenance record not found' };
        if (maintenance.status !== 'OPEN') throw { status: 400, message: 'Maintenance is already closed' };

        const { data: vehicle } = await supabase.from('vehicles').select('*').eq('id', maintenance.vehicle_id).single();
        
        const scoreDeductions: Record<string, number> = {
            'LOW': 2,
            'MEDIUM': 5,
            'HIGH': 10,
            'CRITICAL': 20
        };
        const deduction = scoreDeductions[maintenance.priority] || 0;
        const currentScore = vehicle?.service_score ?? 100;
        const newScore = Math.max(0, currentScore - deduction);

        await Promise.all([
            supabase.from('vehicles').update({ status: 'AVAILABLE', service_score: newScore }).eq('id', maintenance.vehicle_id),
            supabase.from('maintenance').update({ 
                status: 'CLOSED', 
                closed_at: new Date().toISOString(),
                actual_cost: data.actual_cost,
                notes: data.completion_notes 
            }).eq('id', maintenance.id)
        ]);
    }

    static async deleteMaintenance(id: string) {
        const { data: maintenance, error: mainError } = await supabase.from('maintenance').select('*').eq('id', id).single();
        if (mainError || !maintenance) throw { status: 404, message: 'Maintenance record not found' };
        if (maintenance.status !== 'CLOSED') throw { status: 400, message: 'Only CLOSED maintenance records can be deleted' };

        const { error } = await supabase.from('maintenance').delete().eq('id', id);
        if (error) throw new Error(error.message);
    }

    static async getMaintenanceHistory() {
        const { data, error } = await supabase
            .from('maintenance')
            .select(`*, vehicles(*)`)
            .order('opened_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data;
    }

    static async getReminders() {
        const { data: vehicles, error } = await supabase.from('vehicles').select('*');
        if (error) throw new Error(error.message);

        const reminders = await Promise.all(vehicles.map(async (v) => {
            const { data: lastMaint } = await supabase
                .from('maintenance')
                .select('closed_at')
                .eq('vehicle_id', v.id)
                .eq('status', 'CLOSED')
                .order('closed_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            let requiresMaintenance = false;
            if (v.service_score < 70) requiresMaintenance = true;

            const lastDate = lastMaint?.closed_at ? new Date(lastMaint.closed_at) : null;
            if (lastDate) {
                const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                if (daysSince > 180) requiresMaintenance = true;
            } else {
                requiresMaintenance = true; // Never maintained
            }

            return {
                vehicle_name: v.vehicle_name,
                last_maintenance_date: lastDate ? lastDate.toISOString() : 'Never',
                service_score: v.service_score,
                reminder_status: requiresMaintenance ? 'Maintenance Due' : 'No Maintenance Required'
            };
        }));
        return reminders;
    }
}
