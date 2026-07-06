import { motion } from 'framer-motion';
import { Shield, Zap, MousePointerClick, FileBarChart, Layers, Smartphone, Headset } from 'lucide-react';

const reasons = [
  { icon: Shield, title: 'Secure Cloud', desc: 'Bank-level encryption with automated daily backups.' },
  { icon: Zap, title: 'Fast Performance', desc: 'Lightning-quick load times across every feature.' },
  { icon: MousePointerClick, title: 'Easy to Use', desc: 'Intuitive interface that requires no training.' },
  { icon: FileBarChart, title: 'Automatic Reports', desc: 'Generate and schedule reports in one click.' },
  { icon: Layers, title: 'Scalable', desc: 'From single units to entire portfolios with ease.' },
  { icon: Smartphone, title: 'Mobile Friendly', desc: 'Full functionality on any device, anywhere.' },
  { icon: Headset, title: '24/7 Support', desc: 'Round-the-clock help whenever you need it.' },
];

export default function WhyChooseUs() {
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
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Why Choose Us</span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Built for reliability, designed for scale
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reasons.map((reason, idx) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/80 p-6 hover:shadow-lg hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                <reason.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 mb-1">{reason.title}</h3>
              <p className="text-sm text-slate-600">{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}