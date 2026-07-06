import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: 10000, suffix: '+', label: 'Properties Managed' },
  { value: 50000, suffix: '+', label: 'Tenants' },
  { value: 100, prefix: '₹', suffix: 'Cr+', label: 'Transactions Recorded' },
  { value: 99.9, suffix: '%', label: 'Uptime', decimals: 1 },
];

function CountUp({ target, decimals = 0, start }) {
  const [count, setCount] = useState(0);
  const duration = 2000;

  useEffect(() => {
    if (!start) return;
    let startTime;
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(target * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, start]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return <>{formatted}</>;
}

export default function Statistics() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 p-10 lg:p-16 shadow-2xl shadow-blue-600/20"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading">
                  {stat.prefix}<CountUp target={stat.value} decimals={stat.decimals} start={inView} />{stat.suffix}
                </p>
                <p className="mt-2 text-sm text-blue-100 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}