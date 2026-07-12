import React, { useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SquaresFour, Truck, Wrench, Users, SignOut, MapTrifold, GasPump, FilePdf } from '@phosphor-icons/react';
import LogoIcon from '../../assets/logo.svg';

gsap.registerPlugin(useGSAP);

export default function DashboardLayout() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // GSAP Entry Animation
  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.nav-item', { 
      x: -20, 
      opacity: 0, 
      stagger: 0.05, 
      duration: 0.6, 
      ease: 'power3.out' 
    });
  }, { scope: containerRef });

  const navLinks = [
    { name: 'Command Center', path: '/dashboard', icon: <SquaresFour size={22} /> },
    { name: 'Vehicle Registry', path: '/dashboard/vehicles', icon: <Truck size={22} /> },
    { name: 'Driver Management', path: '/dashboard/drivers', icon: <Users size={22} /> },
    { name: 'Trip Management', path: '/dashboard/trips', icon: <MapTrifold size={22} /> },
    { name: 'Maintenance Logs', path: '/dashboard/maintenance', icon: <Wrench size={22} /> },
    { name: 'Fuel & Expenses', path: '/dashboard/financial', icon: <GasPump size={22} /> },
  ];

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', { method: 'POST' });
    } catch(e) {}
    navigate('/auth');
  };

  const handleGeneratePDFReport = () => {
    // Standard and clean client-side print triggers optimized print layout
    window.print();
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030303] text-white flex flex-col md:flex-row relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -translate-x-1/3 -translate-y-1/3 z-0 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none translate-x-1/3 translate-y-1/3 z-0 animate-pulse" style={{ animationDuration: '12s' }}></div>

      {/* Sidebar Nav (Highly Refined Glassmorphism) */}
      <aside className="relative z-20 w-full md:w-64 lg:w-72 md:min-h-screen p-4 flex flex-col items-center md:items-stretch print:hidden">
        <div className="flex-1 w-full bg-white/[0.06] backdrop-blur-[40px] border border-white/[0.15] rounded-[2.5rem] p-5 flex md:flex-col justify-between items-center md:items-stretch shadow-[0_24px_80px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.08)]">
          
          <div className="flex flex-row md:flex-col items-center md:items-stretch gap-8 w-full">
            {/* Logo Area */}
            <div className="flex items-center gap-3 justify-center md:justify-start px-2 py-3 nav-item border-b border-white/10 md:w-full">
              <img src={LogoIcon} alt="FleetX Logo" className="w-9 h-9 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <span className="font-extrabold text-2xl tracking-tighter hidden md:block bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">FleetX</span>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-row md:flex-col gap-1.5 w-full">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <button 
                    key={link.name}
                    onClick={() => navigate(link.path)}
                    className={`nav-item flex items-center justify-center md:justify-start gap-4 p-3.5 rounded-2xl transition-all duration-300 group relative ${
                      isActive 
                        ? 'bg-white/20 text-white shadow-[0_4px_20px_rgba(255,255,255,0.1),inset_0_1px_1px_rgba(255,255,255,0.4)] font-bold' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                       {link.icon}
                       {isActive && (
                         <motion.div 
                           layoutId="activeNavIndicator"
                           className="absolute -inset-2 bg-primary/40 blur-md rounded-full -z-10"
                         />
                       )}
                    </div>
                    <span className="text-sm hidden md:block tracking-wide">{link.name}</span>
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-l-full hidden md:block shadow-[0_0_12px_rgba(59,130,246,1)]"></div>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Action / PDF Report & Sign Out */}
          <div className="flex flex-row md:flex-col gap-2 mt-8 md:mt-auto w-full">
            <button 
              onClick={handleGeneratePDFReport}
              className="nav-item flex items-center justify-center md:justify-start gap-4 p-3.5 rounded-2xl transition-all duration-300 text-primary/80 hover:bg-primary/10 hover:text-primary w-full group border border-primary/20 bg-primary/5 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
            >
              <FilePdf size={22} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm hidden md:block tracking-wide">PDF Report</span>
            </button>

            <button 
              onClick={handleLogout}
              className="nav-item flex items-center justify-center md:justify-start gap-4 p-3.5 rounded-2xl transition-all duration-300 text-rose-500/70 hover:bg-rose-500/10 hover:text-rose-500 w-full group"
            >
              <SignOut size={22} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold text-sm hidden md:block tracking-wide">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 p-4 pt-8 md:p-8 min-h-[100dvh] overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
