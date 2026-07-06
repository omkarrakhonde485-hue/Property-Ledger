const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import MeshGradientBackground from './MeshGradientBackground';

export default function LoginModal({ open, onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await db.auth.loginViaEmailPassword(email, password);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1200);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    db.auth.loginWithProvider('google', '/dashboard');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            style={{ perspective: 1200 }}
            className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2"
          >
            {/* Left - 3D illustration with mesh gradient */}
            <div className="hidden md:flex flex-col justify-between p-8 text-white relative overflow-hidden">
              <MeshGradientBackground />
              <div className="relative">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-heading font-bold text-lg">Property Ledger</span>
                </div>
                <h3 className="font-heading text-2xl font-bold leading-tight mb-3">
                  Welcome back to your dashboard
                </h3>
                <p className="text-sm text-blue-100/80">
                  Manage properties, tenants, and payments — all in one place.
                </p>
              </div>

              <div className="relative space-y-3">
                {[
                  { label: 'Monthly Revenue', value: '$52,840' },
                  { label: 'Occupancy Rate', value: '94%' },
                  { label: 'Rent Collected', value: '92%' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/15 p-3 flex items-center justify-between">
                    <span className="text-xs text-blue-100/80">{stat.label}</span>
                    <span className="text-sm font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - glassmorphic form */}
            <div className="relative p-8 flex flex-col justify-center bg-white/80 backdrop-blur-2xl">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
                    >
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </motion.div>
                    <p className="font-heading text-lg font-bold text-slate-900">Login Successful!</p>
                    <p className="text-sm text-slate-500 mt-1">Redirecting to your dashboard...</p>
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin mt-4" />
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="font-heading text-2xl font-bold text-slate-900 mb-1">Login to your account</h2>
                    <p className="text-sm text-slate-500 mb-6">Enter your credentials to access your dashboard</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200/80 bg-white/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200/80 bg-white/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                          <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                          Remember me
                        </label>
                        <button
                          type="button"
                          onClick={() => navigate('/forgot-password')}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Forgot password?
                        </button>
                      </div>

                      {error && (
                        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/25"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          'Login'
                        )}
                      </Button>
                    </form>

                    <div className="my-5 flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-200/60" />
                      <span className="text-xs text-slate-400">or</span>
                      <div className="flex-1 h-px bg-slate-200/60" />
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleGoogle}
                      className="w-full font-medium bg-white/50 backdrop-blur-sm border-slate-200/80"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </Button>

                    <p className="mt-5 text-center text-sm text-slate-500">
                      Don't have an account?{' '}
                      <button onClick={() => navigate('/register')} className="text-blue-600 hover:text-blue-700 font-semibold">
                        Create Account
                      </button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}