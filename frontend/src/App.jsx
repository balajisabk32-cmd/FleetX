import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenseLogs, setExpenseLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Form states
  const [vehicleForm, setVehicleForm] = useState({ id: '', license_plate: '', fuel_capacity: '', acquisition_cost: '' });
  const [fuelForm, setFuelForm] = useState({ vehicle_id: '', fuel_date: '', quantity: '', price_per_liter: '', odometer: '' });
  const [expenseForm, setExpenseForm] = useState({ vehicle_id: '', category: 'Maintenance', amount: '', expense_date: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = () => {
    setErrorMsg('');
    if (activeTab === 'dashboard') {
      fetch(`${API_BASE}/analytics/dashboard`)
        .then(res => res.json())
        .then(data => setDashboardData(data.data))
        .catch(e => setErrorMsg('Ensure backend is running and DB tables exist.'));
    } else if (activeTab === 'fuel') {
      fetch(`${API_BASE}/fuel`)
        .then(res => res.json())
        .then(data => setFuelLogs(data.data?.data || []))
        .catch(console.error);
      fetchVehicles();
    } else if (activeTab === 'expense') {
      fetch(`${API_BASE}/expense`)
        .then(res => res.json())
        .then(data => setExpenseLogs(data.data?.data || []))
        .catch(console.error);
      fetchVehicles();
    } else if (activeTab === 'vehicles') {
      fetchVehicles();
    }
  };

  const fetchVehicles = () => {
    fetch(`${API_BASE}/vehicle`)
        .then(res => res.json())
        .then(data => setVehicles(data.data || []))
        .catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/vehicle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           id: vehicleForm.id, 
           license_plate: vehicleForm.license_plate || null,
           fuel_capacity: Number(vehicleForm.fuel_capacity),
           acquisition_cost: Number(vehicleForm.acquisition_cost || 0)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error adding vehicle');
      setVehicleForm({ id: '', license_plate: '', fuel_capacity: '', acquisition_cost: '' });
      fetchVehicles();
      alert('Vehicle Added!');
    } catch(err) {
      alert(err.message);
    }
  };

  const handleAddFuel = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/fuel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           ...fuelForm,
           quantity: Number(fuelForm.quantity),
           price_per_liter: Number(fuelForm.price_per_liter),
           odometer: Number(fuelForm.odometer)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error adding fuel');
      setFuelForm({ vehicle_id: '', fuel_date: '', quantity: '', price_per_liter: '', odometer: '' });
      fetchData();
      alert('Fuel Log Added!');
    } catch(err) {
      alert(err.message);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           ...expenseForm,
           amount: Number(expenseForm.amount)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error adding expense');
      setExpenseForm({ vehicle_id: '', category: 'Maintenance', amount: '', expense_date: '' });
      fetchData();
      alert('Expense Log Added!');
    } catch(err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <h2>Fleet Manager</h2>
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</li>
          <li className={activeTab === 'vehicles' ? 'active' : ''} onClick={() => setActiveTab('vehicles')}>Vehicles</li>
          <li className={activeTab === 'fuel' ? 'active' : ''} onClick={() => setActiveTab('fuel')}>Fuel Logs</li>
          <li className={activeTab === 'expense' ? 'active' : ''} onClick={() => setActiveTab('expense')}>Expense Logs</li>
        </ul>
      </nav>
      
      <main className="content">
        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        {activeTab === 'dashboard' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h1>Analytics Dashboard</h1>
              <a href={`${API_BASE}/export/csv?type=analytics`} target="_blank" rel="noopener noreferrer" className="export-btn">Export to CSV</a>
            </div>
            {dashboardData ? (
              <div className="dashboard-grid">
                <div className="card">
                  <h3>Total Operational Cost</h3>
                  <p>${dashboardData.total_operational_cost || 0}</p>
                </div>
                <div className="card">
                  <h3>Average Fleet Health Score</h3>
                  <p>{dashboardData.average_fleet_health_score || 0}</p>
                </div>
                <div className="card">
                  <h3>Fuel Theft Alerts</h3>
                  <p>{dashboardData.fuel_theft_alerts_count || 0}</p>
                </div>
              </div>
            ) : <p>Loading dashboard data (Ensure DB tables are created via SQL script)...</p>}
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div>
            <h1>Vehicles</h1>
            <div className="form-card">
              <h3>Add Vehicle</h3>
              <form onSubmit={handleAddVehicle}>
                <input type="text" placeholder="Vehicle ID" value={vehicleForm.id} onChange={e => setVehicleForm({...vehicleForm, id: e.target.value})} required />
                <input type="text" placeholder="License Plate (Optional)" value={vehicleForm.license_plate} onChange={e => setVehicleForm({...vehicleForm, license_plate: e.target.value})} />
                <input type="number" placeholder="Fuel Capacity (Liters)" value={vehicleForm.fuel_capacity} onChange={e => setVehicleForm({...vehicleForm, fuel_capacity: e.target.value})} required />
                <input type="number" placeholder="Acquisition Cost ($)" value={vehicleForm.acquisition_cost} onChange={e => setVehicleForm({...vehicleForm, acquisition_cost: e.target.value})} />
                <button type="submit">Add Vehicle</button>
              </form>
            </div>
            
            <table className="data-table">
              <thead><tr><th>Vehicle ID</th><th>License Plate</th><th>Capacity</th><th>Cost</th></tr></thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id}><td>{v.id}</td><td>{v.license_plate || 'N/A'}</td><td>{v.fuel_capacity} L</td><td>${v.acquisition_cost}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'fuel' && (
          <div>
            <h1>Fuel Logs</h1>
            <div className="form-card">
              <h3>Add Fuel Log</h3>
              <form onSubmit={handleAddFuel}>
                <input type="text" placeholder="Vehicle ID" value={fuelForm.vehicle_id} onChange={e => setFuelForm({...fuelForm, vehicle_id: e.target.value})} required />
                <input type="date" value={fuelForm.fuel_date} onChange={e => setFuelForm({...fuelForm, fuel_date: e.target.value})} required />
                <input type="number" placeholder="Quantity (L)" value={fuelForm.quantity} onChange={e => setFuelForm({...fuelForm, quantity: e.target.value})} required />
                <input type="number" placeholder="Price Per Liter" value={fuelForm.price_per_liter} onChange={e => setFuelForm({...fuelForm, price_per_liter: e.target.value})} required />
                <input type="number" placeholder="Odometer" value={fuelForm.odometer} onChange={e => setFuelForm({...fuelForm, odometer: e.target.value})} required />
                <button type="submit">Add Fuel Log</button>
              </form>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Quantity (L)</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.fuel_date}</td>
                    <td>{log.vehicle_id}</td>
                    <td>{log.quantity}</td>
                    <td>${log.total_cost}</td>
                  </tr>
                ))}
                {fuelLogs.length === 0 && <tr><td colSpan="4">No fuel logs found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'expense' && (
          <div>
            <h1>Expense Logs</h1>
            <div className="form-card">
              <h3>Add Expense</h3>
              <form onSubmit={handleAddExpense}>
                <input type="text" placeholder="Vehicle ID" value={expenseForm.vehicle_id} onChange={e => setExpenseForm({...expenseForm, vehicle_id: e.target.value})} required />
                <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} required>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Toll">Toll</option>
                  <option value="Parking">Parking</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Fine">Fine</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
                <input type="number" placeholder="Amount" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} required />
                <input type="date" value={expenseForm.expense_date} onChange={e => setExpenseForm({...expenseForm, expense_date: e.target.value})} required />
                <button type="submit">Add Expense</button>
              </form>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Vehicle</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenseLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.expense_date}</td>
                    <td>{log.category}</td>
                    <td>{log.vehicle_id}</td>
                    <td>${log.amount}</td>
                  </tr>
                ))}
                {expenseLogs.length === 0 && <tr><td colSpan="4">No expense logs found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
