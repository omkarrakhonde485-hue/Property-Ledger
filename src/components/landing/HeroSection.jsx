import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroDashboardMockup from './HeroDashboardMockup';
import MeshGradientBackground from './MeshGradientBackground';

export default function HeroSection({ onLoginClick }) {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      <MeshGradientBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-white/90">Trusted by 10,000+ property managers</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Manage Every Property, Tenant &amp; Payment in One Place.
            </h1>

            <p className="mt-6 text-lg text-blue-100/80 leading-relaxed max-w-xl">
              A complete digital property ledger to track properties, tenants, rent collection, maintenance, expenses, agreements, and reports effortlessly.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="text-base font-semibold shadow-2xl shadow-blue-900/40 group bg-white text-blue-700 hover:bg-blue-50"
              >
                Owner Dashboard
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <button
                onClick={() => navigate('/tenant-portal')}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-bold transition-all duration-300 h-11 px-6 bg-white/10 backdrop-blur-[24px] border border-white/30 text-white hover:bg-blue-600 hover:text-black hover:border-blue-600 shadow-lg shadow-blue-950/20"
              >
                Tenant Portal 📱
              </button>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-blue-100/70 font-medium">Trusted by Property Owners &amp; Managers</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateY: -8 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ perspective: 1200 }}
            className="relative"
          >
            <HeroDashboardMockup />
          </motion.div>
        </div>
      </div>

      {/* Fade to page background */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-slate-50" />
    </section>
  );
}