import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-slate-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-slate-50 to-slate-50" />
      <motion.div
        className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-[120px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[35%] -right-20 w-[600px] h-[600px] rounded-full bg-green-200/15 blur-[130px]"
        animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}