const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useI18n } from '@/lib/i18n';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullRefreshIndicator from '@/components/shared/PullRefreshIndicator';
import StatCard from '@/components/dashboard/StatCard';
import AlertsList from '@/components/dashboard/AlertsList';
import QuickActions from '@/components/dashboard/QuickActions';
import {
  Building2, DoorOpen, BedDouble, Users, BedSingle,
  Percent, IndianRupee, TrendingUp, AlertTriangle, Receipt
} from 'lucide-react';

export default function Dashboard() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const refreshing = usePullToRefresh(() => qc.invalidateQueries());

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => db.entities.Property.list(),
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => db.entities.Room.list(),
  });

  const { data: beds = [] } = useQuery({
    queryKey: ['beds'],
    queryFn: () => db.entities.Bed.list(),
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => db.entities.Tenant.list(),
  });

  const { data: rentDues = [] } = useQuery({
    queryKey: ['rentDues'],
    queryFn: () => db.entities.RentDue.list(),
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => db.entities.Expense.list(),
  });

  const activeTenants = tenants.filter(t => t.status === 'Active');
  const vacantBeds = beds.filter(b => b.status === 'Vacant');
  const reservedBeds = beds.filter(b => b.status === 'Reserved');
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentMonthDues = rentDues.filter(d => d.month === currentMonth && d.year === currentYear);
  const expectedRent = currentMonthDues.reduce((s, d) => s + (d.rent_amount || 0), 0);
  const collectedRent = currentMonthDues.reduce((s, d) => s + (d.amount_paid || 0), 0);
  const outstandingRent = currentMonthDues.reduce((s, d) => s + (d.pending_amount || 0), 0);
  
  const overdueCount = rentDues.filter(d => d.status !== 'Paid' && (d.year < currentYear || (d.year === currentYear && d.month < currentMonth))).length;
  
  const vacatingCount = tenants.filter(t => t.status === 'Notice Given').length;

  const currentMonthExpenses = expenses.filter(e => {
    if (!e.expense_date) return false;
    const d = new Date(e.expense_date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlyExpenseTotal = currentMonthExpenses.reduce((s, e) => s + (e.amount || 0), 0);

  const stats = [
    { label: t('totalProperties'), value: properties.length, icon: Building2, color: 'bg-blue-500/10 text-blue-600' },
    { label: t('totalRooms'), value: rooms.length, icon: DoorOpen, color: 'bg-cyan-500/10 text-cyan-600' },
    { label: t('totalBeds'), value: totalBeds, icon: BedDouble, color: 'bg-indigo-500/10 text-indigo-600' },
    { label: t('activeTenants'), value: activeTenants.length, icon: Users, color: 'bg-emerald-500/10 text-emerald-600' },
    { label: t('vacantBeds'), value: vacantBeds.length, icon: BedSingle, color: 'bg-orange-500/10 text-orange-600' },
    { label: t('occupancyRate'), value: `${occupancyRate}%`, icon: Percent, color: 'bg-teal-500/10 text-teal-600' },
    { label: t('expectedRent'), value: `₹${expectedRent.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-emerald-500/10 text-emerald-600' },
    { label: t('collectedRent'), value: `₹${collectedRent.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-green-500/10 text-green-600' },
    { label: t('outstandingRent'), value: `₹${outstandingRent.toLocaleString('en-IN')}`, icon: AlertTriangle, color: 'bg-rose-500/10 text-rose-600' },
    { label: t('monthlyExpenses'), value: `₹${monthlyExpenseTotal.toLocaleString('en-IN')}`, icon: Receipt, color: 'bg-red-500/10 text-red-600' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PullRefreshIndicator refreshing={refreshing} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <AlertsList
          overdueCount={overdueCount}
          vacatingCount={vacatingCount}
          expiringDocsCount={0}
          reservedCount={reservedBeds.length}
        />
        <QuickActions />
      </div>
    </div>
  );
}