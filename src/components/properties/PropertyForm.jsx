import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useI18n } from '@/lib/i18n';

export default function PropertyForm({ open, onOpenChange, onSave, initialData }) {
  const { t } = useI18n();
  const [form, setForm] = useState(initialData || {
    name: '', address: '', city: '', state: '', pincode: '', description: ''
  });

  const handleSave = () => {
    if (!form.name) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {initialData ? t('edit') + ' ' + t('property') : t('addProperty')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>{t('propertyName')} *</Label>
            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="grid gap-2">
            <Label>{t('address')}</Label>
            <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>{t('city')}</Label>
              <Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>{t('state')}</Label>
              <Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>{t('pincode')}</Label>
              <Input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t('description')}</Label>
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={handleSave}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}