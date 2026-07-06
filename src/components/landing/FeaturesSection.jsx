import { motion } from 'framer-motion';
import {
  Home, Users, DollarSign, FileText, Bell, Wrench,
  BarChart3, FolderOpen, TrendingUp, ShieldCheck,
} from 'lucide-react';

const features = [
  { icon: Home, title: 'Property Management', desc: 'Organize all your properties, units, and buildings in one centralized hub with detailed profiles.' },
  { icon: Users, title: 'Tenant Management', desc: 'Track tenant information, lease terms, and history with ease. Keep everyone organized.' },
  { icon: DollarSign, title: 'Rent Tracking', desc: 'Monitor rent collection in real-time with automated payment tracking and status updates.' },
  { icon: FileText, title: 'Lease Agreements', desc: 'Store and manage all lease documents digitally with expiry tracking and renewal alerts.' },
  { icon: Bell, title: 'Payment Reminders', desc: 'Automated reminders for upcoming and overdue payments sent directly to tenants.' },
  { icon: Wrench, title: 'Maintenance Requests', desc: 'Receive, track, and resolve maintenance requests with a streamlined workflow system.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Comprehensive analytics covering occupancy, revenue, expenses, and portfolio performance.' },
  { icon: FolderOpen, title: 'Document Storage', desc: 'Securely store and organize all property-related documents in a centralized cloud vault.' },
  { icon: TrendingUp, title: 'Income & Expense Reports', desc: 'Generate detailed financial reports with breakdowns of income, expenses, and net profit.' },
  { icon: ShieldCheck, title: 'Secure Cloud Backup', desc: 'Your data is encrypted and automatically backed up to the cloud with enterprise-grade security.' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Features</span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Everything you need to manage properties
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A complete toolkit designed for property owners, managers, and real estate professionals.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="group relative rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/80 p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 flex items-center justify-center mb-4 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:border-blue-700 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}