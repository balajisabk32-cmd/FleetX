import supabase from '../config/supabase.js';

export const addVehicle = async (data) => {
    const { data: result, error } = await supabase
        .from('vehicles')
        .insert([data])
        .select('*')
        .single();
    if (error) throw new Error(error.message);
    return result;
};

export const getVehicles = async () => {
    const { data, error } = await supabase.from('vehicles').select('*');
    if (error) throw new Error(error.message);
    return data;
};
