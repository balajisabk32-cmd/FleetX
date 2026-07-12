import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, ChartLineUp, ShieldCheck, SteeringWheel, 
  CarProfile, CheckCircle, XCircle, CurrencyDollar, GasPump, Graph, 
  Warning, MapPin, Wrench
} from '@phosphor-icons/react';
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { AnimatedTextReveal } from './components/kokonut/AnimatedTextReveal';
import { GlowButton } from './components/kokonut/GlowButton';
import LogoIcon from './assets/logo.svg';

const ease = [0.32, 0.72, 0, 1];

function Navbar({ showIntro }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center justify-between gap-12 shadow-2xl">
          <div className="flex items-center gap-2">
            {!showIntro ? (
              <motion.img 
                layoutId="main-logo"
                src={LogoIcon}
                alt="FleetX Logo"
                className="w-10 h-10 object-contain"
              />
            ) : (
              <div className="w-10 h-10" />
            )}
            <span className="font-bold tracking-tight text-white hidden sm:block">FleetX</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#roles" className="hover:text-white transition-colors">Roles</a>
            <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white" onClick={() => navigate('/auth')}>Login</Button>
            <Button size="sm" className="rounded-full" onClick={() => navigate('/auth')}>Get Started</Button>
          </div>

          <button 
            className="md:hidden relative z-50 w-8 h-8 flex flex-col justify-center items-center gap-1.5"
            onClick={() => setIsOpen(!isOpen)}
          >
            <motion.span 
              animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-white rounded-full origin-center"
            />
            <motion.span 
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-0.5 bg-white rounded-full"
            />
            <motion.span 
              animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-white rounded-full origin-center"
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-3xl flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-8 text-3xl font-light tracking-tight">
              <motion.a 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease }}
                href="#features" onClick={() => setIsOpen(false)}
              >
                Features
              </motion.a>
              <motion.a 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ease }}
                href="#roles" onClick={() => setIsOpen(false)}
              >
                Roles
              </motion.a>
              <motion.a 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease }}
                href="#analytics" onClick={() => setIsOpen(false)}
              >
                Analytics
              </motion.a>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, ease }}>
                <Button size="lg" className="mt-8 rounded-full text-lg" onClick={() => navigate('/auth')}>Launch Workspace</Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100dvh] pt-40 pb-24 px-4 flex flex-col items-center text-center">
      <motion.div 
        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1, ease }}
        className="max-w-4xl mx-auto flex flex-col items-center"
      >
        <Badge variant="primary" className="mb-6">Smart Operations</Badge>
        
        <div className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-8">
          <React.Fragment>
            <AnimatedTextReveal text="Ditch the Spreadsheets." />
            <br className="hidden md:block"/>
            <AnimatedTextReveal text="Drive Your Fleet Forward." />
          </React.Fragment>
        </div>

        <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-12 leading-relaxed">
          The all-in-one Smart Transport Operations Platform. Seamlessly manage vehicles, drivers, dispatch, maintenance, and expenses—while automatically enforcing compliance and tracking your true ROI.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <GlowButton onClick={() => navigate('/auth')}>
            <span>Launch Workspace</span>
            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-500 group-hover:translate-x-1 group-hover:scale-105">
              <ArrowUpRight weight="bold" className="text-black" />
            </div>
          </GlowButton>
          <Button variant="secondary" size="lg" className="rounded-full h-12 px-8" onClick={() => navigate('/auth')}>
            See How It Works
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease }}
        className="mt-20 w-full max-w-6xl mx-auto outer-shell"
      >
        <div className="inner-core aspect-[16/9] md:aspect-[21/9] flex flex-col bg-surfaceBorder">
          {/* Dashboard Header Mockup */}
          <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-danger/80"></div>
              <div className="w-3 h-3 rounded-full bg-warning/80"></div>
              <div className="w-3 h-3 rounded-full bg-success/80"></div>
            </div>
            <div className="mx-auto bg-black/40 rounded-md px-12 md:px-32 py-1.5 text-xs text-white/40 border border-white/5">app.fleetx.io</div>
          </div>
          {/* Dashboard Content Mockup Placeholder */}
          <div className="flex-1 p-4 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-br from-[#0a0a0a] to-[#050505] relative overflow-hidden">
             
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>

             <div className="col-span-1 rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between backdrop-blur-md">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <CarProfile size={20} className="text-white/80" />
                </div>
                <div>
                  <span className="block text-sm text-white/50 mb-1">Active Vehicles</span>
                  <span className="text-4xl font-bold">142</span>
                </div>
             </div>

             <div className="col-span-1 rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between backdrop-blur-md">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center mb-4">
                  <ChartLineUp size={20} className="text-success" />
                </div>
                <div>
                  <span className="block text-sm text-white/50 mb-1">Fleet Utilization</span>
                  <span className="text-4xl font-bold text-success">87%</span>
                </div>
             </div>

             <div className="col-span-1 md:col-span-2 row-span-2 rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col relative overflow-hidden backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-medium text-white/70">Revenue vs Operational Cost</span>
                  <div className="flex gap-2">
                    <span className="text-xs text-white/40 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"></div> Revenue</span>
                    <span className="text-xs text-white/40 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-danger"></div> Cost</span>
                  </div>
                </div>
                <div className="flex-1 relative border-b border-l border-white/10 mt-4">
                   <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,90 Q20,70 40,50 T100,10" fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <path d="M0,95 Q30,85 50,70 T100,60" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                   </svg>
                </div>
             </div>

             <div className="col-span-1 md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6 flex items-center gap-4 backdrop-blur-md">
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                  <Warning size={24} className="text-warning" />
                </div>
                <div>
                  <span className="block text-sm font-medium text-white mb-1">Maintenance Alerts</span>
                  <span className="text-sm text-white/60">3 Vehicles require immediate service to prevent downtime.</span>
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ProblemSolution() {
  return (
    <section className="py-32 px-4" id="features">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        <div className="w-full lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
          >
            <Badge variant="secondary" className="mb-6">The Old Way vs The New Way</Badge>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight mb-6">
              Stop Guessing.<br/> Start Managing.
            </h2>
            <p className="text-lg text-white/60 leading-relaxed mb-8">
              Many logistics companies lose thousands to scheduling conflicts, missed maintenance, and compliance fines. FleetX fixes that with an automated, rule-driven system.
            </p>
          </motion.div>
        </div>
        
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
            className="outer-shell"
          >
            <div className="inner-core p-8 flex items-start gap-6 bg-danger/5 border border-danger/20">
              <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center shrink-0 mt-1">
                <XCircle weight="fill" className="text-danger" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">The Old Way</h3>
                <p className="text-white/60 leading-relaxed">
                  Manual logbooks, whiteboards, expired licenses slipping through the cracks, and disconnected fuel receipts leading to inaccurate ROI.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="outer-shell"
          >
            <div className="inner-core p-8 flex items-start gap-6 bg-success/5 border border-success/20">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-1">
                <CheckCircle weight="fill" className="text-success" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">The FleetX Way</h3>
                <p className="text-white/60 leading-relaxed">
                  Real-time visibility, automated status toggles, strict dispatch validations, and centralized expense tracking all in one unified dashboard.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function RoleBasedFeatures() {
  return (
    <section className="py-32 px-4" id="roles">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-6">Role-Based Access Control</Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Built for the Whole Team</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]">
          {/* Fleet Manager */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}
            className="md:col-span-8 outer-shell h-full"
          >
            <div className="inner-core h-full p-8 flex flex-col justify-between bg-gradient-to-br from-white/5 to-transparent hover:bg-white/10 transition-colors duration-500">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <CarProfile size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Fleet Managers</h3>
                <p className="text-white/60">Keep assets moving. Oversee vehicle lifecycles, monitor fleet utilization, and never miss a maintenance window again.</p>
              </div>
            </div>
          </motion.div>

          {/* Safety Officer */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease }}
            className="md:col-span-4 outer-shell h-full"
          >
            <div className="inner-core h-full p-8 flex flex-col justify-between bg-gradient-to-br from-warning/10 to-transparent hover:bg-warning/20 transition-colors duration-500">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center border border-warning/30">
                <ShieldCheck size={24} className="text-warning" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Safety Officers</h3>
                <p className="text-white/60">Bulletproof compliance. Automatically block assignments for drivers with expired licenses.</p>
              </div>
            </div>
          </motion.div>

          {/* Dispatchers & Drivers */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease }}
            className="md:col-span-5 outer-shell h-full"
          >
            <div className="inner-core h-full p-8 flex flex-col justify-between bg-gradient-to-br from-primary/10 to-transparent hover:bg-primary/20 transition-colors duration-500">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <SteeringWheel size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Dispatchers & Drivers</h3>
                <p className="text-white/60">Error-free dispatch. The system automatically enforces cargo weight limits and vehicle availability.</p>
              </div>
            </div>
          </motion.div>

          {/* Financial Analyst */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3, ease }}
            className="md:col-span-7 outer-shell h-full"
          >
            <div className="inner-core h-full p-8 flex flex-col justify-between bg-gradient-to-br from-success/10 to-transparent hover:bg-success/20 transition-colors duration-500">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center border border-success/30">
                <CurrencyDollar size={24} className="text-success" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Financial Analysts</h3>
                <p className="text-white/60">Track real-time profitability. Monitor fuel logs, toll expenses, and instantly calculate true Vehicle ROI.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SmartAutomations() {
  return (
    <section className="py-32 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 text-center mb-20">
        <Badge variant="primary" className="mb-6">The Magic</Badge>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Intelligent Workflows<br/>That Do The Work For You</h2>
      </div>

      <div className="relative max-w-4xl mx-auto h-[600px] hidden md:block">
        {/* Card 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 100, rotate: -5 }}
          whileInView={{ opacity: 1, y: 0, rotate: -3 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease }}
          className="absolute top-0 left-[10%] w-[500px] outer-shell z-10"
        >
          <Card className="border-0 shadow-none bg-black/80">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/10"><MapPin size={24} /></div>
                <CardTitle>Automated Dispatching</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/60">Assign a trip, and both the driver and vehicle instantly shift to <span className="text-white bg-white/10 px-2 py-0.5 rounded-md text-sm">On Trip</span> status. No manual updates required.</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 100, rotate: 0 }}
          whileInView={{ opacity: 1, y: 120, rotate: 2 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.15, ease }}
          className="absolute top-0 left-[25%] w-[500px] outer-shell z-20"
        >
          <Card className="border-0 shadow-none bg-[#0a0a0a]">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/20 text-warning"><Wrench size={24} /></div>
                <CardTitle>Smart Maintenance Locks</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/60">Send a vehicle to the shop, and it is automatically hidden from the dispatch selection pool to prevent accidental assignments.</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 100, rotate: 5 }}
          whileInView={{ opacity: 1, y: 240, rotate: -1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.3, ease }}
          className="absolute top-0 left-[40%] w-[500px] outer-shell z-30 shadow-2xl"
        >
          <Card className="border-0 shadow-none bg-black/90">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-danger/20 text-danger"><ShieldCheck size={24} /></div>
                <CardTitle>Capacity & Compliance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/60">Built-in safeguards strictly prevent assigning cargo that exceeds load capacity or dispatching drivers with expired credentials.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="md:hidden flex flex-col gap-6 px-4">
         <Card className="bg-black/80"><CardHeader><CardTitle>Automated Dispatching</CardTitle></CardHeader><CardContent><p className="text-sm text-white/60">Instantly shift statuses to On Trip upon assignment.</p></CardContent></Card>
         <Card className="bg-[#0a0a0a]"><CardHeader><CardTitle>Smart Maintenance Locks</CardTitle></CardHeader><CardContent><p className="text-sm text-white/60">Hide vehicles in the shop from the dispatch pool automatically.</p></CardContent></Card>
         <Card className="bg-black/90"><CardHeader><CardTitle>Capacity & Compliance</CardTitle></CardHeader><CardContent><p className="text-sm text-white/60">Enforce load capacities and license validity at the dispatch level.</p></CardContent></Card>
      </div>
    </section>
  );
}

function Analytics() {
  return (
    <section className="py-32 px-4 relative" id="analytics">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        <div className="lg:w-1/3">
          <Badge variant="secondary" className="mb-6">Reporting</Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">Actionable Insights<br/>At a Glance</h2>
          <p className="text-lg text-white/60 mb-8">Turn your raw data into clear, exportable reports. Instantly export to CSV or PDF for your next stakeholder meeting.</p>
          <Button variant="secondary" className="rounded-full gap-2">
            View Analytics Dashboard
            <ArrowUpRight />
          </Button>
        </div>

        <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { icon: <ChartLineUp size={24}/>, label: "Fleet Utilization (%)", desc: "Monitor the exact percentage of active vs idle vehicles." },
            { icon: <GasPump size={24}/>, label: "Fuel Efficiency Tracking", desc: "Calculate Distance/Fuel to spot inefficiencies instantly." },
            { icon: <CurrencyDollar size={24}/>, label: "Total Operational Costs", desc: "Aggregate fuel and maintenance expenses in real-time." },
            { icon: <Graph size={24}/>, label: "Automated Vehicle ROI", desc: "(Revenue - Cost) / Acquisition Cost, calculated for you." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease }}
            >
              <Card className="h-full bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-300">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4 text-white">
                    {item.icon}
                  </div>
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="py-32 px-4 relative overflow-hidden border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-50 pointer-events-none"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">Ready to optimize your<br/>transport operations?</h2>
        <p className="text-xl text-white/60 mb-12">Join the modern era of logistics in under 5 minutes.</p>
        
        <GlowButton onClick={() => navigate('/auth')}>
          <span className="px-4">Deploy FleetX Now</span>
          <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-500 group-hover:translate-x-1 group-hover:scale-105">
            <ArrowUpRight weight="bold" className="text-black" />
          </div>
        </GlowButton>

        <div className="mt-32 pt-8 border-t border-white/10 w-full flex flex-col md:flex-row justify-between items-center text-white/40 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center font-bold text-white text-[10px]">FX</div>
             <span>© 2024 FleetX. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Routes, Route, useNavigate } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';


function LandingPage() {
  const [showIntro, setShowIntro] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-screen"
            className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
            exit={{ opacity: 0, transition: { duration: 1, ease } }}
          >
            <div className="flex flex-col items-center justify-center w-full h-full">
               <motion.img 
                 layoutId="main-logo"
                 src={LogoIcon} 
                 alt="FleetX Logo" 
                 initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                 animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                 transition={{ duration: 1.2, ease }}
                 className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl" 
               />
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ delay: 0.5, duration: 1, ease }}
                 className="mt-8 text-3xl font-bold tracking-tighter"
               >
                 FleetX
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar showIntro={showIntro} />
      
      <AnimatePresence>
        {!showIntro && (
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease, delay: 0.3 }}
            className="flex flex-col"
          >
            <Hero />
            <ProblemSolution />
            <RoleBasedFeatures />
            <SmartAutomations />
            <Analytics />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import TripsPage from './pages/dashboard/TripsPage';
import MaintenancePage from './pages/dashboard/MaintenancePage';
import VehiclesPage from './pages/dashboard/VehiclesPage';
import DriversPage from './pages/dashboard/DriversPage';
import FuelPage from './pages/dashboard/FuelPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="financial" element={<FuelPage />} />
      </Route>
    </Routes>
  );
}

export default App;

