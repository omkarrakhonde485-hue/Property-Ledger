import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Home, Users, CreditCard, Receipt, BarChart3, FolderOpen, FileChartColumn } from 'lucide-react';

const cards = [
  { icon: Home, label: 'Property', x: '5%', y: '10%', color: 'from-blue-500 to-blue-600', delay: 0 },
  { icon: Users, label: 'Tenants', x: '70%', y: '5%', color: 'from-green-500 to-green-600', delay: 0.1 },
  { icon: CreditCard, label: 'Payments', x: '85%', y: '38%', color: 'from-indigo-500 to-indigo-600', delay: 0.2 },
  { icon: Receipt, label: 'Expenses', x: '75%', y: '70%', color: 'from-amber-500 to-orange-500', delay: 0.3 },
  { icon: BarChart3, label: 'Reports', x: '40%', y: '82%', color: 'from-purple-500 to-purple-600', delay: 0.4 },
  { icon: FolderOpen, label: 'Documents', x: '8%', y: '72%', color: 'from-rose-500 to-pink-500', delay: 0.5 },
];

export default function ExperienceSection() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left - rect.width / 2) / rect.width,
      y: (e.clientY - rect.top - rect.height / 2) / rect.height,
    });
  };

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Connected Ecosystem</span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            A unified platform where everything connects
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Properties, tenants, payments, and reports — all seamlessly linked in one intelligent system.
          </p>
        </motion.div>

        <div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMouse({ x: 0, y: 0 })}
          className="relative h-[480px] sm:h-[520px] rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/60 overflow-hidden"
        >
          {/* Center hub */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ x: mouse.x * -10, y: mouse.y * -10 }}
          >
            <div className="w-24 h-24 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl flex items-center justify-center">
              <FileChartColumn className="w-10 h-10 text-blue-600" />
            </div>
            <p className="mt-3 text-center text-sm font-bold text-slate-900">Property Ledger</p>
          </motion.div>

          {/* SVG connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#22C55E" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {cards.map((card, idx) => (
              <line
                key={idx}
                x1="50%"
                y1="50%"
                x2={card.x}
                y2={card.y}
                stroke="url(#line-gradient)"
                strokeWidth="1.5"
                strokeDasharray="5,5"
              />
            ))}
          </svg>

          {/* Floating cards */}
          {cards.map((card) => (
            <motion.div
              key={card.label}
              className="absolute z-20"
              style={{
                left: card.x,
                top: card.y,
                x: mouse.x * 25,
                y: mouse.y * 25,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: card.delay }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: card.delay }}
                className="flex items-center gap-2.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl px-4 py-3"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-900">{card.label}</span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}