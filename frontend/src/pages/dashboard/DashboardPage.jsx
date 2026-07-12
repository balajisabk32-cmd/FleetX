import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  CarProfile, ChartLineUp, Warning, CurrencyDollar, 
  ArrowUpRight, GasPump, Wrench, ShieldCheck 
} from '@phosphor-icons/react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(useGSAP);

export default function DashboardPage() {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  
  const [vehicles, setVehicles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehRes, notifRes] = await Promise.all([
          fetch('http://localhost:5000/api/vehicles', { credentials: 'include' }),
          fetch('http://localhost:5000/api/notifications', { credentials: 'include' })
        ]);
        
        if (vehRes.ok) {
          const vehData = await vehRes.json();
          setVehicles(vehData);
        }
        
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate Metrics
  const totalVehicles = vehicles.length;
  // Let's assume "Active" means not "In Shop"
  const activeVehicles = vehicles.filter(v => v.status !== 'In Shop').length;
  // Utilization = (On Trip / Total)
  const onTripVehicles = vehicles.filter(v => v.status === 'On Trip').length;
  const utilization = totalVehicles === 0 ? 0 : ((onTripVehicles / totalVehicles) * 100).toFixed(1);

  // Staggered Entry Animation for Bento Grid
  useGSAP(() => {
    if (!loading) {
      gsap.from('.bento-card', {
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: 'power3.out',
        filter: 'blur(8px)',
        delay: 0.1
      });
      
      gsap.from('.dash-title', {
        x: -30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    }
  }, { scope: pageRef, dependencies: [loading] });

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-white/50">Loading dashboard...</div>;
  }

  return (
    <div ref={pageRef} className="w-full h-full flex flex-col">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 dash-title pt-4 md:pt-0">
        <div>
          <div className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
            Workspace Overview
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Command Center</h1>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-4">
          <Button variant="secondary" className="rounded-full h-10 group bg-white/5 border-white/10 hover:bg-white/10">
            <span className="flex items-center gap-2 text-white/70">
              Download Report 
              <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </Button>
        </div>
      </div>

      {/* Asymmetrical Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-24">
        
        {/* Main Stats: Revenue vs Cost (col-span-8) */}
        <div className="md:col-span-8 row-span-2 outer-shell bento-card h-[400px]">
          <div className="inner-core h-full bg-[#050505] p-6 md:p-8 flex flex-col relative overflow-hidden">
            {/* Background Graphic */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60"></div>
            
            <div className="flex justify-between items-start z-10 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-1">Financial Health</h3>
                <p className="text-sm text-white/40">Real-time Revenue vs. Operational Costs</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                  <span className="text-xs text-white/60 uppercase tracking-wider font-medium">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-danger shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                  <span className="text-xs text-white/60 uppercase tracking-wider font-medium">Cost</span>
                </div>
              </div>
            </div>

            <div className="flex-1 relative z-10 flex flex-col justify-end">
               <div className="flex items-end gap-6 mb-8">
                 <div>
                   <span className="block text-4xl font-bold text-white">$142.8K</span>
                   <span className="text-sm text-success flex items-center gap-1 mt-1">
                     <ArrowUpRight weight="bold"/> +12.4% vs last month
                   </span>
                 </div>
               </div>
               {/* Mock Graph */}
               <div className="w-full h-32 relative border-b border-l border-white/10">
                 <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,80 Q20,60 40,70 T60,40 T80,50 T100,20" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                    <path d="M0,90 Q30,85 50,75 T70,80 T100,70" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                 </svg>
               </div>
            </div>
          </div>
        </div>

        {/* Small Stat 1: Fleet Utilization (col-span-4) */}
        <div className="md:col-span-4 outer-shell bento-card">
          <div className="inner-core h-full bg-[#050505] p-6 flex flex-col justify-between group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate('/dashboard/fleet')}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-[14px] bg-success/10 border border-success/20 flex items-center justify-center">
                <ChartLineUp size={24} className="text-success" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-white/10 group-hover:text-white transition-all">
                <ArrowUpRight />
              </div>
            </div>
            <div>
              <p className="text-sm text-white/50 mb-1">Fleet Utilization</p>
              <h3 className="text-3xl font-bold text-success">{utilization}%</h3>
            </div>
          </div>
        </div>

        {/* Small Stat 2: Active Vehicles (col-span-4) */}
        <div className="md:col-span-4 outer-shell bento-card">
          <div className="inner-core h-full bg-[#050505] p-6 flex flex-col justify-between group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate('/dashboard/fleet')}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-[14px] bg-white/5 border border-white/10 flex items-center justify-center">
                <CarProfile size={24} className="text-white/80" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-white/10 group-hover:text-white transition-all">
                <ArrowUpRight />
              </div>
            </div>
            <div>
              <p className="text-sm text-white/50 mb-1">Active Vehicles</p>
              <h3 className="text-3xl font-bold text-white">{activeVehicles} <span className="text-lg text-white/30 font-normal">/ {totalVehicles}</span></h3>
            </div>
          </div>
        </div>

        {/* Alerts / Maintenance (col-span-6) */}
        <div className="md:col-span-6 outer-shell bento-card h-64">
          <div className="inner-core h-full bg-[#050505] p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-warning/10 blur-[50px]"></div>
            
            <div className="flex items-center justify-between gap-3 mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <Warning size={24} className="text-warning" weight="duotone" />
                <h3 className="text-xl font-bold">System Alerts</h3>
              </div>
              <span className="text-xs text-white/50">{notifications.length} Unread</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 relative z-10 pr-2 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="text-white/40 text-sm h-full flex items-center justify-center">No active alerts.</div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${notif.type === 'CRITICAL' ? 'bg-danger/20 text-danger' : notif.type === 'WARNING' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'}`}>
                        {notif.type === 'CRITICAL' ? <ShieldCheck size={16} /> : <Wrench size={16} />}
                      </div>
                      <div className="truncate pr-4">
                        <p className="text-sm font-medium truncate">{notif.type}</p>
                        <p className="text-xs text-white/60 truncate">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Action / Map Area (col-span-6) */}
        <div className="md:col-span-6 outer-shell bento-card h-64">
          <div className="inner-core h-full bg-primary/5 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <GasPump size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Dispatch</h3>
            <p className="text-sm text-white/60 max-w-[200px]">Assign a new route with automated compliance checks.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
