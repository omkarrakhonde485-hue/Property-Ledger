import api from '@/api/client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard, Search } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullRefreshIndicator from '@/components/shared/PullRefreshIndicator';
import { format } from 'date-fns';

export default function Payments() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    tenant_id: '', payment_date: new Date().toISOString().split('T')[0],
    amount: 0, payment_method: 'Cash', reference_number: '', remarks: '', rent_month: ''
  });

  const refreshing = usePullToRefresh(() => qc.invalidateQueries());

  const { data: payments = [] } = useQuery({ queryKey: ['payments'], queryFn: () => api.get('/payments?sort=-created_at') });
  const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: () => api.get('/tenants') });

  const activeTenants = tenants.filter(t => t.status === 'Active' || t.status === 'Notice Given');

  const createMut = useMutation({
    mutationFn: async (data) => {
      const tenant = tenants.find(t => t.id === Number(data.tenant_id));
      const payload = {
        ...data,
        tenant_id: Number(data.tenant_id),
        amount: Number(data.amount),
        property_id: tenant?.property_id ? Number(tenant.property_id) : null
      };
      const payment = await api.post('/payments', payload);
      if (data.rent_month) {
        const [y, m] = data.rent_month.split('-').map(Number);
        const existing = await api.get(`/rent-dues?tenant_id=${payload.tenant_id}&month=${m}&year=${y}`);
        if (existing.length > 0) {
          const due = existing[0];
          const newPaid = (due.amount_paid || 0) + payload.amount;
          const pending = Math.max(0, (due.rent_amount || 0) - newPaid);
          const status = pending <= 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Unpaid';
          await api.put('/rent-dues/' + due.id, { amount_paid: newPaid, pending_amount: pending, status });
        } else {
          const rentAmt = tenant?.monthly_rent || 0;
          const pending = Math.max(0, rentAmt - payload.amount);
          await api.post('/rent-dues', {
            tenant_id: payload.tenant_id, property_id: tenant?.property_id ? Number(tenant.property_id) : null,
            month: m, year: y, rent_amount: rentAmt, amount_paid: payload.amount,
            pending_amount: pending, status: pending <= 0 ? 'Paid' : 'Partially Paid'
          });
        }
      }
      return payment;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); qc.invalidateQueries({ queryKey: ['rentDues'] }); setFormOpen(false); },
  });

  const handleSave = () => {
    if (!form.tenant_id || !form.amount) return;
    createMut.mutate(form);
  };

  const getTenantName = (tid) => tenants.find(t => t.id === tid)?.full_name || '';

  const filtered = payments.filter(p => {
    if (!searchTerm) return true;
    const name = getTenantName(p.tenant_id).toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || p.reference_number?.includes(searchTerm);
  });

  // Auto open
  useState(() => {
    if (new URLSearchParams(window.location.search).get('action') === 'add') setFormOpen(true);
  });

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PullRefreshIndicator refreshing={refreshing} />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">{t('payments')}</h2>
        <Button onClick={() => { setForm({ ...form, tenant_id: '', amount: 0, rent_month: currentMonthStr }); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />{t('recordPayment')}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder={`${t('search')}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {filtered.length === 0 ? <EmptyState icon={CreditCard} /> : (
        <div className="space-y-2">
          {filtered.map(pay => (
            <Card key={pay.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{getTenantName(pay.tenant_id)}</p>
                  <p className="text-xs text-muted-foreground">
                    {pay.payment_date ? format(new Date(pay.payment_date), 'dd MMM yyyy') : ''} • {pay.payment_method}
                    {pay.rent_month && ` • ${t('month')}: ${pay.rent_month}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{(pay.amount || 0).toLocaleString('en-IN')}</p>
                  {pay.reference_number && <p className="text-xs text-muted-foreground">Ref: {pay.reference_number}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-heading">{t('recordPayment')}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>{t('tenant')} *</Label>
              <Select value={form.tenant_id} onValueChange={v => setForm({...form, tenant_id: v})}>
                <SelectTrigger><SelectValue placeholder={t('tenant')} /></SelectTrigger>
                <SelectContent>{activeTenants.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name} (₹{t.monthly_rent})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>{t('amount')} *</Label><Input type="number" min={0} value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} /></div>
              <div className="grid gap-2"><Label>{t('paymentDate')}</Label><Input type="date" value={form.payment_date} onChange={e => setForm({...form, payment_date: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>{t('paymentMethod')}</Label>
                <Select value={form.payment_method} onValueChange={v => setForm({...form, payment_method: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('month')}</Label>
                <Input type="month" value={form.rent_month} onChange={e => setForm({...form, rent_month: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2"><Label>{t('referenceNumber')}</Label><Input value={form.reference_number} onChange={e => setForm({...form, reference_number: e.target.value})} /></div>
            <div className="grid gap-2"><Label>{t('remarks')}</Label><Input value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleSave}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}