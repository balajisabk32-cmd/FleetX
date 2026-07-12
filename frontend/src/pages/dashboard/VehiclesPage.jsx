import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, Trash, Wrench, ShieldCheck, FileText, CheckCircle, Warning } from '@phosphor-icons/react';
import { Button } from '../../components/ui/button';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form States
  const [form, setForm] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    capacity: '',
    status: 'Available',
    insuranceExpiry: '',
    emissionsExpiry: '',
    inspectionExpiry: ''
  });

  const fetchVehicles = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/vehicles', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          capacity: Number(form.capacity)
        }),
        credentials: 'include'
      });
      if (res.ok) {
        alert('Vehicle registered successfully!');
        setForm({
          registrationNumber: '',
          make: '',
          model: '',
          year: new Date().getFullYear(),
          capacity: '',
          status: 'Available',
          insuranceExpiry: '',
          emissionsExpiry: '',
          inspectionExpiry: ''
        });
        setShowAddForm(false);
        fetchVehicles();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to create vehicle');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        alert('Vehicle deleted!');
        fetchVehicles();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="text-white/50 p-8">Loading vehicles...</div>;
  }

  return (
    <div className="w-full pb-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter">Vehicle Registry</h1>
          <p className="text-sm text-white/40">Manage your fleet inventory, specs, and status</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-2xl h-11 bg-primary hover:bg-primary-hover text-white flex items-center gap-2 px-5"
        >
          <Plus size={18} />
          <span>Add Vehicle</span>
        </Button>
      </div>

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-[2rem] p-6 mb-8 max-w-2xl"
        >
          <h3 className="text-lg font-bold mb-4">Register New Vehicle</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Registration Plate</label>
              <input 
                type="text" 
                value={form.registrationNumber}
                onChange={e => setForm({...form, registrationNumber: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="e.g. TX-123-AB"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Make</label>
              <input 
                type="text" 
                value={form.make}
                onChange={e => setForm({...form, make: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="e.g. Ford, Volvo"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Model</label>
              <input 
                type="text" 
                value={form.model}
                onChange={e => setForm({...form, model: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="e.g. F-150, FH16"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Year</label>
              <input 
                type="number" 
                value={form.year}
                onChange={e => setForm({...form, year: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Cargo Capacity (Tons)</label>
              <input 
                type="number" 
                step="0.01"
                value={form.capacity}
                onChange={e => setForm({...form, capacity: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="e.g. 12.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Status</label>
              <select 
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="In Shop">In Shop</option>
              </select>
            </div>
            <div className="sm:col-span-2 mt-4 flex gap-3">
              <Button type="submit" className="bg-primary text-white px-6 rounded-xl">Save</Button>
              <Button type="button" onClick={() => setShowAddForm(false)} className="bg-white/5 border border-white/10 text-white px-6 rounded-xl">Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div 
            key={v.id}
            className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden group shadow-lg"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white/80">
                <Truck size={26} />
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                v.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                v.status === 'On Trip' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {v.status}
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight mb-1">{v.make} {v.model}</h3>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-4">{v.registrationNumber}</p>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mb-6">
              <div>
                <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Capacity</span>
                <span className="text-sm font-bold">{v.capacity} Tons</span>
              </div>
              <div>
                <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Year</span>
                <span className="text-sm font-bold">{v.year}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] font-semibold text-white/30">ID: #{v.id}</span>
              <button 
                onClick={() => handleDelete(v.id)}
                className="p-2 text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
