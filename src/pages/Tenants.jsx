import api from '@/api/client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Users, Search, Phone, Building2, DoorOpen, IndianRupee, 
  Calendar, ShieldCheck, ArrowUpRight, UserCheck, Clock, Shield
} from 'lucide-react';
import TenantForm from '@/components/tenants/TenantForm';
import EmptyState from '@/components/shared/EmptyState';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullRefreshIndicator from '@/components/shared/PullRefreshIndicator';

const statusBadgeStyles = {
  'Active': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  'Notice Given': 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  'Vacated': 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30',
};

export default function Tenants() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
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
          tenant_id: tenant.id, 
          deposit_amount: Number(data.security_deposit),
          received_date: data.joining_date || new Date().toISOString().split('T')[0], 
          status: 'Held'
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
    const matchesSearch = !searchTerm || 
      t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.mobile_number?.includes(searchTerm) ||
      t.aadhaar_number?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesProp = propertyFilter === 'all' || t.property_id === Number(propertyFilter);
    return matchesSearch && matchesStatus && matchesProp;
  });

  const getPropName = (pid) => properties.find(p => p.id === pid)?.name || 'Unassigned';
  const getRoomNum = (rid) => rooms.find(r => r.id === rid)?.room_number || 'N/A';

  // Metrics calculation
  const totalTenants = tenants.length;
  const activeCount = tenants.filter(t => t.status === 'Active').length;
  const noticeCount = tenants.filter(t => t.status === 'Notice Given').length;
  const totalMonthlyRevenue = tenants.filter(t => t.status === 'Active').reduce((sum, t) => sum + (t.monthly_rent || 0), 0);

  // Auto open form if action=add in URL
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'add') setFormOpen(true);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <PullRefreshIndicator refreshing={refreshing} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold tracking-tight">{t('tenants')}</h2>
          <p className="text-sm text-muted-foreground">Manage active occupants, leases, deposits, and contact details</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="bg-primary hover:bg-primary/90 shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          {t('addTenant')}
        </Button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        <Card className="bg-card/70 border border-border/80 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Tenants</p>
              <p className="text-xl font-extrabold text-foreground">{totalTenants}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border border-border/80 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Occupants</p>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{activeCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border border-border/80 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Notice Period</p>
              <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{noticeCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border border-border/80 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Monthly Contract Value</p>
              <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                ₹{totalMonthlyRevenue.toLocaleString('en-IN')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 h-11 bg-card border-border/80" 
            placeholder="Search by name, mobile, or Aadhaar..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-full sm:w-48 h-11 bg-card border-border/80">
            <SelectValue placeholder="All Properties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 h-11 bg-card border-border/80">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Notice Given">Notice Given</SelectItem>
            <SelectItem value="Vacated">Vacated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tenant Grid / Cards */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No tenants found" description="Try adjusting your filters or add a new tenant." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(tenant => {
            const badgeClass = statusBadgeStyles[tenant.status] || statusBadgeStyles['Vacated'];
            const propName = getPropName(tenant.property_id);
            const roomNum = getRoomNum(tenant.room_id);

            return (
              <Link key={tenant.id} to={`/tenants/${tenant.id}`} className="group block">
                <Card className="h-full border border-border/80 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all duration-200 overflow-hidden bg-card">
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                    {/* Header: Avatar + Name + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                          {tenant.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-foreground tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {tenant.full_name}
                          </h3>
                          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-muted-foreground/80" />
                            {tenant.mobile_number || 'No contact'}
                          </p>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${badgeClass}`}>
                        {tenant.status}
                      </Badge>
                    </div>

                    {/* Middle Info Pills */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-2.5 px-3.5 rounded-xl bg-muted/40 border border-border/60">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-muted-foreground block font-semibold uppercase tracking-wider">Contact Number</span>
                        <span className="font-bold text-foreground truncate block flex items-center gap-1">
                          <Phone className="w-3 h-3 text-indigo-500 shrink-0" />
                          {tenant.mobile_number || 'N/A'}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-muted-foreground block font-semibold uppercase tracking-wider">Aadhaar ID</span>
                        <span className="font-bold text-foreground truncate block flex items-center gap-1">
                          <Shield className="w-3 h-3 text-indigo-500 shrink-0" />
                          {tenant.aadhaar_number || 'Pending'}
                        </span>
                      </div>

                      <div className="space-y-0.5 pt-1 border-t border-border/40 col-span-2 flex justify-between items-center">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-indigo-500 shrink-0" />
                          {propName} (R-{roomNum})
                        </span>
                        <span className="text-[10px] font-bold text-foreground">
                          Dep: ₹{(tenant.security_deposit || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Rent Banner */}
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Monthly Rent</span>
                        <span className="text-lg font-extrabold text-foreground tracking-tight">
                          ₹{(tenant.monthly_rent || 0).toLocaleString('en-IN')}
                          <span className="text-xs font-normal text-muted-foreground">/mo</span>
                        </span>
                      </div>
                      
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Details
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <TenantForm open={formOpen} onOpenChange={setFormOpen} onSave={handleSave} />
    </div>
  );
}