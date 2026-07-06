import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { LayoutDashboard, Building2, Users, CreditCard, Receipt, BarChart3, Settings } from 'lucide-react';

const tabs = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'properties', path: '/properties', icon: Building2 },
  { key: 'tenants', path: '/tenants', icon: Users },
  { key: 'payments', path: '/payments', icon: CreditCard },
  { key: 'expenses', path: '/expenses', icon: Receipt },
  { key: 'reports', path: '/reports', icon: BarChart3 },
  { key: 'settings', path: '/settings', icon: Settings },
];

export default function BottomTabBar() {
  const { t } = useI18n();
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ key, path, icon: Icon }) => {
        const isActive = path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path);
        return (
          <Link
            key={key}
            to={path}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] select-none transition-colors
              ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
            <span className="text-[9px] font-medium leading-tight truncate max-w-[52px] text-center">{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}