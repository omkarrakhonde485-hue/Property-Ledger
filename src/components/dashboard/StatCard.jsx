import { Card } from '@/components/ui/card';

export default function StatCard({ label, value, icon: Icon, color = 'bg-primary/10 text-primary' }) {
  return (
    <Card className="p-4 lg:p-5 hover:shadow-lg hover:brightness-105 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl lg:text-3xl font-bold font-heading">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}