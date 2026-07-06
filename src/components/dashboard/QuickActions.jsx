import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, CreditCard, Receipt, Send } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Link } from 'react-router-dom';

export default function QuickActions() {
  const { t } = useI18n();

  const actions = [
    { label: t('addTenant'), icon: UserPlus, path: '/tenants?action=add', color: 'bg-primary hover:bg-primary/90' },
    { label: t('recordPayment'), icon: CreditCard, path: '/payments?action=add', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: t('addExpense'), icon: Receipt, path: '/expenses?action=add', color: 'bg-orange-600 hover:bg-orange-700' },
    { label: t('sendReminder'), icon: Send, path: '/tenants', color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading">{t('quickActions')}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map(({ label, icon: Icon, path, color }) => (
          <Link key={label} to={path}>
            <Button className={`w-full h-auto py-3 flex-col gap-1.5 text-white ${color}`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}