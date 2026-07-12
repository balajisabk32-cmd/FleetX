import { supabase } from './src/config/supabase';

async function seedAndFetch() {
    console.log("Checking vehicles...");
    const { data: vehicles, error: vErr } = await supabase.from('vehicles').select('*');
    if (vErr) console.error("Error fetching vehicles:", vErr.message);
    console.log("Vehicles in DB:", vehicles);

    console.log("Checking drivers...");
    const { data: drivers, error: dErr } = await supabase.from('drivers').select('*');
    if (dErr) console.error("Error fetching drivers:", dErr.message);
    console.log("Drivers in DB:", drivers);

    if (vehicles && vehicles.length === 0) {
        console.log("No vehicles found. Seeding...");
        await supabase.from('vehicles').insert([
            { registrationNumber: 'TRK-001', model: 'Volvo', capacity: 20000, status: 'AVAILABLE' }
        ]);
        const { data: v2 } = await supabase.from('vehicles').select('*');
        console.log("New Vehicles:", v2);
    }
    
    if (drivers && drivers.length === 0) {
        console.log("No drivers found. Seeding...");
        await supabase.from('drivers').insert([
            { name: 'John Doe', licenseNumber: 'LIC-1001', licenseExpiry: '2030-12-31', status: 'AVAILABLE' }
        ]);
        const { data: d2 } = await supabase.from('drivers').select('*');
        console.log("New Drivers:", d2);
    }
}

seedAndFetch();
