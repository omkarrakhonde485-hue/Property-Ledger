import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Rajesh Kumar', role: 'Property Owner', text: 'Property Ledger transformed how I manage my 12 rental properties. Rent collection has never been this effortless.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
  { name: 'Sarah Mitchell', role: 'Apartment Manager', text: 'The analytics dashboard gives me everything I need at a glance. I save hours every week on reporting.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
  { name: 'David Chen', role: 'Real Estate Consultant', text: 'I recommend Property Ledger to all my clients. It is the most complete property management tool on the market.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face' },
  { name: 'Priya Sharma', role: 'Builder & Developer', text: 'Managing leases and maintenance requests across multiple projects is now seamless. Absolutely game-changing.', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face' },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Testimonials</span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Loved by property professionals
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col"
            >
              <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed flex-1">"{t.text}"</p>
              <div className="mt-4 flex items-center gap-3">
                <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}