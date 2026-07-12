import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GasPump, Plus, Trash, CurrencyDollar, Calendar, Speedometer, Note, List } from '@phosphor-icons/react';
import { Button } from '../../components/ui/button';

export default function FuelPage() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenseLogs, setExpenseLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('fuel'); // 'fuel' or 'expense'
  const [showAddForm, setShowAddForm] = useState(false);

  // Form States
  const [fuelForm, setFuelForm] = useState({
    vehicle_id: '',
    fuel_date: new Date().toISOString().split('T')[0],
    quantity: '',
    price_per_liter: '',
    odometer: '',
    station: '',
    remarks: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    vehicle_id: '',
    category: 'Maintenance',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const fetchData = async () => {
    try {
      const [fuelRes, expenseRes, vehicleRes] = await Promise.all([
        fetch('http://localhost:5000/api/fuel', { credentials: 'include' }),
        fetch('http://localhost:5000/api/expense', { credentials: 'include' }),
        fetch('http://localhost:5000/api/vehicles', { credentials: 'include' })
      ]);

      if (fuelRes.ok) {
        const fuelData = await fuelRes.json();
        setFuelLogs(fuelData.data?.data || []);
      }
      if (expenseRes.ok) {
        const expenseData = await expenseRes.json();
        setExpenseLogs(expenseData.data?.data || []);
      }
      if (vehicleRes.ok) {
        const vehicleData = await vehicleRes.json();
        setVehicles(vehicleData.vehicles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddFuel = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fuelForm,
          quantity: Number(fuelForm.quantity),
          price_per_liter: Number(fuelForm.price_per_liter),
          odometer: Number(fuelForm.odometer)
        }),
        credentials: 'include'
      });
      if (res.ok) {
        alert('Fuel log added successfully!');
        setFuelForm({
          vehicle_id: '',
          fuel_date: new Date().toISOString().split('T')[0],
          quantity: '',
          price_per_liter: '',
          odometer: '',
          station: '',
          remarks: ''
        });
        setShowAddForm(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add fuel log');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expenseForm,
          amount: Number(expenseForm.amount)
        }),
        credentials: 'include'
      });
      if (res.ok) {
        alert('Expense log added successfully!');
        setExpenseForm({
          vehicle_id: '',
          category: 'Maintenance',
          amount: '',
          expense_date: new Date().toISOString().split('T')[0],
          description: ''
        });
        setShowAddForm(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add expense log');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteFuel = async (id) => {
    if (!confirm('Are you sure you want to delete this fuel log?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/fuel/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        alert('Fuel log deleted!');
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense log?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/expense/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        alert('Expense log deleted!');
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="text-white/50 p-8">Loading fuel & expense dashboard...</div>;
  }

  return (
    <div className="w-full pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter">Fuel & Expenses</h1>
          <p className="text-sm text-white/40">Monitor expenditures, refueling logs, and operational overheads</p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-1 flex">
            <button 
              onClick={() => { setActiveSubTab('fuel'); setShowAddForm(false); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'fuel' ? 'bg-primary text-white' : 'text-white/50'}`}
            >
              Fuel Logs
            </button>
            <button 
              onClick={() => { setActiveSubTab('expense'); setShowAddForm(false); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'expense' ? 'bg-primary text-white' : 'text-white/50'}`}
            >
              Expenses
            </button>
          </div>

          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-2xl h-11 bg-primary hover:bg-primary-hover text-white flex items-center gap-2 px-5"
          >
            <Plus size={18} />
            <span>Add {activeSubTab === 'fuel' ? 'Fuel Log' : 'Expense'}</span>
          </Button>
        </div>
      </div>

      {showAddForm && activeSubTab === 'fuel' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-[2rem] p-6 mb-8 max-w-2xl animate-fade-in"
        >
          <h3 className="text-lg font-bold mb-4">Record Fuel Refill</h3>
          <form onSubmit={handleAddFuel} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Vehicle</label>
              <select 
                value={fuelForm.vehicle_id}
                onChange={e => setFuelForm({...fuelForm, vehicle_id: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="">Select Vehicle...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.make} {v.model} ({v.registrationNumber})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Refueling Date</label>
              <input 
                type="date" 
                value={fuelForm.fuel_date}
                onChange={e => setFuelForm({...fuelForm, fuel_date: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Quantity (Liters)</label>
              <input 
                type="number" 
                step="0.01"
                value={fuelForm.quantity}
                onChange={e => setFuelForm({...fuelForm, quantity: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="e.g. 55.4"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Price Per Liter ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={fuelForm.price_per_liter}
                onChange={e => setFuelForm({...fuelForm, price_per_liter: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="e.g. 1.85"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Odometer Reading (km)</label>
              <input 
                type="number" 
                value={fuelForm.odometer}
                onChange={e => setFuelForm({...fuelForm, odometer: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="e.g. 45000"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Gas Station</label>
              <input 
                type="text" 
                value={fuelForm.station}
                onChange={e => setFuelForm({...fuelForm, station: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="e.g. Shell"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Remarks / Notes</label>
              <textarea 
                value={fuelForm.remarks}
                onChange={e => setFuelForm({...fuelForm, remarks: e.target.value})}
                rows="2"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary resize-none"
                placeholder="Additional details..."
              />
            </div>
            <div className="sm:col-span-2 mt-4 flex gap-3">
              <Button type="submit" className="bg-primary text-white px-6 rounded-xl">Save</Button>
              <Button type="button" onClick={() => setShowAddForm(false)} className="bg-white/5 border border-white/10 text-white px-6 rounded-xl">Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      {showAddForm && activeSubTab === 'expense' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-[2rem] p-6 mb-8 max-w-2xl animate-fade-in"
        >
          <h3 className="text-lg font-bold mb-4">Record New Expense</h3>
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Vehicle</label>
              <select 
                value={expenseForm.vehicle_id}
                onChange={e => setExpenseForm({...expenseForm, vehicle_id: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="">Select Vehicle...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.make} {v.model} ({v.registrationNumber})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Category</label>
              <select 
                value={expenseForm.category}
                onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Toll">Toll</option>
                <option value="Parking">Parking</option>
                <option value="Insurance">Insurance</option>
                <option value="Fine">Fine</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Amount ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={expenseForm.amount}
                onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="e.g. 150.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Expense Date</label>
              <input 
                type="date" 
                value={expenseForm.expense_date}
                onChange={e => setExpenseForm({...expenseForm, expense_date: e.target.value})}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Description</label>
              <textarea 
                value={expenseForm.description}
                onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                rows="2"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary resize-none"
                placeholder="Description of the expense..."
              />
            </div>
            <div className="sm:col-span-2 mt-4 flex gap-3">
              <Button type="submit" className="bg-primary text-white px-6 rounded-xl">Save</Button>
              <Button type="button" onClick={() => setShowAddForm(false)} className="bg-white/5 border border-white/10 text-white px-6 rounded-xl">Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      {activeSubTab === 'fuel' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fuelLogs.map((log) => (
            <div 
              key={log.id}
              className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden group shadow-lg"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white/80">
                  <GasPump size={24} />
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Total Cost</span>
                  <span className="text-xl font-bold text-primary">${log.total_cost || (log.quantity * log.price_per_liter).toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4 mb-4">
                <div>
                  <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Quantity</span>
                  <span className="text-sm font-bold">{log.quantity} L</span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Price/L</span>
                  <span className="text-sm font-bold">${log.price_per_liter}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Odometer</span>
                  <span className="text-sm font-bold">{log.odometer} km</span>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-xs text-white/60">
                {log.station && <p><span className="font-semibold">Station:</span> {log.station}</p>}
                {log.remarks && <p><span className="font-semibold">Notes:</span> {log.remarks}</p>}
              </div>

              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                <div className="flex gap-2 items-center text-white/40 text-xs">
                  <Calendar size={14} />
                  <span>{new Date(log.fuel_date).toLocaleDateString()}</span>
                </div>
                <button 
                  onClick={() => handleDeleteFuel(log.id)}
                  className="p-2 text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {expenseLogs.map((log) => (
            <div 
              key={log.id}
              className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden group shadow-lg"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white/80">
                  <CurrencyDollar size={24} />
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Amount</span>
                  <span className="text-xl font-bold text-amber-500">${log.amount}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4 mb-4">
                <div>
                  <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Category</span>
                  <span className="text-sm font-bold text-white">{log.category}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Vehicle ID</span>
                  <span className="text-sm font-bold">{log.vehicle_id}</span>
                </div>
              </div>

              {log.description && (
                <div className="text-xs text-white/60 mb-4">
                  <p><span className="font-semibold">Description:</span> {log.description}</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                <div className="flex gap-2 items-center text-white/40 text-xs">
                  <Calendar size={14} />
                  <span>{new Date(log.expense_date).toLocaleDateString()}</span>
                </div>
                <button 
                  onClick={() => handleDeleteExpense(log.id)}
                  className="p-2 text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
