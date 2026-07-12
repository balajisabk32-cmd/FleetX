import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  MapPin, Clock, Truck, User, Plus, CaretDown, 
  CheckCircle, XCircle, PaperPlaneRight, Warning
} from '@phosphor-icons/react';
import { Button } from '../../components/ui/button';

gsap.registerPlugin(useGSAP);

export default function TripsPage() {
  const pageRef = useRef(null);
  
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    source: '',
    destination: '',
    cargo_weight: '',
    planned_distance: ''
  });

  const fetchData = async () => {
    try {
      const [tripsRes, vehRes, drvRes] = await Promise.all([
        fetch('http://localhost:5000/api/trips', { credentials: 'include' }),
        fetch('http://localhost:5000/api/vehicles', { credentials: 'include' }),
        fetch('http://localhost:5000/api/drivers', { credentials: 'include' })
      ]);
      
      if (tripsRes.ok) setTrips(await tripsRes.json());
      if (vehRes.ok) {
        const vData = await vehRes.json();
        setVehicles(Array.isArray(vData) ? vData : (vData.vehicles || []));
      }
      if (drvRes.ok) {
        const dData = await drvRes.json();
        setDrivers(Array.isArray(dData) ? dData : (dData.drivers || []));
      }
    } catch (err) {
      console.error("Failed to fetch trips data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useGSAP(() => {
    if (!loading) {
      gsap.from('.trip-card', {
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
    }
  }, { scope: pageRef, dependencies: [loading] });

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          vehicle_id: parseInt(formData.vehicle_id),
          driver_id: parseInt(formData.driver_id),
          cargo_weight: parseFloat(formData.cargo_weight),
          planned_distance: parseFloat(formData.planned_distance)
        })
      });
      
      if (res.ok) {
        setShowForm(false);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || error.message || "Failed to create trip");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const updateTripStatus = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/trips/${id}/${action}`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || error.message || `Failed to ${action}`);
      }
    } catch (err) {
      alert("Network error");
    }
  };

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-white/50">Loading trips...</div>;
  }

  return (
    <div ref={pageRef} className="w-full pb-16 flex flex-col relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 dash-title">
        <div>
          <div className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
            Module 3.5
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Trip Management</h1>
        </div>
        
        <button 
          onClick={() => setShowForm(true)} 
          className="rounded-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold flex items-center gap-2 px-6 transition-all duration-300 active:scale-95 shadow-[0_4px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.4)] mt-4 md:mt-0"
        >
          <Plus size={18} /> New Trip
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trips.length === 0 ? (
            <div className="col-span-full text-center py-20 text-white/40 border border-white/5 rounded-2xl border-dashed">
              No trips recorded. Create one above!
            </div>
          ) : (
            trips.map(trip => (
              <div key={trip.id} className="trip-card outer-shell h-[280px]">
                <div className="inner-core h-full bg-[#050505] p-6 flex flex-col relative group">
                   
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <span className="text-xs text-white/40 font-mono">{trip.trip_number}</span>
                       <div className="flex items-center gap-2 mt-1">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                           trip.status === 'DRAFT' ? 'bg-white/10 text-white/80' :
                           trip.status === 'DISPATCHED' ? 'bg-primary/20 text-primary border border-primary/30' :
                           trip.status === 'COMPLETED' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                         }`}>
                           {trip.status}
                         </span>
                       </div>
                     </div>
                     <div className="text-right">
                       <span className="text-xs text-white/40 block">ETA</span>
                       <span className="text-sm font-medium">{trip.estimated_arrival_time ? new Date(trip.estimated_arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
                     </div>
                   </div>

                   <div className="flex-1 flex flex-col justify-center space-y-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                           <MapPin size={16} className="text-white/60" />
                         </div>
                         <div className="truncate w-24"><span className="text-xs block text-white/40">From</span><span className="text-sm truncate">{trip.source}</span></div>
                       </div>
                       <div className="w-8 h-[1px] bg-white/10"></div>
                       <div className="flex items-center gap-2">
                         <div className="truncate w-24 text-right"><span className="text-xs block text-white/40">To</span><span className="text-sm truncate">{trip.destination}</span></div>
                         <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                           <MapPin size={16} className="text-primary" />
                         </div>
                       </div>
                     </div>

                     <div className="flex gap-4 border-t border-white/5 pt-4">
                       <div className="flex items-center gap-2 flex-1">
                         <Truck size={16} className="text-white/40" />
                         <span className="text-xs truncate">{trip.vehicles?.registration_number || `ID: ${trip.vehicle_id}`}</span>
                       </div>
                       <div className="flex items-center gap-2 flex-1 border-l border-white/5 pl-4">
                         <User size={16} className="text-white/40" />
                         <span className="text-xs truncate">{trip.drivers?.name || `ID: ${trip.driver_id}`}</span>
                       </div>
                     </div>
                   </div>

                   {/* Action Buttons based on status */}
                   <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-2">
                     {trip.status === 'DRAFT' && (
                       <>
                         <Button size="sm" variant="ghost" className="h-8 text-xs text-danger hover:text-danger hover:bg-danger/10" onClick={() => updateTripStatus(trip.id, 'cancel')}>Cancel</Button>
                         <Button size="sm" className="h-8 text-xs bg-primary text-black hover:bg-primary/90" onClick={() => updateTripStatus(trip.id, 'dispatch')}>
                           <PaperPlaneRight className="mr-1" /> Dispatch
                         </Button>
                       </>
                     )}
                     {trip.status === 'DISPATCHED' && (
                       <Button size="sm" className="h-8 text-xs bg-success text-black hover:bg-success/90 w-full" onClick={() => updateTripStatus(trip.id, 'complete')}>
                         <CheckCircle className="mr-1" /> Mark Complete
                       </Button>
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
                <h2 className="text-2xl font-bold">New Trip</h2>
                <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white"><XCircle size={24} /></button>
              </div>

              <form onSubmit={handleCreateTrip} className="space-y-6">
                
                 <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider">Select Vehicle</label>
                  <select 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none appearance-none"
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                  >
                    <option value="" disabled className="bg-[#0a0a0a]">-- Select Available Vehicle --</option>
                    {vehicles.filter(v => v.status?.toUpperCase() === 'AVAILABLE').map(v => (
                      <option key={v.id} value={v.id} className="bg-[#0a0a0a]">{v.registrationNumber} (Cap: {v.capacity} Tons)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider">Select Driver</label>
                  <select 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none appearance-none"
                    value={formData.driver_id}
                    onChange={(e) => setFormData({...formData, driver_id: e.target.value})}
                  >
                    <option value="" disabled className="bg-[#0a0a0a]">-- Select Available Driver --</option>
                    {drivers.filter(d => d.status?.toUpperCase() === 'AVAILABLE' && d.capabilityFlag !== 'Expired').map(d => (
                      <option key={d.id} value={d.id} className="bg-[#0a0a0a]">{d.name} ({d.capabilityFlag || 'Active'})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Source</label>
                    <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Destination</label>
                    <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none" value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Cargo Weight (kg)</label>
                    <input required type="number" step="0.1" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none" value={formData.cargo_weight} onChange={(e) => setFormData({...formData, cargo_weight: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Distance (km)</label>
                    <input required type="number" step="0.1" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none" value={formData.planned_distance} onChange={(e) => setFormData({...formData, planned_distance: e.target.value})} />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <Button type="submit" className="w-full h-12 text-black bg-white hover:bg-white/90 rounded-xl font-bold">
                    Create Trip Draft
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
