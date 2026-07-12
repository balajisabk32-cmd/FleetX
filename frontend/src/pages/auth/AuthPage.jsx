import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { z } from 'zod';
import { ArrowLeft, Truck, ShieldCheck, SteeringWheel, ArrowRight, Eye, EyeSlash } from '@phosphor-icons/react';
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
  const [showPassword, setShowPassword] = useState(false);

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

      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: tokenResponse.access_token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Google Authentication failed.');
      }

      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google Authentication failed.');
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google Login Failed'),
  });

  const handleSubmit = async (e) => {
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

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password, roleName: 'Viewer' };

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed.');
      setLoading(false);
    }
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
            Bulletproof Security.<br />Flawless Operations.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed mb-12">
            Sign in to access your FleetX Workspace. Manage vehicles, dispatch drivers, and monitor profitability with enterprise-grade security.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <Truck size={24} className="text-primary" />
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
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/20"
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-1.5 auth-item">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-medium text-white/70">Password</label>
                  {isLogin && <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot?</a>}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-lg pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
