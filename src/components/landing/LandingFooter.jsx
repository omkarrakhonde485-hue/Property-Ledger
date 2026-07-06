import { Link } from 'react-router-dom';
import { Building2, Twitter, Linkedin, Facebook, Instagram, ArrowRight } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

const footerLinks = {
  'Quick Links': [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#contact' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Community', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'GDPR', href: '#' },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-slate-200 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-lg text-slate-900">Property Ledger</span>
            </Link>
            <p className="text-sm text-slate-600 max-w-xs mb-6">
              Smart Property Management. Simplified. The complete platform for property owners and managers.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Facebook, Instagram].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="font-heading text-sm font-bold text-slate-900 mb-3">{title}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-heading text-sm font-bold text-slate-900 mb-3">Newsletter</h4>
            <p className="text-sm text-slate-600 mb-3">Get the latest updates and tips.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
              <Button size="icon" className="bg-blue-600 hover:bg-blue-700 px-3">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© 2026 Property Ledger. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}