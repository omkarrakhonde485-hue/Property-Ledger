import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, FileWarning, BedDouble } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function AlertsList({ overdueCount, vacatingCount, expiringDocsCount, reservedCount }) {
  const { t } = useI18n();

  const alerts = [
    { label: t('overdueRent'), count: overdueCount, icon: AlertTriangle, color: 'text-destructive bg-destructive/10' },
    { label: t('vacatingSoon'), count: vacatingCount, icon: Clock, color: 'text-warning bg-warning/10' },
    { label: t('expiringDocuments'), count: expiringDocsCount, icon: FileWarning, color: 'text-orange-500 bg-orange-500/10' },
    { label: t('reservedBeds'), count: reservedCount, icon: BedDouble, color: 'text-primary bg-primary/10' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading">{t('alerts')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </div>
            <Badge variant={count > 0 ? "destructive" : "secondary"} className="text-xs">
              {count}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}