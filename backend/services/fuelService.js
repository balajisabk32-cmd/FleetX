import supabase from '../config/supabase.js';

export const addFuelLog = async (data) => {
    const { data: result, error } = await supabase
        .from('fuel_logs')
        .insert([data])
        .select('*')
        .single();
    if (error) throw new Error(error.message);
    return result;
};

export const getFuelLogs = async (filters) => {
    let query = supabase.from('fuel_logs').select(`*, vehicles(license_plate)`, { count: 'exact' });
    
    if (filters.vehicle_id) {
        query = query.eq('vehicle_id', filters.vehicle_id);
    }
    if (filters.start_date) {
        query = query.gte('fuel_date', filters.start_date);
    }
    if (filters.end_date) {
        query = query.lte('fuel_date', filters.end_date);
    }
    
    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to);
    
    // Sorting
    const sort_by = filters.sort_by || 'fuel_date';
    const order = filters.order === 'asc' ? true : false;
    query = query.order(sort_by, { ascending: order });
    
    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { data, count, page, limit, totalPages: Math.ceil((count || 0) / limit) };
};

export const getFuelLogById = async (id) => {
    const { data, error } = await supabase
        .from('fuel_logs')
        .select('*, vehicles(license_plate)')
        .eq('id', id)
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const updateFuelLog = async (id, data) => {
    const { data: result, error } = await supabase
        .from('fuel_logs')
        .update(data)
        .eq('id', id)
        .select('*')
        .single();
    if (error) throw new Error(error.message);
    return result;
};

export const deleteFuelLog = async (id) => {
    const { error } = await supabase
        .from('fuel_logs')
        .delete()
        .eq('id', id);
    if (error) throw new Error(error.message);
    return true;
};
