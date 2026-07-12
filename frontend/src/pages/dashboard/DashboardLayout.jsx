import React, { useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SquaresFour, CarProfile, Wrench, Users, SignOut, ShieldCheck } from '@phosphor-icons/react';
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
      stagger: 0.1, 
      duration: 0.8, 
      ease: 'power3.out' 
    });
  }, { scope: containerRef });

  const navLinks = [
    { name: 'Overview', path: '/dashboard', icon: <SquaresFour size={24} /> },
    { name: 'Fleet', path: '/dashboard/fleet', icon: <CarProfile size={24} /> },
    { name: 'Maintenance', path: '/dashboard/maintenance', icon: <Wrench size={24} /> },
    { name: 'Personnel', path: '/dashboard/personnel', icon: <Users size={24} /> },
  ];

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', { method: 'POST' });
    } catch(e) {}
    navigate('/auth');
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-white flex flex-col md:flex-row relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"></div>

      {/* Sidebar Nav (Floating Pill Style on Desktop) */}
      <aside className="relative z-20 w-full md:w-24 lg:w-64 md:min-h-screen p-4 flex flex-col items-center md:items-stretch">
        <div className="flex-1 w-full bg-[#050505]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-4 flex md:flex-col justify-between items-center md:items-start outer-shell">
          
          <div className="flex flex-row md:flex-col items-center md:items-start gap-8 w-full inner-core bg-transparent p-0 border-0 shadow-none">
            {/* Logo Area */}
            <div className="flex items-center gap-3 w-full justify-center md:justify-start px-2 nav-item">
              <img src={LogoIcon} alt="FleetX Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
              <span className="font-bold text-xl tracking-tight hidden lg:block">FleetX</span>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-row md:flex-col gap-2 w-full">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <button 
                    key={link.name}
                    onClick={() => navigate(link.path)}
                    className={`nav-item flex items-center justify-center lg:justify-start gap-4 p-3 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group ${isActive ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                  >
                    <div className="relative">
                      {link.icon}
                      {isActive && (
                        <motion.div 
                          layoutId="activeNav"
                          className="absolute -inset-2 bg-primary/20 blur-md rounded-full -z-10"
                        />
                      )}
                    </div>
                    <span className="font-medium hidden lg:block">{link.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* User / Settings Area */}
          <div className="flex flex-row md:flex-col gap-4 mt-8 md:mt-0 w-full inner-core bg-transparent p-0 border-0 shadow-none">
            <button 
              onClick={handleLogout}
              className="nav-item flex items-center justify-center lg:justify-start gap-4 p-3 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] text-danger/70 hover:bg-danger/10 hover:text-danger w-full group"
            >
              <SignOut size={24} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium hidden lg:block">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 p-4 pt-8 md:pt-4 md:px-8 md:pb-8 min-h-[100dvh] overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
