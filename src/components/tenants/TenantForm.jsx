import api from '@/api/client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TenantForm({ open, onOpenChange, onSave, initialData }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    property_id: '', room_id: '', bed_id: '', full_name: '', mobile_number: '',
    alternate_mobile: '', aadhaar_number: '', occupation: '', company_name: '',
    emergency_contact_name: '', emergency_contact_number: '', family_member_count: 0,
    joining_date: new Date().toISOString().split('T')[0], monthly_rent: 0,
    security_deposit: 0, notes: '',
  });

  useEffect(() => {
    if (initialData) setForm({ ...form, ...initialData });
    else setForm({
      property_id: '', room_id: '', bed_id: '', full_name: '', mobile_number: '',
      alternate_mobile: '', aadhaar_number: '', occupation: '', company_name: '',
      emergency_contact_name: '', emergency_contact_number: '', family_member_count: 0,
      joining_date: new Date().toISOString().split('T')[0], monthly_rent: 0,
      security_deposit: 0, notes: '',
    });
  }, [initialData, open]);

  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: () => api.get('/properties') });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: () => api.get('/rooms') });
  const { data: beds = [] } = useQuery({ queryKey: ['beds'], queryFn: () => api.get('/beds') });

  const filteredRooms = form.property_id ? rooms.filter(r => String(r.property_id) === String(form.property_id)) : [];
  const filteredBeds = form.room_id ? beds.filter(b => String(b.room_id) === String(form.room_id) && (b.status === 'Vacant' || String(b.id) === String(initialData?.bed_id))) : [];

  const handleSave = () => {
    if (!form.full_name || !form.mobile_number || !form.property_id || !form.room_id) return;
    const finalForm = {
      ...form,
      property_id: Number(form.property_id),
      room_id: Number(form.room_id),
      bed_id: form.bed_id ? Number(form.bed_id) : null,
      family_member_count: Number(form.family_member_count || 0),
      monthly_rent: Number(form.monthly_rent || 0),
      security_deposit: Number(form.security_deposit || 0),
    };
    onSave(finalForm);
    onOpenChange(false);
  };

  const up = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-heading">{initialData ? t('edit') + ' ' + t('tenant') : t('addTenant')}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>{t('property')} *</Label>
                <Select value={form.property_id} onValueChange={v => { up('property_id', v); up('room_id', ''); up('bed_id', ''); }}>
                  <SelectTrigger><SelectValue placeholder={t('property')} /></SelectTrigger>
                  <SelectContent>{properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('room')} *</Label>
                <Select value={form.room_id} onValueChange={v => { up('room_id', v); up('bed_id', ''); }}>
                  <SelectTrigger><SelectValue placeholder={t('room')} /></SelectTrigger>
                  <SelectContent>{filteredRooms.map(r => <SelectItem key={r.id} value={r.id}>{t('room')} {r.room_number}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {filteredBeds.length > 0 && (
              <div className="grid gap-2">
                <Label>{t('bed')}</Label>
                <Select value={form.bed_id} onValueChange={v => up('bed_id', v)}>
                  <SelectTrigger><SelectValue placeholder={t('bed')} /></SelectTrigger>
                  <SelectContent>{filteredBeds.map(b => <SelectItem key={b.id} value={b.id}>{t('bed')} {b.bed_number}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">{t('personalInfo')}</p>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>{t('fullName')} *</Label><Input value={form.full_name} onChange={e => up('full_name', e.target.value)} /></div>
                  <div className="grid gap-2"><Label>{t('mobileNumber')} *</Label><Input value={form.mobile_number} onChange={e => up('mobile_number', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>{t('alternateMobile')}</Label><Input value={form.alternate_mobile} onChange={e => up('alternate_mobile', e.target.value)} /></div>
                  <div className="grid gap-2"><Label>{t('aadhaarNumber')}</Label><Input value={form.aadhaar_number} onChange={e => up('aadhaar_number', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>{t('occupation')}</Label><Input value={form.occupation} onChange={e => up('occupation', e.target.value)} /></div>
                  <div className="grid gap-2"><Label>{t('companyName')}</Label><Input value={form.company_name} onChange={e => up('company_name', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>{t('emergencyContactName')}</Label><Input value={form.emergency_contact_name} onChange={e => up('emergency_contact_name', e.target.value)} /></div>
                  <div className="grid gap-2"><Label>{t('emergencyContactNumber')}</Label><Input value={form.emergency_contact_number} onChange={e => up('emergency_contact_number', e.target.value)} /></div>
                </div>
                <div className="grid gap-2"><Label>{t('familyMemberCount')}</Label><Input type="number" min={0} value={form.family_member_count} onChange={e => up('family_member_count', Number(e.target.value))} /></div>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">{t('rentInfo')}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2"><Label>{t('joiningDate')}</Label><Input type="date" value={form.joining_date} onChange={e => up('joining_date', e.target.value)} /></div>
                <div className="grid gap-2"><Label>{t('monthlyRent')}</Label><Input type="number" min={0} value={form.monthly_rent} onChange={e => up('monthly_rent', Number(e.target.value))} /></div>
                <div className="grid gap-2"><Label>{t('securityDeposit')}</Label><Input type="number" min={0} value={form.security_deposit} onChange={e => up('security_deposit', Number(e.target.value))} /></div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('notes')}</Label>
              <Textarea value={form.notes} onChange={e => up('notes', e.target.value)} rows={2} />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={handleSave}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}