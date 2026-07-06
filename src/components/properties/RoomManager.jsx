const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, DoorOpen } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { Link } from 'react-router-dom';

const statusColors = {
  'Vacant': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Partially Occupied': 'bg-amber-100 text-amber-700 border-amber-200',
  'Fully Occupied': 'bg-blue-100 text-blue-700 border-blue-200',
  'Reserved': 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function RoomManager({ propertyId, floors, rooms, beds }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ floor_id: '', room_number: '', capacity: 1, monthly_rent_default: 0, notes: '' });

  const createMut = useMutation({
    mutationFn: (d) => db.entities.Room.create({ ...d, property_id: propertyId, status: 'Vacant' }),
    onMutate: async (d) => {
      setFormOpen(false);
      await qc.cancelQueries({ queryKey: ['rooms'] });
      const previous = qc.getQueryData(['rooms']);
      const optimistic = { ...d, id: `temp-${Date.now()}`, property_id: propertyId, status: 'Vacant' };
      qc.setQueryData(['rooms'], (old = []) => [...old, optimistic]);
      return { previous };
    },
    onError: (_e, _d, ctx) => { if (ctx?.previous) qc.setQueryData(['rooms'], ctx.previous); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, d }) => db.entities.Room.update(id, d),
    onMutate: async ({ id, d }) => {
      setFormOpen(false);
      await qc.cancelQueries({ queryKey: ['rooms'] });
      const previous = qc.getQueryData(['rooms']);
      qc.setQueryData(['rooms'], (old = []) => old.map(r => r.id === id ? { ...r, ...d } : r));
      return { previous };
    },
    onError: (_e, _d, ctx) => { if (ctx?.previous) qc.setQueryData(['rooms'], ctx.previous); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => db.entities.Room.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ floor_id: floors[0]?.id || '', room_number: '', capacity: 1, monthly_rent_default: 0, notes: '' });
    setFormOpen(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    setForm({ floor_id: r.floor_id, room_number: r.room_number, capacity: r.capacity, monthly_rent_default: r.monthly_rent_default || 0, notes: r.notes || '' });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.room_number || !form.floor_id) return;
    if (editing) updateMut.mutate({ id: editing.id, d: form });
    else createMut.mutate(form);
  };

  const getFloorName = (fid) => floors.find(f => f.id === fid)?.name || '';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-heading font-semibold">{t('rooms')}</h3>
        <Button size="sm" onClick={openAdd} disabled={floors.length === 0}>
          <Plus className="w-4 h-4 mr-1" />{t('addRoom')}
        </Button>
      </div>

      {rooms.length === 0 ? <EmptyState icon={DoorOpen} /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map(room => {
            const roomBeds = beds.filter(b => b.room_id === room.id);
            const occupiedBeds = roomBeds.filter(b => b.status === 'Occupied').length;
            return (
              <Link key={room.id} to={`/rooms/${room.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{t('room')} {room.room_number}</p>
                      <p className="text-xs text-muted-foreground">{getFloorName(room.floor_id)}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[room.status] || ''}`}>{room.status}</Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-3">
                    <span>{t('capacity')}: {room.capacity}</span>
                    <span>{t('occupied')}: {occupiedBeds}/{roomBeds.length}</span>
                  </div>
                  {room.monthly_rent_default > 0 && (
                    <p className="text-xs mt-1 text-muted-foreground">₹{room.monthly_rent_default?.toLocaleString('en-IN')}/mo</p>
                  )}
                  <div className="flex gap-1 mt-3 justify-end">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.preventDefault(); openEdit(room); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={e => { e.preventDefault(); deleteMut.mutate(room.id); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? t('edit') + ' ' + t('room') : t('addRoom')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>{t('floor')} *</Label>
              <Select value={form.floor_id} onValueChange={v => setForm({...form, floor_id: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {floors.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t('roomNumber')} *</Label>
              <Input value={form.room_number} onChange={e => setForm({...form, room_number: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>{t('capacity')} *</Label>
                <Input type="number" min={1} value={form.capacity} onChange={e => setForm({...form, capacity: Number(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <Label>{t('monthlyRent')}</Label>
                <Input type="number" min={0} value={form.monthly_rent_default} onChange={e => setForm({...form, monthly_rent_default: Number(e.target.value)})} />
              </div>
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