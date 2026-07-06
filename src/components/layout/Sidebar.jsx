import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import {
  LayoutDashboard, Building2, Users, CreditCard, Receipt,
  BarChart3, Settings, X, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'properties', path: '/properties', icon: Building2 },
  { key: 'tenants', path: '/tenants', icon: Users },
  { key: 'payments', path: '/payments', icon: CreditCard },
  { key: 'expenses', path: '/expenses', icon: Receipt },
  { key: 'reports', path: '/reports', icon: BarChart3 },
  { key: 'settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { t } = useI18n();
  const location = useLocation();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-[27px] h-[27px] text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight">Property Ledger</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="p-3 space-y-1 mt-2">
          {navItems.map(({ key, path, icon: Icon }) => {
            const isActive = path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path);
            return (
              <Link
                key={key}
                to={path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{t(key)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}