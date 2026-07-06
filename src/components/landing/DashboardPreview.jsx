import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Users, Clock, CalendarDays, Wrench,
  BarChart3, Activity, Plus, Home, LayoutGrid,
} from 'lucide-react';

function Widget({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-xl bg-white border border-slate-200/80 p-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function DashboardPreview() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Live Preview</span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            A dashboard built for real-world management
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Every metric, every property, every transaction — visible at a glance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-slate-50 border border-slate-200/80 p-4 sm:p-6 shadow-2xl shadow-slate-300/30"
        >
          <div className="grid lg:grid-cols-12 gap-4">
            {/* Sidebar */}
            <div className="hidden lg:flex lg:col-span-2 flex-col gap-1 rounded-2xl bg-white border border-slate-200/80 p-3">
              <div className="flex items-center gap-2 px-2 py-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-900">Ledger</span>
              </div>
              {['Dashboard', 'Properties', 'Tenants', 'Payments', 'Expenses', 'Reports'].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${i === 0 ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`}>
                  {item}
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="lg:col-span-10 space-y-4">
              {/* Top stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Widget delay={0.05}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">Monthly Revenue</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center"><DollarSign className="w-3.5 h-3.5 text-emerald-600" /></div>
                  </div>
                  <p className="text-xl font-bold text-slate-900">$52,840</p>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +8.2%</p>
                </Widget>
                <Widget delay={0.1}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">Occupancy Rate</span>
                    <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center"><Users className="w-3.5 h-3.5 text-teal-600" /></div>
                  </div>
                  <p className="text-xl font-bold text-slate-900">94%</p>
                  <p className="text-xs text-slate-400">47 of 50 units</p>
                </Widget>
                <Widget delay={0.15}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">Rent Collection</span>
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center"><Activity className="w-3.5 h-3.5 text-indigo-600" /></div>
                  </div>
                  <p className="text-xl font-bold text-slate-900">92%</p>
                  <p className="text-xs text-slate-400">46 of 50 paid</p>
                </Widget>
                <Widget delay={0.2}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">Pending Dues</span>
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center"><Clock className="w-3.5 h-3.5 text-amber-600" /></div>
                  </div>
                  <p className="text-xl font-bold text-slate-900">$4,100</p>
                  <p className="text-xs text-amber-600 font-medium">4 tenants</p>
                </Widget>
              </div>

              {/* Charts row */}
              <div className="grid lg:grid-cols-3 gap-4">
                <Widget className="lg:col-span-2" delay={0.25}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-900">Income vs Expense</span>
                    <span className="text-xs text-slate-400">Last 8 months</span>
                  </div>
                  <div className="flex items-end justify-between gap-2 h-32">
                    {[
                      { i: 45, e: 22, color: 'bg-emerald-500' }, { i: 55, e: 28, color: 'bg-blue-500' }, { i: 50, e: 25, color: 'bg-purple-500' }, { i: 62, e: 30, color: 'bg-amber-500' },
                      { i: 70, e: 32, color: 'bg-cyan-500' }, { i: 65, e: 35, color: 'bg-orange-500' }, { i: 78, e: 38, color: 'bg-emerald-500' }, { i: 85, e: 40, color: 'bg-blue-500' },
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-0.5">
                        <div className={`w-full rounded-t shadow-sm ${bar.color}`} style={{ height: `${bar.i}%` }} />
                        <div className="w-full bg-rose-400 rounded-b" style={{ height: `${bar.e}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Income</span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> Expenses</span>
                  </div>
                </Widget>

                <Widget delay={0.3}>
                  <span className="text-sm font-bold text-slate-900">Upcoming Renewals</span>
                  <div className="mt-3 space-y-3">
                    {[
                      { name: 'John Smith', unit: 'Unit 204', date: 'Jul 15' },
                      { name: 'Emma Wilson', unit: 'Unit 110', date: 'Jul 22' },
                      { name: 'Mike Brown', unit: 'Unit 302', date: 'Aug 01' },
                    ].map((r) => (
                      <div key={r.name} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">{r.name}</p>
                          <p className="text-[10px] text-slate-400">{r.unit}</p>
                        </div>
                        <span className="text-[10px] font-medium text-blue-600">{r.date}</span>
                      </div>
                    ))}
                  </div>
                </Widget>
              </div>

              {/* Bottom row */}
              <div className="grid lg:grid-cols-3 gap-4">
                <Widget delay={0.35}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-900">Maintenance Requests</span>
                    <Wrench className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="space-y-2">
                    {[
                      { issue: 'Plumbing leak', unit: '204', priority: 'High' },
                      { issue: 'AC repair', unit: '110', priority: 'Medium' },
                    ].map((m) => (
                      <div key={m.issue} className="flex items-center justify-between rounded-lg bg-orange-50/50 px-2 py-1.5">
                        <span className="text-xs text-slate-600">{m.issue} · Unit {m.unit}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${m.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>{m.priority}</span>
                      </div>
                    ))}
                  </div>
                </Widget>

                <Widget delay={0.4}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-900">Recent Activity</span>
                    <Activity className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    {[
                      { text: 'Payment received', time: '2m ago', color: 'bg-emerald-500' },
                      { text: 'New tenant added', time: '1h ago', color: 'bg-teal-500' },
                      { text: 'Lease renewed', time: '3h ago', color: 'bg-blue-500' },
                    ].map((a) => (
                      <div key={a.text} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${a.color}`} />
                        <span className="text-xs text-slate-600 flex-1">{a.text}</span>
                        <span className="text-[10px] text-slate-400">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </Widget>

                <Widget delay={0.45}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-900">Quick Actions</span>
                    <LayoutGrid className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Add Property', icon: Home, color: 'text-blue-600' },
                      { label: 'Add Tenant', icon: Users, color: 'text-teal-600' },
                      { label: 'Record Payment', icon: DollarSign, color: 'text-emerald-600' },
                      { label: 'View Reports', icon: BarChart3, color: 'text-indigo-600' },
                    ].map((a) => (
                      <div key={a.label} className="flex flex-col items-center gap-1.5 rounded-lg bg-slate-50 p-3 hover:bg-slate-100 hover:brightness-105 transition-all cursor-pointer">
                        <a.icon className={`w-4 h-4 ${a.color}`} />
                        <span className="text-[10px] font-medium text-slate-600 text-center">{a.label}</span>
                      </div>
                    ))}
                  </div>
                </Widget>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}