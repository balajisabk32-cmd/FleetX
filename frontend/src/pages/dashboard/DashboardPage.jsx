import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, ChartLineUp, Warning, CurrencyDollar, 
  ArrowUpRight, GasPump, Wrench, ShieldCheck, DownloadSimple,
  TrendUp, NavigationArrow, Trophy, Skull
} from '@phosphor-icons/react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePoint, setActivePoint] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, vehRes, driverRes, tripRes] = await Promise.all([
          fetch('http://localhost:5000/api/analytics/dashboard', { credentials: 'include' }),
          fetch('http://localhost:5000/api/vehicles', { credentials: 'include' }),
          fetch('http://localhost:5000/api/drivers', { credentials: 'include' }),
          fetch('http://localhost:5000/api/trips', { credentials: 'include' })
        ]);

        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setDashboardData(dashData.data);
        }
        if (vehRes.ok) {
          const vehData = await vehRes.json();
          setVehicles(vehData.vehicles || vehData || []);
        }
        if (driverRes.ok) {
          const driverData = await driverRes.json();
          setDrivers(driverData.drivers || driverData || []);
        }
        if (tripRes.ok) {
          const tripData = await tripRes.json();
          setTrips(tripData || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute stats
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'Available' || v.status === 'On Trip').length;
  const onTripVehicles = vehicles.filter(v => v.status === 'On Trip').length;
  const utilization = totalVehicles > 0 ? ((onTripVehicles / totalVehicles) * 100).toFixed(1) : 0;

  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;

  const totalTrips = trips.length;
  const ongoingTrips = trips.filter(t => t.status === 'DISPATCHED').length;

  // Forecast data for graph
  const forecast = dashboardData?.expense_forecast;
  const prevMonthsData = forecast?.previous_months || {};
  
  // Format graph data
  const months = Object.keys(prevMonthsData).sort();
  const expenseValues = months.map(m => prevMonthsData[m]);
  
  // Add current and predicted if available
  if (forecast?.current_month_expense !== undefined) {
    months.push('Current');
    expenseValues.push(forecast.current_month_expense);
  }
  if (forecast?.predicted_expense !== undefined) {
    months.push('Forecast');
    expenseValues.push(forecast.predicted_expense);
  }

  // Find min/max for scaling SVG line graph
  const maxVal = Math.max(...expenseValues, 1000) * 1.1;
  const minVal = Math.min(...expenseValues, 0);
  const range = maxVal - minVal;

  const graphWidth = 500;
  const graphHeight = 150;
  const points = expenseValues.map((val, index) => {
    const x = (index / (expenseValues.length - 1 || 1)) * graphWidth;
    const y = graphHeight - ((val - minVal) / range) * graphHeight;
    return { x, y, val };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const fillD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${graphHeight} L ${points[0].x} ${graphHeight} Z`
    : '';

  const handleMouseMove = (e) => {
    if (!points || !points.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * graphWidth;
    
    let closest = points[0];
    let minDist = Math.abs(points[0].x - x);
    for (let i = 1; i < points.length; i++) {
      const dist = Math.abs(points[i].x - x);
      if (dist < minDist) {
        minDist = dist;
        closest = points[i];
      }
    }
    
    const idx = points.indexOf(closest);
    setActivePoint({ ...closest, month: months[idx] });
  };

  const handleMouseLeave = () => {
    setActivePoint(null);
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 text-white/50">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium tracking-wide">Syncing Command Center...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-16 flex flex-col print:text-black print:bg-white">
      
      {/* Print-only Header */}
      <div className="hidden print:flex flex-col mb-8 border-b-2 border-gray-200 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">FleetX Fleet Operations Report</h1>
        <p className="text-sm text-gray-500 mt-1">Generated on: {new Date().toLocaleString()}</p>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pt-4 md:pt-0 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold bg-primary/10 text-primary border border-primary/20 mb-4 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Live Workspace
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            Command Center
          </h1>
        </div>
        
        <div className="mt-6 md:mt-0 flex gap-3">
          <Button 
            onClick={() => window.print()}
            className="rounded-2xl h-11 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white flex items-center gap-2 px-5 shadow-lg backdrop-blur-md transition-all active:scale-95"
          >
            <DownloadSimple size={18} />
            <span className="text-sm font-semibold">Print Report</span>
          </Button>
        </div>
      </div>

      {/* Key Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Fleet Utilization",
            value: `${utilization}%`,
            sub: `${onTripVehicles} of ${totalVehicles} Vehicles Active`,
            icon: <ChartLineUp size={22} className="text-emerald-400" />,
            color: "emerald"
          },
          {
            title: "Active Drivers",
            value: `${activeDrivers}`,
            sub: `${totalDrivers - activeDrivers} Currently Suspended/Off`,
            icon: <ShieldCheck size={22} className="text-blue-400" />,
            color: "blue"
          },
          {
            title: "Trips Dispatched",
            value: `${totalTrips}`,
            sub: `${ongoingTrips} Ongoing Trips right now`,
            icon: <NavigationArrow size={22} className="text-violet-400" />,
            color: "violet"
          },
          {
            title: "Operational Costs",
            value: `$${(dashboardData?.total_operational_cost || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}`,
            sub: `Fuel + Expenses + Maintenance`,
            icon: <CurrencyDollar size={22} className="text-amber-400" />,
            color: "amber"
          }
        ].map((card, idx) => {
          const driverRatio = totalDrivers > 0 ? (activeDrivers / totalDrivers) * 100 : 0;
          const costRatio = Math.min(((dashboardData?.total_operational_cost || 0) / 15000) * 100, 100);

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
              className="relative overflow-hidden group bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] hover:border-white/[0.12] rounded-3xl p-6 transition-all duration-300 shadow-xl"
            >
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/[0.01] rounded-full group-hover:scale-125 transition-transform duration-500"></div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-semibold text-white/50 tracking-wide">{card.title}</span>
                <div className={`p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]`}>
                  {card.icon}
                </div>
              </div>
              
              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="text-3xl font-bold tracking-tight">{card.value}</h3>
                {card.title === "Trips Dispatched" && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              {card.title === "Fleet Utilization" && (
                <div className="w-full bg-white/[0.04] h-1 rounded-full my-2.5 overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${utilization}%` }}
                    transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
                    className="bg-emerald-400 h-full rounded-full"
                  />
                </div>
              )}

              {card.title === "Active Drivers" && (
                <div className="w-full bg-white/[0.04] h-1 rounded-full my-2.5 overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${driverRatio}%` }}
                    transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
                    className="bg-blue-400 h-full rounded-full"
                  />
                </div>
              )}

              {card.title === "Operational Costs" && (
                <div className="w-full bg-white/[0.04] h-1 rounded-full my-2.5 overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${costRatio}%` }}
                    transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
                    className="bg-amber-400 h-full rounded-full"
                  />
                </div>
              )}

              <p className="text-xs text-white/40 font-medium mt-1">{card.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart Card (Glassmorphism + Motion Graph) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8 bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-[2rem] p-6 md:p-8 flex flex-col relative overflow-hidden shadow-2xl"
        >
          <div className="absolute right-0 top-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-lg font-bold tracking-tight mb-1">Operational Expense Trends</h3>
              <p className="text-xs text-white/40">Includes Fuel costs, Maintenances, and Tolls</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/60">Actual & Forecast</span>
              </div>
            </div>
          </div>

          {/* Render real motion.dev inspired SVG graph */}
          {expenseValues.length > 0 ? (
            <div className="flex-1 flex flex-col justify-end relative">
              {/* Floating Tooltip */}
              <AnimatePresence>
                {activePoint && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute top-0 left-6 bg-[#0a0a0c]/90 border border-white/10 backdrop-blur-xl px-4 py-2.5 rounded-2xl flex flex-col pointer-events-none shadow-2xl z-30"
                  >
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{activePoint.month}</span>
                    <span className="text-lg font-extrabold text-white mt-0.5">${activePoint.val.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full h-44 relative mt-4">
                <svg 
                  className="w-full h-full overflow-visible" 
                  viewBox={`0 0 ${graphWidth} ${graphHeight}`} 
                  preserveAspectRatio="none"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
                    <line 
                      key={i} 
                      x1="0" 
                      y1={graphHeight * r} 
                      x2={graphWidth} 
                      y2={graphHeight * r} 
                      stroke="rgba(255,255,255,0.03)" 
                      strokeWidth="1" 
                    />
                  ))}
                  
                  {/* Fill Area with Gradient */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {fillD && <path d={fillD} fill="url(#chartGradient)" />}

                  {/* Stroke path animated with framer motion */}
                  {pathD && (
                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  )}

                  {/* Active Point Vertical Line */}
                  {activePoint && (
                    <line 
                      x1={activePoint.x} 
                      y1="0" 
                      x2={activePoint.x} 
                      y2={graphHeight} 
                      stroke="rgba(59, 130, 246, 0.25)" 
                      strokeWidth="1.5" 
                      strokeDasharray="4 4" 
                    />
                  )}

                  {/* Glowing Points */}
                  {points.map((p, i) => {
                    const isHovered = activePoint && activePoint.x === p.x;
                    return (
                      <g key={i}>
                        <motion.circle 
                          cx={p.x} 
                          cy={p.y} 
                          animate={{ r: isHovered ? 7 : 4 }}
                          fill="#3b82f6" 
                          className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              {/* X-Axis Labels */}
              <div className="flex justify-between items-center mt-3 px-1 border-t border-white/5 pt-2">
                {months.map((m, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{m}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-white/30">
              No operational cost logs available to display.
            </div>
          )}
        </motion.div>

        {/* Small Bento Cards Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Best / Worst Vehicle (Glassmorphism Bento) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-[2rem] p-6 flex flex-col gap-4 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 blur-[40px] pointer-events-none"></div>
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Fleet Rankings</h4>
            
            <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 hover:bg-white/[0.04] transition-colors">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                <Trophy size={20} />
              </div>
              <div className="overflow-hidden">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">Top Performer</span>
                <span className="block text-sm font-bold text-white truncate">
                  {dashboardData?.best_vehicle?.vehicle_name || dashboardData?.best_vehicle?.registration_number || 'N/A'}
                </span>
                <span className="text-[10px] text-white/40 font-medium">Optimal Fuel & Health</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 hover:bg-white/[0.04] transition-colors">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
                <Skull size={20} />
              </div>
              <div className="overflow-hidden">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-400">Needs Inspection</span>
                <span className="block text-sm font-bold text-white truncate">
                  {dashboardData?.worst_vehicle?.vehicle_name || dashboardData?.worst_vehicle?.registration_number || 'N/A'}
                </span>
                <span className="text-[10px] text-white/40 font-medium">High Maintenance Freq</span>
              </div>
            </div>
          </motion.div>

          {/* Maintenance Suggesions Link card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            onClick={() => navigate('/dashboard/maintenance')}
            className="group cursor-pointer bg-gradient-to-br from-amber-500/[0.05] to-transparent hover:from-amber-500/[0.08] backdrop-blur-xl border border-amber-500/15 rounded-[2rem] p-6 flex flex-col justify-between h-40 shadow-xl transition-all duration-300 active:scale-95"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
                <Wrench size={22} weight="duotone" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
                <ArrowUpRight size={16} />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">Maintenance Suggestions</h4>
              <p className="text-xs text-white/50">{dashboardData?.vehicles_needing_maintenance || 0} vehicles scoring below threshold.</p>
            </div>
          </motion.div>

        </div>

      </div>

      {/* Fuel Theft / Alerts & Active Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Critical Alerts Bento Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-[2rem] p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6">
            <Warning size={20} className="text-rose-400" />
            <h3 className="text-lg font-bold tracking-tight">Security & Fuel Alerts</h3>
          </div>
          
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {dashboardData?.fuel_theft_alerts_count > 0 ? (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex gap-4 items-start">
                <div className="p-2 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 shrink-0">
                  <GasPump size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-400">Suspicious Refueling Activity</h4>
                  <p className="text-xs text-white/60 mt-1">
                    System flag: Detected {dashboardData.fuel_theft_alerts_count} anomalies where refuel volume exceeded vehicle tank capacity or occurred multiple times within 24h.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-white/30 font-medium">
                No active security or theft alerts detected.
              </div>
            )}
          </div>
        </motion.div>

        {/* Forecast Insights Bento Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-[2rem] p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendUp size={20} className="text-indigo-400" />
            <h3 className="text-lg font-bold tracking-tight">Predictive Financials</h3>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <span className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Next Month Forecast</span>
              <span className="block text-2xl font-bold text-white mt-1">
                ${(dashboardData?.monthly_summary?.predicted_next || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Current Month</span>
              <span className="block text-lg font-bold text-white/80 mt-1">
                ${(dashboardData?.monthly_summary?.current_month || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-white/40 mt-4 leading-relaxed font-medium">
            *Forecast is calculated based on a 3-month moving average of fuel logs, maintenance claims, and miscellaneous operational receipts.
          </p>
        </motion.div>

      </div>

    </div>
  );
}
