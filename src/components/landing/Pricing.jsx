import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tiers = [
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    desc: 'Perfect for individual property owners.',
    features: ['Up to 5 properties', 'Tenant management', 'Rent tracking', 'Basic reports', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    desc: 'For growing property management businesses.',
    features: ['Up to 50 properties', 'Everything in Starter', 'Advanced analytics', 'Lease management', 'Maintenance tracking', 'Priority support'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large portfolios and enterprises.',
    features: ['Unlimited properties', 'Everything in Professional', 'Custom integrations', 'Dedicated manager', '24/7 phone support', 'SLA guarantee'],
    highlighted: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Pricing</span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600">Choose the plan that fits your portfolio. No hidden fees.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-4 items-center">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative rounded-3xl p-8 ${
                tier.highlighted
                  ? 'bg-slate-900 border-2 border-blue-600 shadow-2xl shadow-blue-600/20 lg:scale-105 z-10'
                  : 'bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-lg'
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg">
                  MOST POPULAR
                </span>
              )}
              <h3 className={`font-heading text-xl font-bold ${tier.highlighted ? 'text-white' : 'text-slate-900'}`}>{tier.name}</h3>
              <p className={`mt-1 text-sm ${tier.highlighted ? 'text-slate-400' : 'text-slate-600'}`}>{tier.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${tier.highlighted ? 'text-white' : 'text-slate-900'}`}>{tier.price}</span>
                <span className={`text-sm ${tier.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>{tier.period}</span>
              </div>
              <Button
                onClick={() => navigate('/register')}
                className={`w-full mt-6 ${tier.highlighted ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                variant={tier.highlighted ? 'default' : 'outline'}
              >
                {tier.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
              </Button>
              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlighted ? 'text-blue-400' : 'text-green-500'}`} />
                    <span className={`text-sm ${tier.highlighted ? 'text-slate-300' : 'text-slate-600'}`}>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}