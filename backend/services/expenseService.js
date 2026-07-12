import supabase from '../config/supabase.js';

export const addExpenseLog = async (data) => {
    const { data: result, error } = await supabase
        .from('expense_logs')
        .insert([data])
        .select('*')
        .single();
    if (error) throw new Error(error.message);
    return result;
};

export const getExpenseLogs = async (filters) => {
    let query = supabase.from('expense_logs').select(`*, vehicles(license_plate)`, { count: 'exact' });
    
    if (filters.vehicle_id) {
        query = query.eq('vehicle_id', filters.vehicle_id);
    }
    if (filters.category) {
        query = query.eq('category', filters.category);
    }
    if (filters.start_date) {
        query = query.gte('expense_date', filters.start_date);
    }
    if (filters.end_date) {
        query = query.lte('expense_date', filters.end_date);
    }
    
    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to);
    
    // Sorting
    const sort_by = filters.sort_by || 'expense_date';
    const order = filters.order === 'asc' ? true : false;
    query = query.order(sort_by, { ascending: order });
    
    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { data, count, page, limit, totalPages: Math.ceil((count || 0) / limit) };
};

export const getExpenseLogById = async (id) => {
    const { data, error } = await supabase
        .from('expense_logs')
        .select('*, vehicles(license_plate)')
        .eq('id', id)
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const updateExpenseLog = async (id, data) => {
    const { data: result, error } = await supabase
        .from('expense_logs')
        .update(data)
        .eq('id', id)
        .select('*')
        .single();
    if (error) throw new Error(error.message);
    return result;
};

export const deleteExpenseLog = async (id) => {
    const { error } = await supabase
        .from('expense_logs')
        .delete()
        .eq('id', id);
    if (error) throw new Error(error.message);
    return true;
};
