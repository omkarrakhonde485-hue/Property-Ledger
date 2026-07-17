import api from '@/api/client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Tenants page — manages tenant list, search, and creation

import { useI18n } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Search, Phone } from 'lucide-react';
import TenantForm from '@/components/tenants/TenantForm';
import EmptyState from '@/components/shared/EmptyState';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullRefreshIndicator from '@/components/shared/PullRefreshIndicator';

const statusColors = {
  'Active': 'bg-emerald-100 text-emerald-700',
  'Notice Given': 'bg-amber-100 text-amber-700',
  'Vacated': 'bg-slate-100 text-slate-500',
};

export default function Tenants() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const refreshing = usePullToRefresh(() => qc.invalidateQueries());

  const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: () => api.get('/tenants?sort=-created_at') });
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: () => api.get('/properties') });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: () => api.get('/rooms') });

  const createMut = useMutation({
    mutationFn: async (data) => {
      const tenant = await api.post('/tenants', { ...data, status: 'Active' });
      if (data.bed_id) await api.put('/beds/' + data.bed_id, { status: 'Occupied' });
      if (data.security_deposit > 0) {
        await api.post('/deposits', {
          tenant_id: tenant.id, deposit_amount: Number(data.security_deposit),
          received_date: data.joining_date || new Date().toISOString().split('T')[0], status: 'Held'
        });
      }
      return tenant;
    },
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['tenants'] });
      const previous = qc.getQueryData(['tenants']);
      const optimistic = { ...data, id: `temp-${Date.now()}`, status: 'Active', created_date: new Date().toISOString() };
      qc.setQueryData(['tenants'], (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onError: (_e, _d, ctx) => { if (ctx?.previous) qc.setQueryData(['tenants'], ctx.previous); },
    onSettled: () => { qc.invalidateQueries({ queryKey: ['tenants'] }); qc.invalidateQueries({ queryKey: ['beds'] }); },
  });

  const handleSave = (formData) => createMut.mutate(formData);

  const filtered = tenants.filter(t => {
    const matchesSearch = !searchTerm || t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || t.mobile_number?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPropName = (pid) => properties.find(p => p.id === pid)?.name || '';
  const getRoomNum = (rid) => rooms.find(r => r.id === rid)?.room_number || '';

  // Auto open form if action=add in URL
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'add') setFormOpen(true);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PullRefreshIndicator refreshing={refreshing} />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">{t('tenants')}</h2>
        <Button onClick={() => setFormOpen(true)}><Plus className="w-4 h-4 mr-2" />{t('addTenant')}</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder={`${t('search')}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all')}</SelectItem>
            <SelectItem value="Active">{t('active')}</SelectItem>
            <SelectItem value="Notice Given">{t('noticeGiven')}</SelectItem>
            <SelectItem value="Vacated">{t('vacated')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? <EmptyState icon={Users} /> : (
        <div className="space-y-2">
          {filtered.map(tenant => (
            <Link key={tenant.id} to={`/tenants/${tenant.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                      {tenant.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{tenant.full_name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{tenant.mobile_number}</span>
                        <span>{getPropName(tenant.property_id)}</span>
                        <span>{t('room')} {getRoomNum(tenant.room_id)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-sm">₹{(tenant.monthly_rent || 0).toLocaleString('en-IN')}</p>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[tenant.status] || ''}`}>{tenant.status}</Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <TenantForm open={formOpen} onOpenChange={setFormOpen} onSave={handleSave} />
    </div>
  );
}