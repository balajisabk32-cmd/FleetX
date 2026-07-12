import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { z } from 'zod';
import { ArrowLeft, CarProfile, ShieldCheck, SteeringWheel, ArrowRight } from '@phosphor-icons/react';
import { Button } from '../../components/ui/button';
import { GlowButton } from '../../components/kokonut/GlowButton';

gsap.registerPlugin(useGSAP);

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function AuthPage() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // GSAP Dramatic Entrance
  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from('.auth-bg', { scale: 1.1, opacity: 0, duration: 1.5, ease: 'power3.out' })
      .from('.auth-content', { x: 50, opacity: 0, duration: 1, ease: 'power3.out' }, '-=1')
      .from('.auth-graphic', { x: -50, opacity: 0, duration: 1, ease: 'power3.out' }, '-=1')
      .from('.auth-item', { y: 20, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, '-=0.5');
  }, { scope: containerRef });

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setLoading(true);
      setError('');
      // In a real app, you send tokenResponse.access_token to the backend
      // and backend uses google-auth-library to verify.
      // For this hackathon UI demo, we will mock success and navigate to dashboard.
      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard'); // Assuming dashboard is next
      }, 1000);
    } catch (err) {
      setError('Google Authentication failed.');
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google Login Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Bulletproof Zod Validation
    try {
      authSchema.parse({ email: formData.email, password: formData.password });
      if (!isLogin && formData.name.length < 2) {
        throw new Error("Name is required");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err.message);
      }
      return;
    }

    setLoading(true);
    // Mocking API call for bulletproof UI
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard'); // Proceed to dashboard
    }, 1500);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background flex text-white relative overflow-hidden">
      
      {/* Absolute Back Button */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-white/50 hover:text-white transition-colors auth-item"
      >
        <ArrowLeft weight="bold" /> Back to Home
      </button>

      {/* Left Side: Graphic / Value Prop */}
      <div className="hidden lg:flex flex-1 relative bg-[#0a0a0a] border-r border-white/10 auth-bg items-center justify-center p-12 overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"></div>

        <div className="relative z-10 max-w-lg auth-graphic">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8 border border-white/20">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tighter mb-6 leading-[1.1]">
            Bulletproof Security.<br/>Flawless Operations.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed mb-12">
            Sign in to access your FleetX Workspace. Manage vehicles, dispatch drivers, and monitor profitability with enterprise-grade security.
          </p>
          
          <div className="space-y-6">
             <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <CarProfile size={24} className="text-primary" />
                <div>
                  <h4 className="font-medium">Fleet Analytics</h4>
                  <p className="text-sm text-white/40">Real-time tracking and ROI</p>
                </div>
             </div>
             <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <SteeringWheel size={24} className="text-success" />
                <div>
                  <h4 className="font-medium">Smart Dispatch</h4>
                  <p className="text-sm text-white/40">Automated assignments</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative auth-content">
        <div className="w-full max-w-md outer-shell">
          <div className="inner-core bg-[#050505]/80 backdrop-blur-3xl p-8 md:p-12 border border-white/10 flex flex-col items-center">
            
            <h2 className="text-3xl font-bold tracking-tighter mb-2 auth-item">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-white/50 text-sm mb-8 text-center auth-item">
              {isLogin ? 'Enter your credentials to access your workspace.' : 'Sign up to modernize your fleet operations.'}
            </p>

            <button 
              onClick={() => googleLogin()}
              className="w-full h-12 flex items-center justify-center gap-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors mb-6 auth-item"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="w-full flex items-center gap-4 mb-6 auth-item">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-white/30 text-xs uppercase tracking-widest font-medium">Or</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            {error && (
              <div className="w-full p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm mb-6 auth-item text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {!isLogin && (
                <div className="space-y-1.5 auth-item">
                  <label className="text-xs font-medium text-white/70 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/20"
                    placeholder="John Doe"
                  />
                </div>
              )}
              
              <div className="space-y-1.5 auth-item">
                <label className="text-xs font-medium text-white/70 ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/20"
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-1.5 auth-item">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-medium text-white/70">Password</label>
                  {isLogin && <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot?</a>}
                </div>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/20"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-4 auth-item">
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-lg text-base font-medium relative overflow-hidden group"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                  {/* Subtle inner glow for tasteskill */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-white/50 auth-item">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                className="text-white hover:text-primary transition-colors font-medium"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
