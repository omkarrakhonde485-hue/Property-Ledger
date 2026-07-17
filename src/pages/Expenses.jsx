import api from '@/api/client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useI18n } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { format } from 'date-fns';

const categories = ['Electricity', 'Water', 'Internet', 'Maintenance', 'Repairs', 'Cleaning', 'Security', 'Miscellaneous'];

const catColors = {
  Electricity: 'bg-amber-100 text-amber-700',
  Water: 'bg-blue-100 text-blue-700',
  Internet: 'bg-violet-100 text-violet-700',
  Maintenance: 'bg-orange-100 text-orange-700',
  Repairs: 'bg-red-100 text-red-700',
  Cleaning: 'bg-emerald-100 text-emerald-700',
  Security: 'bg-slate-100 text-slate-600',
  Miscellaneous: 'bg-gray-100 text-gray-600',
};

export default function Expenses() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ property_id: '', category: 'Maintenance', amount: 0, expense_date: new Date().toISOString().split('T')[0], description: '' });

  const { data: expenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: () => api.get('/expenses?sort=-created_at') });
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: () => api.get('/properties') });

  const createMut = useMutation({
    mutationFn: (d) => api.post('/expenses', { ...d, property_id: Number(d.property_id), amount: Number(d.amount) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setFormOpen(false); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => api.del('/expenses/' + id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const handleSave = () => {
    if (!form.property_id || !form.amount) return;
    createMut.mutate(form);
  };

  const getPropName = (pid) => properties.find(p => p.id === pid)?.name || '';

  useState(() => {
    if (new URLSearchParams(window.location.search).get('action') === 'add') setFormOpen(true);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">{t('expenses')}</h2>
        <Button onClick={() => { setForm({ ...form, property_id: properties[0]?.id || '' }); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />{t('addExpense')}
        </Button>
      </div>

      {expenses.length === 0 ? <EmptyState icon={Receipt} /> : (
        <div className="space-y-2">
          {expenses.map(exp => (
            <Card key={exp.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`text-[10px] ${catColors[exp.category] || ''}`}>{exp.category}</Badge>
                  <div>
                    <p className="font-medium">{exp.description || exp.category}</p>
                    <p className="text-xs text-muted-foreground">{getPropName(exp.property_id)} • {exp.expense_date ? format(new Date(exp.expense_date), 'dd MMM yyyy') : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold">₹{(exp.amount || 0).toLocaleString('en-IN')}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMut.mutate(exp.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-heading">{t('addExpense')}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>{t('property')} *</Label>
              <Select value={form.property_id} onValueChange={v => setForm({...form, property_id: v})}>
                <SelectTrigger><SelectValue placeholder={t('property')} /></SelectTrigger>
                <SelectContent>{properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>{t('category')} *</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('amount')} *</Label>
                <Input type="number" min={0} value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('expenseDate')}</Label>
              <Input type="date" value={form.expense_date} onChange={e => setForm({...form, expense_date: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>{t('description')}</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
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