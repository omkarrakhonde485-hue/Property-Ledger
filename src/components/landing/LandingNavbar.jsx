import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingNavbar({ onLoginClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQs', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className={`flex items-center justify-between h-16 lg:h-18 px-5 rounded-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/60 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
            : 'bg-white/10 backdrop-blur-xl border border-white/20'
        }`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-slate-900">Property Ledger</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-full transition-all hover:bg-white/40"
            >
              Login
            </button>
            <Button
              onClick={() => navigate('/register')}
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 rounded-full"
            >
              Get Started
            </Button>
          </div>

          <button className="md:hidden p-2 text-slate-700" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-2 max-w-7xl mx-auto overflow-hidden"
          >
            <div className="bg-white/90 backdrop-blur-2xl border border-white/40 rounded-3xl px-5 py-4 space-y-3 shadow-xl">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 flex flex-col gap-2 border-t border-slate-200/60">
                <Button variant="outline" onClick={() => { onLoginClick(); setMobileOpen(false); }} className="w-full rounded-full">
                  Login
                </Button>
                <Button onClick={() => navigate('/register')} className="w-full bg-blue-600 hover:bg-blue-700 rounded-full">
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}