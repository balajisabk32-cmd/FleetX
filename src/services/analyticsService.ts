import { supabase } from '../config/supabase';

export const getHealthScore = async () => {
    const { data: vehicles, error } = await supabase.from('vehicles').select('*');
    if (error) throw new Error(error.message);
    if (!vehicles) return [];

    const healthScores = [];

    for (const vehicle of vehicles) {
        const { data: fuelLogs } = await supabase.from('fuel_logs').select('*').eq('vehicle_id', vehicle.id);
        const { data: maintenanceLogs } = await supabase.from('maintenance').select('*').eq('vehicle_id', vehicle.id);
        const { data: tripLogs } = await supabase.from('trips').select('*').eq('vehicle_id', vehicle.id);
        const { data: expenseLogs } = await supabase.from('expense_logs').select('*').eq('vehicle_id', vehicle.id);

        let totalFuelCost = 0;
        let totalQuantity = 0;
        fuelLogs?.forEach(log => {
            totalFuelCost += Number(log.total_cost || 0);
            totalQuantity += Number(log.quantity || 0);
        });

        let totalDistance = 0;
        let totalRevenue = 0;
        let totalDaysActive = new Set<string>();
        tripLogs?.forEach(log => {
            totalDistance += Number(log.planned_distance || 0);
            // In trips table, it might not have 'revenue', but we can assume some constant or planned_distance * rate
            totalRevenue += Number((log as any).revenue || (log.planned_distance ? log.planned_distance * 1.5 : 0));
            if (log.created_at) totalDaysActive.add(log.created_at.split('T')[0]);
        });

        let totalMaintenanceCost = 0;
        maintenanceLogs?.forEach(log => {
            totalMaintenanceCost += Number(log.actual_cost || log.estimated_cost || 0);
        });

        let totalOtherExpenses = 0;
        expenseLogs?.forEach(log => {
            totalOtherExpenses += Number(log.amount || 0);
        });

        const fuelEfficiency = totalQuantity > 0 ? (totalDistance / totalQuantity) : 0;
        const operationalCost = totalFuelCost + totalMaintenanceCost + totalOtherExpenses;
        
        const acquisitionCost = Number((vehicle as any).acquisition_cost || 50000); // fallback acquisition cost
        const roi = acquisitionCost > 0 ? ((totalRevenue - (totalMaintenanceCost + totalFuelCost)) / acquisitionCost) : 0;
        
        const fleetUtilization = totalDaysActive.size;
        
        let score = 100;

        if (totalDistance > 0 && fuelEfficiency > 0 && fuelEfficiency < 8) {
            score -= (8 - fuelEfficiency) * 2; 
        }

        if (maintenanceLogs && maintenanceLogs.length > 5) {
            score -= (maintenanceLogs.length - 5) * 5;
        }

        if (operationalCost > 0) {
            const maintenanceRatio = totalMaintenanceCost / operationalCost;
            if (maintenanceRatio > 0.3) {
                score -= (maintenanceRatio - 0.3) * 100;
            }
        }

        score = Math.max(0, Math.min(100, Math.round(score)));

        let status = 'Excellent';
        if (score < 40) status = 'Critical';
        else if (score < 60) status = 'Poor';
        else if (score < 75) status = 'Average';
        else if (score < 90) status = 'Good';

        healthScores.push({
            vehicle: vehicle,
            health_score: score,
            status: status,
            fuel_efficiency: fuelEfficiency.toFixed(2),
            operational_cost: operationalCost.toFixed(2),
            roi: roi.toFixed(4),
            fleet_utilization_days: fleetUtilization,
            total_revenue: totalRevenue.toFixed(2),
            maintenance_frequency: maintenanceLogs ? maintenanceLogs.length : 0,
            number_of_trips: tripLogs ? tripLogs.length : 0,
            maintenance_cost: totalMaintenanceCost
        });
    }

    return healthScores;
};

export const getExpenseForecast = async () => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const prevMonths = [];
    for(let i=1; i<=3; i++) {
        let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        prevMonths.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const { data: allExpenses, error: e1 } = await supabase.from('expense_logs').select('expense_date, amount');
    const { data: allFuel, error: e2 } = await supabase.from('fuel_logs').select('fuel_date, total_cost');
    const { data: allMaintenance, error: e3 } = await supabase.from('maintenance').select('opened_at, actual_cost, estimated_cost');

    if (e1 || e2 || e3) throw new Error("Error fetching data for forecast");

    const monthTotals: Record<string, number> = {};
    const addToMonth = (dateStr: string, amount: number) => {
        const monthKey = dateStr.substring(0, 7);
        if (!monthTotals[monthKey]) monthTotals[monthKey] = 0;
        monthTotals[monthKey] += Number(amount);
    };

    allExpenses?.forEach(log => addToMonth(log.expense_date, log.amount));
    allFuel?.forEach(log => addToMonth(log.fuel_date, log.total_cost));
    allMaintenance?.forEach(log => addToMonth(log.opened_at, log.actual_cost || log.estimated_cost || 0));

    const currentMonthExpense = monthTotals[currentMonthStr] || 0;
    
    let sumPrev = 0;
    let prevData: Record<string, number> = {};
    prevMonths.forEach(pm => {
        const val = monthTotals[pm] || 0;
        sumPrev += val;
        prevData[pm] = val;
    });

    const predictedExpense = sumPrev / 3;

    return {
        current_month_expense: currentMonthExpense,
        previous_months: prevData,
        predicted_expense: predictedExpense
    };
};

export const getFuelTheft = async () => {
    const { data: vehicles } = await supabase.from('vehicles').select('*');
    if (!vehicles) return [];

    const suspiciousLogs = [];

    for (const vehicle of vehicles) {
        const { data: fuelLogs } = await supabase.from('fuel_logs')
            .select('*')
            .eq('vehicle_id', vehicle.id)
            .order('fuel_date', { ascending: true });

        if (!fuelLogs || fuelLogs.length === 0) continue;

        let totalQty = 0;
        fuelLogs.forEach(l => totalQty += Number(l.quantity));
        const avgQty = totalQty / fuelLogs.length;

        for (let i = 0; i < fuelLogs.length; i++) {
            const log = fuelLogs[i];
            const qty = Number(log.quantity);
            const capacity = Number((vehicle as any).fuel_capacity || 100);

            if (qty > capacity) {
                suspiciousLogs.push({
                    vehicle: vehicle,
                    log: log,
                    reason: 'Fuel quantity exceeds tank capacity',
                    severity: 'Critical'
                });
            }

            if (fuelLogs.length > 3 && qty > avgQty * 1.5 && qty <= capacity) {
                suspiciousLogs.push({
                    vehicle: vehicle,
                    log: log,
                    reason: 'Fuel quantity is unusually high compared to vehicle average',
                    severity: 'High'
                });
            }

            if (i > 0) {
                const prevLog = fuelLogs[i - 1];
                const timeDiff = new Date(log.fuel_date).getTime() - new Date(prevLog.fuel_date).getTime();
                const daysDiff = timeDiff / (1000 * 3600 * 24);
                
                if (daysDiff < 1) {
                    suspiciousLogs.push({
                        vehicle: vehicle,
                        log: log,
                        reason: 'Multiple refuels within 24 hours',
                        severity: 'Medium'
                    });
                }
            }
        }
    }

    return suspiciousLogs;
};

export const getRankings = async () => {
    const healthData = await getHealthScore();
    
    const rankings = {
        highest_fuel_efficiency: [...healthData].sort((a, b) => Number(b.fuel_efficiency) - Number(a.fuel_efficiency)).slice(0, 10),
        lowest_operational_cost: [...healthData].sort((a, b) => Number(a.operational_cost) - Number(b.operational_cost)).slice(0, 10),
        highest_health_score: [...healthData].sort((a, b) => b.health_score - a.health_score).slice(0, 10),
        lowest_maintenance_cost: [...healthData].sort((a, b) => a.maintenance_cost - b.maintenance_cost).slice(0, 10)
    };

    return rankings;
};

export const getMaintenanceSuggestions = async () => {
    const healthData = await getHealthScore();
    const suggestions = [];

    healthData.forEach(data => {
        if (data.health_score < 60) {
            suggestions.push({
                vehicle: data.vehicle,
                recommendation: 'Schedule Full Maintenance',
                reason: 'Health score is low/critical',
                priority: data.health_score < 40 ? 'Critical' : 'High'
            });
        }
        
        if (data.maintenance_cost > Number(data.operational_cost) * 0.4 && data.maintenance_cost > 0) {
             suggestions.push({
                vehicle: data.vehicle,
                recommendation: 'Consider Replacement',
                reason: 'Maintenance cost is disproportionately high',
                priority: 'High'
            });
        }

        if (Number(data.fuel_efficiency) > 0 && Number(data.fuel_efficiency) < 8) {
             suggestions.push({
                vehicle: data.vehicle,
                recommendation: 'Engine & Tire Inspection',
                reason: 'Low fuel efficiency',
                priority: 'Medium'
            });
        }
    });

    return suggestions;
};

export const getDashboard = async () => {
    const healthData = await getHealthScore();
    const forecast = await getExpenseForecast();
    const theftLogs = await getFuelTheft();

    let totalFuelCost = 0;
    let totalExpense = 0;
    
    const { data: fuelLogs } = await supabase.from('fuel_logs').select('total_cost');
    const { data: expenseLogs } = await supabase.from('expense_logs').select('amount');
    const { data: maintLogs } = await supabase.from('maintenance').select('actual_cost, estimated_cost');

    fuelLogs?.forEach(l => totalFuelCost += Number(l.total_cost || 0));
    expenseLogs?.forEach(l => totalExpense += Number(l.amount || 0));
    maintLogs?.forEach(l => totalExpense += Number(l.actual_cost || l.estimated_cost || 0));

    const totalOperationalCost = totalFuelCost + totalExpense;

    let bestVehicle = null;
    let worstVehicle = null;
    let totalScore = 0;
    let vehiclesNeedingMaintenance = 0;

    if (healthData.length > 0) {
        const sortedByHealth = [...healthData].sort((a, b) => b.health_score - a.health_score);
        bestVehicle = sortedByHealth[0];
        worstVehicle = sortedByHealth[sortedByHealth.length - 1];
        
        healthData.forEach(d => {
            totalScore += d.health_score;
            if (d.health_score < 75) vehiclesNeedingMaintenance++;
        });
    }

    return {
        total_fuel_cost: totalFuelCost,
        total_expense: totalExpense,
        total_operational_cost: totalOperationalCost,
        best_vehicle: bestVehicle ? bestVehicle.vehicle : null,
        worst_vehicle: worstVehicle ? worstVehicle.vehicle : null,
        vehicles_needing_maintenance: vehiclesNeedingMaintenance,
        fuel_theft_alerts_count: theftLogs.length,
        average_fleet_health_score: healthData.length > 0 ? (totalScore / healthData.length).toFixed(2) : 0,
        top_ranked_vehicle: bestVehicle ? bestVehicle.vehicle : null,
        expense_forecast: forecast,
        monthly_summary: {
            current_month: forecast.current_month_expense,
            predicted_next: forecast.predicted_expense
        }
    };
};
