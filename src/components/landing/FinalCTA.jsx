import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section id="contact" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-8 py-16 lg:px-16 lg:py-24 text-center"
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-blue-500/30 blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-green-500/20 blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Ready to Modernize Your Property Management?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of property owners who trust Property Ledger to manage their portfolios efficiently.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-white text-slate-900 hover:bg-slate-100 text-base font-semibold group"
              >
                Start Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/register')}
                className="text-base font-semibold border-white/30 text-white hover:bg-white/10"
              >
                <Calendar className="mr-2 w-4 h-4" />
                Book Demo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}