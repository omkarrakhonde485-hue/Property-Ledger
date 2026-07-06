import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users, Wrench, CheckCircle2, Home } from 'lucide-react';

export default function HeroDashboardMockup() {
  return (
    <div className="relative" style={{ perspective: 1200 }}>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] p-5 overflow-hidden"
      >
        {/* Glass shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none rounded-2xl" />

        <div className="relative flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/60 font-medium">Dashboard Overview</p>
            <h3 className="text-sm font-bold text-white">Sunset Apartments</h3>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-white/15 backdrop-blur-xl border border-white/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <DollarSign className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] text-white/70 font-medium">Rent Collected</span>
            </div>
            <p className="text-lg font-bold text-white">$48,250</p>
            <p className="text-[10px] text-emerald-300 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> +12.5%
            </p>
          </div>
          <div className="rounded-xl bg-white/15 backdrop-blur-xl border border-white/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] text-white/70 font-medium">Occupancy</span>
            </div>
            <p className="text-lg font-bold text-white">94%</p>
            <p className="text-[10px] text-teal-300 font-medium">47/50 units</p>
          </div>
        </div>

        <div className="relative rounded-xl bg-white/10 backdrop-blur-xl border border-white/15 p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-white/80">Income vs Expenses</span>
            <span className="text-[10px] text-white/50">Last 6 months</span>
          </div>
          <div className="flex items-end justify-between gap-1 h-16">
            {[
              { i: 40, e: 20, color: 'bg-emerald-400 shadow-emerald-400/50' },
              { i: 55, e: 25, color: 'bg-blue-400 shadow-blue-400/50' },
              { i: 45, e: 22, color: 'bg-purple-400 shadow-purple-400/50' },
              { i: 65, e: 30, color: 'bg-amber-400 shadow-amber-400/50' },
              { i: 70, e: 28, color: 'bg-cyan-400 shadow-cyan-400/50' },
              { i: 80, e: 35, color: 'bg-orange-400 shadow-orange-400/50' },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className={`w-full rounded-t-sm shadow-sm ${bar.color}`} style={{ height: `${bar.i}%` }} />
                <div className="w-full bg-white/20" style={{ height: `${bar.e}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="relative space-y-2">
          {[
            { name: 'John Smith', amount: '+$1,200', type: 'Rent', status: 'Paid', badgeColor: 'bg-emerald-400/30 text-emerald-200' },
            { name: 'Sarah Johnson', amount: '+$950', type: 'Rent', status: 'Pending', badgeColor: 'bg-amber-400/30 text-amber-200' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-white/10 backdrop-blur-xl p-2 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Home className="w-3 h-3 text-white/70" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-white">{tx.name}</p>
                  <p className="text-[9px] text-white/50">{tx.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded ${tx.badgeColor}`}>{tx.status}</span>
                <span className="text-[10px] font-bold text-emerald-300">{tx.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{ transform: 'translateZ(40px)' }}
        className="absolute -top-4 -right-2 sm:-right-4 rounded-xl bg-white/25 backdrop-blur-2xl border border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.15)] p-3 flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-lg bg-green-400/30 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-green-300" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-white">Payment Received</p>
          <p className="text-[9px] text-white/60">$1,200 from John S.</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ transform: 'translateZ(30px)' }}
        className="absolute -bottom-4 -left-2 sm:-left-4 rounded-xl bg-white/25 backdrop-blur-2xl border border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.15)] p-3 flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-lg bg-orange-400/30 flex items-center justify-center">
          <Wrench className="w-4 h-4 text-orange-300" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-white">Maintenance Due</p>
          <p className="text-[9px] text-white/60">Unit 204 · Plumbing</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        style={{ transform: 'translateZ(35px)' }}
        className="absolute top-1/2 -right-2 sm:-right-6 rounded-xl bg-white/25 backdrop-blur-2xl border border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.15)] p-3 flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-lg bg-blue-400/30 flex items-center justify-center">
          <Users className="w-4 h-4 text-blue-200" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-white">New Tenant Added</p>
          <p className="text-[9px] text-white/60">Sarah J. · Unit 302</p>
        </div>
      </motion.div>
    </div>
  );
}