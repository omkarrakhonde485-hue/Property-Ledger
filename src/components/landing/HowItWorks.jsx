import { motion } from 'framer-motion';
import { Home, Users, CreditCard, FileBarChart } from 'lucide-react';

const steps = [
  { icon: Home, title: 'Add Your Property', desc: 'Create property profiles with details, photos, and unit configurations in minutes.' },
  { icon: Users, title: 'Add Tenants', desc: 'Onboard tenants, assign units, and set lease terms with automated documentation.' },
  { icon: CreditCard, title: 'Track Payments', desc: 'Monitor rent collection, send reminders, and reconcile payments automatically.' },
  { icon: FileBarChart, title: 'Generate Reports', desc: 'Create comprehensive financial and occupancy reports with a single click.' },
];

export default function HowItWorks() {
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
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">How It Works</span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Get started in four simple steps
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From setup to reports — Property Ledger makes property management effortless.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          <div className="grid lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative"
              >
                <div className="relative rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/25">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-slate-200">{idx + 1}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 w-8 h-8 items-center justify-center text-slate-300 z-10">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}