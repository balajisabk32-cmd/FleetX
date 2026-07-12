import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trash, Shield, CheckCircle, Warning, IdentificationCard } from '@phosphor-icons/react';
import { Button } from '../../components/ui/button';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form States
  const [form, setForm] = useState({
    name: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    status: 'Available'
  });

  const fetchDrivers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/drivers', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.drivers || data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      });
      if (res.ok) {
        alert('Driver added successfully!');
        setForm({
          name: '',
          licenseNumber: '',
          licenseExpiryDate: '',
          status: 'Available'
        });
        setShowAddForm(false);
        fetchDrivers();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to create driver');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/drivers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        alert('Driver deleted!');
        fetchDrivers();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="text-white/50 p-8">Loading drivers...</div>;
  }

  return (
    <div className="w-full pb-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter">Driver Management</h1>
          <p className="text-sm text-white/40">Manage driver credentials, availability, and active status</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-2xl h-11 bg-primary hover:bg-primary-hover text-white flex items-center gap-2 px-5"
        >
          <Plus size={18} />
          <span>Add Driver</span>
        </Button>
      </div>

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-[2rem] p-6 mb-8 max-w-2xl"
        >
          <h3 className="text-lg font-bold mb-4">Add New Driver</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Full Name</label>
              <input 
                type="text" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">License Number</label>
              <input 
                type="text" 
                value={form.licenseNumber}
                onChange={e => setForm({...form, licenseNumber: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="e.g. DL-987654321"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">License Expiry Date</label>
              <input 
                type="date" 
                value={form.licenseExpiryDate}
                onChange={e => setForm({...form, licenseExpiryDate: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
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
                <option value="Suspended">Suspended</option>
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
        {drivers.map((d) => (
          <div 
            key={d.id}
            className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden group shadow-lg"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white/80">
                <Users size={26} />
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                d.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                d.status === 'On Trip' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {d.status}
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight mb-4">{d.name}</h3>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <IdentificationCard size={18} className="text-white/40" />
                <span className="text-xs text-white/60 font-semibold">{d.licenseNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-white/40" />
                <span className="text-xs text-white/60">
                  Expires: <span className="font-semibold">{new Date(d.licenseExpiryDate).toLocaleDateString()}</span>
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-4">
              <span className="text-[10px] font-semibold text-white/30">ID: #{d.id}</span>
              <button 
                onClick={() => handleDelete(d.id)}
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
