import api from '@/api/client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useI18n } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, BedDouble, User, Pencil, Trash2 } from 'lucide-react';

const bedStatusColors = {
  'Vacant': 'bg-emerald-100 text-emerald-700',
  'Occupied': 'bg-blue-100 text-blue-700',
  'Reserved': 'bg-purple-100 text-purple-700',
};

export default function RoomDetails() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const roomId = window.location.pathname.split('/').pop();
  const [bedFormOpen, setBedFormOpen] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [bedForm, setBedForm] = useState({ bed_number: '', reserved_for: '', reserved_join_date: '' });

  const { data: room } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => api.get('/rooms/' + roomId),
    enabled: !!roomId,
  });

  const { data: beds = [] } = useQuery({
    queryKey: ['beds', roomId],
    queryFn: () => api.get('/beds?room_id=' + roomId),
    enabled: !!roomId,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants'),
  });

  const createBed = useMutation({
    mutationFn: (d) => api.post('/beds', { ...d, room_id: Number(roomId), status: 'Vacant' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['beds'] }); setBedFormOpen(false); },
  });
  const updateBed = useMutation({
    mutationFn: ({ id, d }) => api.put('/beds/' + id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['beds'] }); setBedFormOpen(false); },
  });
  const deleteBed = useMutation({
    mutationFn: (id) => api.del('/beds/' + id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['beds'] }),
  });

  const openAddBed = () => { setEditingBed(null); setBedForm({ bed_number: `${beds.length + 1}`, reserved_for: '', reserved_join_date: '' }); setBedFormOpen(true); };
  const openEditBed = (b) => { setEditingBed(b); setBedForm({ bed_number: b.bed_number, reserved_for: b.reserved_for || '', reserved_join_date: b.reserved_join_date || '' }); setBedFormOpen(true); };

  const handleSaveBed = () => {
    if (!bedForm.bed_number) return;
    if (editingBed) updateBed.mutate({ id: editingBed.id, d: bedForm });
    else createBed.mutate(bedForm);
  };

  if (!room) return <div className="flex justify-center py-20 text-muted-foreground">{t('loading')}</div>;

  const canAddBed = beds.length < (room.capacity || 1);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to={`/properties/${room.property_id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-heading font-bold">{t('room')} {room.room_number}</h2>
          <p className="text-sm text-muted-foreground">{t('capacity')}: {room.capacity} | {t('monthlyRent')}: ₹{(room.monthly_rent_default || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-heading font-semibold">{t('beds')} ({beds.length}/{room.capacity})</h3>
        <Button size="sm" onClick={openAddBed} disabled={!canAddBed}>
          <Plus className="w-4 h-4 mr-1" />{t('addBed')}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {beds.map(bed => {
          const occupant = tenants.find(t => t.bed_id === bed.id && t.status === 'Active');
          return (
            <Card key={bed.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <BedDouble className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{t('bed')} {bed.bed_number}</p>
                    <Badge variant="outline" className={`text-[10px] mt-1 ${bedStatusColors[bed.status] || ''}`}>{bed.status}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditBed(bed)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteBed.mutate(bed.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {occupant && (
                <Link to={`/tenants/${occupant.id}`} className="flex items-center gap-2 mt-3 p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{occupant.full_name}</p>
                    <p className="text-xs text-muted-foreground">{occupant.mobile_number}</p>
                  </div>
                </Link>
              )}
              {bed.status === 'Reserved' && bed.reserved_for && (
                <p className="text-xs text-muted-foreground mt-2">{t('reservedFor')}: {bed.reserved_for}</p>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={bedFormOpen} onOpenChange={setBedFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBed ? t('edit') + ' ' + t('bed') : t('addBed')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>{t('bedNumber')} *</Label>
              <Input value={bedForm.bed_number} onChange={e => setBedForm({...bedForm, bed_number: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>{t('reservedFor')}</Label>
              <Input value={bedForm.reserved_for} onChange={e => setBedForm({...bedForm, reserved_for: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBedFormOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleSaveBed}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}