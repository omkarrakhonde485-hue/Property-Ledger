const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useI18n } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, Pencil, Trash2, MapPin, DoorOpen, BedDouble, Users } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PropertyForm from '@/components/properties/PropertyForm';
import EmptyState from '@/components/shared/EmptyState';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullRefreshIndicator from '@/components/shared/PullRefreshIndicator';

export default function Properties() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProp, setEditingProp] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const refreshing = usePullToRefresh(() => qc.invalidateQueries());

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => db.entities.Property.list('-created_date'),
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
    queryFn: () => db.entities.Tenant.filter({ status: 'Active' }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Property.create(data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['properties'] });
      const previous = qc.getQueryData(['properties']);
      const optimistic = { ...data, id: `temp-${Date.now()}`, created_date: new Date().toISOString() };
      qc.setQueryData(['properties'], (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onError: (_e, _d, ctx) => { if (ctx?.previous) qc.setQueryData(['properties'], ctx.previous); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Property.update(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['properties'] });
      const previous = qc.getQueryData(['properties']);
      qc.setQueryData(['properties'], (old = []) => old.map(p => p.id === id ? { ...p, ...data } : p));
      return { previous };
    },
    onError: (_e, _d, ctx) => { if (ctx?.previous) qc.setQueryData(['properties'], ctx.previous); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Property.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  });

  const handleSave = (formData) => {
    if (editingProp) {
      updateMutation.mutate({ id: editingProp.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
    setEditingProp(null);
  };

  const handleDelete = () => {
    const activeTenantsInProp = tenants.filter(t => t.property_id === deleteId);
    if (activeTenantsInProp.length > 0) {
      alert('Cannot delete property with active tenants');
      setDeleteId(null);
      return;
    }
    deleteMutation.mutate(deleteId);
    setDeleteId(null);
  };

  const getPropertyStats = (propId) => {
    const propRooms = rooms.filter(r => r.property_id === propId);
    const roomIds = propRooms.map(r => r.id);
    const propBeds = beds.filter(b => roomIds.includes(b.room_id));
    const propTenants = tenants.filter(t => t.property_id === propId);
    const occupiedBeds = propBeds.filter(b => b.status === 'Occupied').length;
    const totalBeds = propBeds.length;
    return { rooms: propRooms.length, beds: totalBeds, tenants: propTenants.length, occupancy: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0 };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PullRefreshIndicator refreshing={refreshing} />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">{t('properties')}</h2>
        <Button onClick={() => { setEditingProp(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> {t('addProperty')}
        </Button>
      </div>

      {properties.length === 0 ? (
        <EmptyState icon={Building2} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map(prop => {
            const stats = getPropertyStats(prop.id);
            return (
              <Link key={prop.id} to={`/properties/${prop.id}`}>
                <Card className="p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">{prop.name}</h3>
                      {prop.address && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />{prop.address}{prop.city ? `, ${prop.city}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.preventDefault(); setEditingProp(prop); setFormOpen(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={e => { e.preventDefault(); setDeleteId(prop.id); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[
                      { icon: DoorOpen, label: t('rooms'), val: stats.rooms },
                      { icon: BedDouble, label: t('beds'), val: stats.beds },
                      { icon: Users, label: t('tenants'), val: stats.tenants },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <p className="text-lg font-bold">{s.val}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
                      </div>
                    ))}
                    <div className="text-center">
                      <p className="text-lg font-bold">{stats.occupancy}%</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('occupancy')}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <PropertyForm
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditingProp(null); }}
        onSave={handleSave}
        initialData={editingProp}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmDelete')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}