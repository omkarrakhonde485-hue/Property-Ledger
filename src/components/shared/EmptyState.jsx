import { useI18n } from '@/lib/i18n';

export default function EmptyState({ icon: Icon, message }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      {Icon && <Icon className="w-12 h-12 mb-4 opacity-40" />}
      <p className="text-sm">{message || t('noData')}</p>
    </div>
  );
}