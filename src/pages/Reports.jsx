import api from '@/api/client';
import { useQuery } from '@tanstack/react-query';

import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

export default function Reports() {
  const { t } = useI18n();

  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: () => api.get('/rooms') });
  const { data: beds = [] } = useQuery({ queryKey: ['beds'], queryFn: () => api.get('/beds') });
  const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: () => api.get('/tenants') });
  const { data: rentDues = [] } = useQuery({ queryKey: ['rentDues'], queryFn: () => api.get('/rent-dues') });
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: () => api.get('/expenses') });
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: () => api.get('/properties') });

  // Occupancy
  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
  const vacantBeds = beds.filter(b => b.status === 'Vacant').length;
  const reservedBeds = beds.filter(b => b.status === 'Reserved').length;
  const occupancyData = [
    { name: t('occupied'), value: occupiedBeds },
    { name: t('vacant'), value: vacantBeds },
    { name: t('reserved'), value: reservedBeds },
  ].filter(d => d.value > 0);

  // Revenue by month (last 6 months)
  const now = new Date();
  const revenueData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const monthDues = rentDues.filter(r => r.month === m && r.year === y);
    const collected = monthDues.reduce((s, r) => s + (r.amount_paid || 0), 0);
    const monthExpenses = expenses.filter(e => {
      if (!e.expense_date) return false;
      const ed = new Date(e.expense_date);
      return ed.getMonth() + 1 === m && ed.getFullYear() === y;
    }).reduce((s, e) => s + (e.amount || 0), 0);
    revenueData.push({
      name: `${m}/${y}`,
      collected,
      expenses: monthExpenses,
    });
  }

  // Expense by category
  const catTotals = {};
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + (e.amount || 0); });
  const expenseCatData = Object.entries(catTotals).map(([name, value]) => ({ name, value }));

  // Outstanding by property
  const outstandingData = properties.map(p => {
    const propTenants = tenants.filter(t => t.property_id === p.id);
    const tenantIds = propTenants.map(t => t.id);
    const outstanding = rentDues.filter(r => tenantIds.includes(r.tenant_id) && r.status !== 'Paid')
      .reduce((s, r) => s + (r.pending_amount || 0), 0);
    return { name: p.name, value: outstanding };
  }).filter(d => d.value > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-heading font-bold">{t('reports')}</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('occupancyReport')}</CardTitle></CardHeader>
          <CardContent>
            {occupancyData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">{t('noData')}</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={occupancyData} cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} dataKey="value">
                    {occupancyData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('revenueReport')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="collected" fill="#6366f1" radius={[4, 4, 0, 0]} name={t('collectedRent')} />
                <Bar dataKey="expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} name={t('expenses')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('expenseReport')}</CardTitle></CardHeader>
          <CardContent>
            {expenseCatData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">{t('noData')}</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expenseCatData} cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ₹${value}`} dataKey="value">
                    {expenseCatData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('outstandingReport')}</CardTitle></CardHeader>
          <CardContent>
            {outstandingData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">{t('noData')}</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={outstandingData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                  <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} name={t('outstandingRent')} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}