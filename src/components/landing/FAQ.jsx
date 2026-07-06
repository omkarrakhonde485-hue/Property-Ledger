import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'How secure is my data?', a: 'All data is encrypted with bank-level AES-256 encryption both in transit and at rest. We perform automated daily cloud backups and comply with industry security standards to ensure your information is always protected.' },
  { q: 'Does Property Ledger support cloud backup?', a: 'Yes. Your data is automatically backed up to the cloud every day. You can also manually export your data at any time. Your information is always safe and accessible.' },
  { q: 'How do I add my properties?', a: 'Simply click "Add Property" from your dashboard, enter the property details, upload photos, and configure units. The entire process takes less than two minutes per property.' },
  { q: 'Can I manage multiple tenants for one property?', a: 'Absolutely. Each property can have multiple units, and each unit can have its own tenant, lease agreement, and payment schedule. You have full flexibility in how you organize your portfolio.' },
  { q: 'What types of reports can I generate?', a: 'Property Ledger generates income statements, expense reports, occupancy reports, rent collection summaries, and tenant histories. All reports can be exported as PDF and scheduled for automatic delivery.' },
  { q: 'How does rent payment tracking work?', a: 'You can record payments manually or let tenants pay through the platform. The system automatically tracks due dates, sends reminders, and updates payment status in real-time on your dashboard.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">FAQ</span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/80 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-heading font-semibold text-slate-900 text-sm sm:text-base">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-4 transition-transform duration-300 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}