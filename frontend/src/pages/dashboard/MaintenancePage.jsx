import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  Wrench, CheckCircle, Warning, Plus, XCircle, 
  ShieldCheck, CurrencyDollar
} from '@phosphor-icons/react';
import { Button } from '../../components/ui/button';

gsap.registerPlugin(useGSAP);

export default function MaintenancePage() {
  const pageRef = useRef(null);
  
  const [records, setRecords] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    issue: '',
    description: '',
    maintenance_type: 'ROUTINE',
    priority: 'LOW',
    estimated_cost: '',
    mechanic_name: ''
  });

  const fetchData = async () => {
    try {
      const [recRes, remRes, vehRes] = await Promise.all([
        fetch('http://localhost:5000/api/maintenance', { credentials: 'include' }),
        fetch('http://localhost:5000/api/maintenance/reminders', { credentials: 'include' }),
        fetch('http://localhost:5000/api/vehicles', { credentials: 'include' })
      ]);
      
      if (recRes.ok) setRecords(await recRes.json());
      if (remRes.ok) setReminders(await remRes.json());
      if (vehRes.ok) setVehicles(await vehRes.json());
    } catch (err) {
      console.error("Failed to fetch maintenance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useGSAP(() => {
    if (!loading) {
      gsap.from('.record-card', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        filter: 'blur(4px)'
      });
      
      gsap.from('.dash-title', {
        x: -30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
      
      if (reminders.length > 0) {
        gsap.from('.reminders-bar', {
          y: -20,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
        });
      }
    }
  }, { scope: pageRef, dependencies: [loading, reminders.length] });

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          vehicle_id: parseInt(formData.vehicle_id),
          estimated_cost: parseFloat(formData.estimated_cost)
        })
      });
      
      if (res.ok) {
        setShowForm(false);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || error.message || "Failed to create record");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const closeRecord = async (id) => {
    try {
      const actual_cost = prompt("Enter the final actual cost for this maintenance:");
      if (actual_cost === null) return;
      
      const res = await fetch(`http://localhost:5000/api/maintenance/${id}/close`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ actual_cost: parseFloat(actual_cost) })
      });
      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || error.message || "Failed to close record");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-white/50">Loading maintenance...</div>;
  }

  return (
    <div ref={pageRef} className="w-full pb-16 flex flex-col relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 dash-title">
        <div>
          <div className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
            Module 3.6
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Maintenance Bay</h1>
        </div>
        
        <button 
          onClick={() => setShowForm(true)} 
          className="rounded-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold flex items-center gap-2 px-6 transition-all duration-300 active:scale-95 shadow-[0_4px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.4)] mt-4 md:mt-0"
        >
          <Plus size={18} /> New Ticket
        </button>
      </div>

      {reminders.length > 0 && (
        <div className="reminders-bar mb-6 p-4 rounded-2xl bg-warning/10 border border-warning/30 flex items-start gap-4">
          <Warning size={24} className="text-warning shrink-0 mt-1" weight="duotone" />
          <div>
            <h3 className="font-bold text-warning mb-2">Smart Reminders ({reminders.length} Vehicles require attention)</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {reminders.map(v => (
                <div key={v.id} className="bg-[#050505] p-3 rounded-xl border border-white/5 shrink-0 w-64">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm">{v.vehicle_name}</span>
                    <span className={`text-xs font-bold ${v.service_score < 70 ? 'text-danger' : 'text-warning'}`}>Score: {v.service_score}</span>
                  </div>
                  <p className="text-xs text-white/50 truncate">{v.reminder_status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {records.length === 0 ? (
            <div className="col-span-full text-center py-20 text-white/40 border border-white/5 rounded-2xl border-dashed">
              No active maintenance records.
            </div>
          ) : (
            records.map(record => (
              <div key={record.id} className={`record-card outer-shell h-[280px] ${record.status === 'CLOSED' ? 'opacity-60' : ''}`}>
                <div className="inner-core h-full bg-[#050505] p-6 flex flex-col relative group">
                   
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <span className="text-sm font-bold block mb-1">{record.vehicles?.registration_number || `Vehicle ${record.vehicle_id}`}</span>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                         record.priority === 'CRITICAL' ? 'bg-danger/20 text-danger border border-danger/30' :
                         record.priority === 'HIGH' ? 'bg-warning/20 text-warning' :
                         record.priority === 'MEDIUM' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/60'
                       }`}>
                         {record.priority} PRIORITY
                       </span>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        record.status === 'OPEN' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                     }`}>
                       {record.status}
                     </span>
                   </div>

                   <div className="flex-1 flex flex-col justify-center">
                     <h3 className="text-lg font-medium mb-1 line-clamp-1">{record.issue}</h3>
                     <p className="text-xs text-white/50 line-clamp-2 mb-4">{record.description}</p>
                     
                     <div className="flex justify-between items-center bg-white/5 rounded-lg p-3 border border-white/10">
                       <div className="flex items-center gap-2">
                         <Wrench size={16} className="text-white/40" />
                         <span className="text-xs">{record.mechanic_name || 'Unassigned'}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <CurrencyDollar size={16} className="text-white/40" />
                         <span className="text-xs font-mono">${record.status === 'CLOSED' ? record.actual_cost : record.estimated_cost}</span>
                       </div>
                     </div>
                   </div>

                   {/* Action Buttons based on status */}
                   <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-2">
                     {record.status === 'OPEN' && (
                       <Button size="sm" className="h-8 text-xs bg-primary text-white hover:bg-primary/95 w-full" onClick={() => closeRecord(record.id)}>
                         <CheckCircle className="mr-1" /> Close Ticket
                       </Button>
                     )}
                     {record.status === 'CLOSED' && (
                       <div className="text-xs text-success flex items-center gap-1 w-full justify-center h-8">
                         <ShieldCheck /> Vehicle Restored
                       </div>
                     )}
                   </div>
                   
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Slide-out Form Overlay */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end"
          >
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-[#0a0a0a] border-l border-white/10 h-full p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">New Maintenance Ticket</h2>
                <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white"><XCircle size={24} /></button>
              </div>

              <form onSubmit={handleCreateRecord} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider">Select Vehicle</label>
                  <select 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none appearance-none"
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                  >
                    <option value="" disabled className="bg-[#0a0a0a]">-- Select Vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id} className="bg-[#0a0a0a]">{v.registrationNumber} ({v.status})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Priority</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none appearance-none"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="LOW" className="bg-[#0a0a0a]">Low</option>
                      <option value="MEDIUM" className="bg-[#0a0a0a]">Medium</option>
                      <option value="HIGH" className="bg-[#0a0a0a]">High</option>
                      <option value="CRITICAL" className="bg-[#0a0a0a]">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Type</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none appearance-none"
                      value={formData.maintenance_type}
                      onChange={(e) => setFormData({...formData, maintenance_type: e.target.value})}
                    >
                      <option value="ROUTINE" className="bg-[#0a0a0a]">Routine</option>
                      <option value="REPAIR" className="bg-[#0a0a0a]">Repair</option>
                      <option value="INSPECTION" className="bg-[#0a0a0a]">Inspection</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider">Issue Summary</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none" value={formData.issue} onChange={(e) => setFormData({...formData, issue: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider">Description</label>
                  <textarea required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none h-24 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Estimated Cost ($)</label>
                    <input required type="number" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none" value={formData.estimated_cost} onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Mechanic Name</label>
                    <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none" value={formData.mechanic_name} onChange={(e) => setFormData({...formData, mechanic_name: e.target.value})} />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <Button type="submit" className="w-full h-12 text-black bg-white hover:bg-white/90 rounded-xl font-bold">
                    Send to Shop
                  </Button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
