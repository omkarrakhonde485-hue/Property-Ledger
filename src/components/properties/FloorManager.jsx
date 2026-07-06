const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

export default function FloorManager({ propertyId, floors, rooms }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', floor_number: 0, notes: '' });

  const createMut = useMutation({
    mutationFn: (d) => db.entities.Floor.create({ ...d, property_id: propertyId }),
    onMutate: async (d) => {
      setFormOpen(false);
      await qc.cancelQueries({ queryKey: ['floors'] });
      const previous = qc.getQueryData(['floors']);
      const optimistic = { ...d, id: `temp-${Date.now()}`, property_id: propertyId };
      qc.setQueryData(['floors'], (old = []) => [...old, optimistic]);
      return { previous };
    },
    onError: (_e, _d, ctx) => { if (ctx?.previous) qc.setQueryData(['floors'], ctx.previous); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['floors'] }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, d }) => db.entities.Floor.update(id, d),
    onMutate: async ({ id, d }) => {
      setFormOpen(false);
      await qc.cancelQueries({ queryKey: ['floors'] });
      const previous = qc.getQueryData(['floors']);
      qc.setQueryData(['floors'], (old = []) => old.map(f => f.id === id ? { ...f, ...d } : f));
      return { previous };
    },
    onError: (_e, _d, ctx) => { if (ctx?.previous) qc.setQueryData(['floors'], ctx.previous); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['floors'] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => db.entities.Floor.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['floors'] }),
  });

  const openAdd = () => { setEditing(null); setForm({ name: '', floor_number: floors.length, notes: '' }); setFormOpen(true); };
  const openEdit = (f) => { setEditing(f); setForm({ name: f.name, floor_number: f.floor_number || 0, notes: f.notes || '' }); setFormOpen(true); };

  const handleSave = () => {
    if (!form.name) return;
    if (editing) updateMut.mutate({ id: editing.id, d: form });
    else createMut.mutate(form);
  };

  const sorted = [...floors].sort((a, b) => (a.floor_number || 0) - (b.floor_number || 0));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-heading font-semibold">{t('floors')}</h3>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />{t('addFloor')}</Button>
      </div>

      {sorted.length === 0 ? <EmptyState icon={Layers} /> : (
        <div className="space-y-2">
          {sorted.map(floor => {
            const floorRooms = rooms.filter(r => r.floor_id === floor.id);
            return (
              <Card key={floor.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{floor.name}</p>
                  <p className="text-xs text-muted-foreground">{floorRooms.length} {t('rooms')}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(floor)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMut.mutate(floor.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? t('edit') + ' ' + t('floor') : t('addFloor')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>{t('floorName')} *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Ground Floor" />
            </div>
            <div className="grid gap-2">
              <Label>{t('floorNumber')}</Label>
              <Input type="number" value={form.floor_number} onChange={e => setForm({...form, floor_number: Number(e.target.value)})} />
            </div>
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