const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useI18n } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Phone, Briefcase, Shield, Calendar, IndianRupee, Bell, Upload, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function TenantDetails() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const tenantId = window.location.pathname.split('/').pop();
  const fileInputRef = useRef(null);

  const [docName, setDocName] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: tenant } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => { const all = await db.entities.Tenant.list(); return all.find(t => t.id === tenantId); },
    enabled: !!tenantId,
  });
  const { data: payments = [] } = useQuery({
    queryKey: ['payments', tenantId],
    queryFn: () => db.entities.Payment.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });
  const { data: deposits = [] } = useQuery({
    queryKey: ['deposits', tenantId],
    queryFn: () => db.entities.Deposit.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });
  const { data: rentDues = [] } = useQuery({
    queryKey: ['rentDues', tenantId],
    queryFn: () => db.entities.RentDue.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });
  const { data: documents = [] } = useQuery({
    queryKey: ['tenantDocs', tenantId],
    queryFn: () => db.entities.TenantDocument.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: () => db.entities.Property.list() });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: () => db.entities.Room.list() });

  const markNoticeMut = useMutation({
    mutationFn: () => db.entities.Tenant.update(tenantId, { status: 'Notice Given' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant', tenantId] }),
  });
  const markVacatedMut = useMutation({
    mutationFn: async () => {
      await db.entities.Tenant.update(tenantId, { status: 'Vacated', vacating_date: new Date().toISOString().split('T')[0] });
      if (tenant?.bed_id) await db.entities.Bed.update(tenant.bed_id, { status: 'Vacant' });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenant', tenantId] }); qc.invalidateQueries({ queryKey: ['beds'] }); },
  });
  const deleteDocMut = useMutation({
    mutationFn: (id) => db.entities.TenantDocument.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenantDocs', tenantId] }),
  });

  if (!tenant) return <div className="flex justify-center py-20 text-muted-foreground">{t('loading')}</div>;

  const propName = properties.find(p => p.id === tenant.property_id)?.name || '';
  const roomNum = rooms.find(r => r.id === tenant.room_id)?.room_number || '';
  const statusColors = { 'Active': 'bg-emerald-100 text-emerald-700', 'Notice Given': 'bg-amber-100 text-amber-700', 'Vacated': 'bg-slate-100 text-slate-500' };

  const sendWhatsApp = () => {
    const msg = encodeURIComponent(`Hi ${tenant.full_name}, this is a rent reminder. Your monthly rent of ₹${tenant.monthly_rent} is due. Please pay at the earliest.`);
    window.open(`https://wa.me/${tenant.mobile_number?.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocFile(file);
    setDocPreview(URL.createObjectURL(file));
  };

  const handleUploadDoc = async () => {
    if (!docName.trim() || !docFile) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file: docFile });
    await db.entities.TenantDocument.create({ tenant_id: tenantId, document_name: docName.trim(), document_url: file_url });
    qc.invalidateQueries({ queryKey: ['tenantDocs', tenantId] });
    setDocName('');
    setDocFile(null);
    setDocPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full">
      {/* Top: back + name/badge (never scrolls) */}
      <div className="flex items-start gap-3 pb-1">
        <Link to="/tenants"><Button variant="ghost" size="icon" className="mt-1"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl lg:text-2xl font-heading font-bold truncate">{tenant.full_name}</h2>
            <Badge variant="outline" className={`${statusColors[tenant.status]} shrink-0`}>{tenant.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{propName} • {t('room')} {roomNum}</p>
        </div>
      </div>

      {/* Action buttons row — scrollable horizontally on mobile, static on desktop */}
      <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide shrink-0">
        {tenant.status === 'Active' && (
          <>
            <Button size="sm" variant="outline" className="shrink-0" onClick={sendWhatsApp}><Bell className="w-4 h-4 mr-1" />{t('sendReminder')}</Button>
            <Button size="sm" variant="outline" className="shrink-0 text-amber-600" onClick={() => markNoticeMut.mutate()}>{t('markNoticeGiven')}</Button>
          </>
        )}
        {tenant.status === 'Notice Given' && (
          <Button size="sm" variant="outline" className="shrink-0 text-destructive" onClick={() => markVacatedMut.mutate()}>{t('markVacated')}</Button>
        )}
      </div>

      {/* Tabs (never scrolls as a unit — content inside scrolls with page) */}
      <Tabs defaultValue="personal" className="space-y-4 flex-1">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="personal">{t('personalInfo')}</TabsTrigger>
          <TabsTrigger value="rent">{t('rentInfo')}</TabsTrigger>
          <TabsTrigger value="deposits">{t('depositInfo')}</TabsTrigger>
          <TabsTrigger value="payments">{t('paymentHistory')}</TabsTrigger>
          <TabsTrigger value="documents">{t('documents')}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardContent className="p-6 grid md:grid-cols-2 gap-4">
              {[
                { icon: Phone, label: t('mobileNumber'), value: tenant.mobile_number },
                { icon: Phone, label: t('alternateMobile'), value: tenant.alternate_mobile },
                { icon: Shield, label: t('aadhaarNumber'), value: tenant.aadhaar_number },
                { icon: Briefcase, label: t('occupation'), value: tenant.occupation },
                { icon: Briefcase, label: t('companyName'), value: tenant.company_name },
                { icon: Phone, label: t('emergencyContactName'), value: tenant.emergency_contact_name },
                { icon: Phone, label: t('emergencyContactNumber'), value: tenant.emergency_contact_number },
                { icon: Calendar, label: t('joiningDate'), value: tenant.joining_date ? format(new Date(tenant.joining_date), 'dd MMM yyyy') : '' },
                { icon: Calendar, label: t('vacatingDate'), value: tenant.vacating_date ? format(new Date(tenant.vacating_date), 'dd MMM yyyy') : '' },
              ].filter(f => f.value).map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value}</p></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rent">
          <Card>
            <CardHeader><CardTitle>{t('pendingDues')}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <IndianRupee className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">₹{(tenant.monthly_rent || 0).toLocaleString('en-IN')}</span>
                <span className="text-muted-foreground text-sm">/ {t('monthly')}</span>
              </div>
              {rentDues.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noData')}</p>
              ) : (
                <div className="space-y-2">
                  {rentDues.sort((a, b) => b.year - a.year || b.month - a.month).map(due => (
                    <div key={due.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{due.month}/{due.year}</p>
                        <p className="text-xs text-muted-foreground">₹{(due.amount_paid || 0).toLocaleString('en-IN')} / ₹{(due.rent_amount || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${due.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : due.status === 'Partially Paid' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{due.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardHeader><CardTitle>{t('depositInfo')}</CardTitle></CardHeader>
            <CardContent>
              {deposits.length === 0 ? <p className="text-sm text-muted-foreground">{t('noData')}</p> : (
                <div className="space-y-3">
                  {deposits.map(dep => (
                    <div key={dep.id} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">₹{(dep.deposit_amount || 0).toLocaleString('en-IN')}</p>
                        <Badge variant="outline">{dep.status}</Badge>
                      </div>
                      {dep.received_date && <p className="text-xs text-muted-foreground mt-1">{t('date')}: {format(new Date(dep.received_date), 'dd MMM yyyy')}</p>}
                      {dep.refund_amount > 0 && <p className="text-xs text-muted-foreground">{t('refund')}: ₹{dep.refund_amount.toLocaleString('en-IN')}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader><CardTitle>{t('paymentHistory')}</CardTitle></CardHeader>
            <CardContent>
              {payments.length === 0 ? <p className="text-sm text-muted-foreground">{t('noData')}</p> : (
                <div className="space-y-2">
                  {payments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)).map(pay => (
                    <div key={pay.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">₹{(pay.amount || 0).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground">{pay.payment_date ? format(new Date(pay.payment_date), 'dd MMM yyyy') : ''} • {pay.payment_method}</p>
                      </div>
                      {pay.remarks && <p className="text-xs text-muted-foreground">{pay.remarks}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Add Document</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {docPreview ? (
                    <img src={docPreview} alt="preview" className="max-h-40 mx-auto rounded-md object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="w-8 h-8" />
                      <p className="text-sm">Tap to select photo / file</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                </div>
                <Input
                  placeholder="Document name (e.g. Aadhaar, Rent Agreement, PAN...)"
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                />
                <Button className="w-full" disabled={!docName.trim() || !docFile || uploading} onClick={handleUploadDoc}>
                  {uploading ? 'Uploading...' : 'Save Document'}
                </Button>
              </CardContent>
            </Card>

            {documents.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {documents.map(doc => (
                  <div key={doc.id} className="relative rounded-xl border bg-card overflow-hidden group">
                    <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={doc.document_url}
                        alt={doc.document_name}
                        className="w-full h-28 object-cover bg-muted"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <div className="p-2 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                        <p className="text-xs font-medium truncate">{doc.document_name}</p>
                      </div>
                    </a>
                    <button
                      onClick={() => deleteDocMut.mutate(doc.id)}
                      className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {documents.length === 0 && (
              <p className="text-sm text-center text-muted-foreground py-6">{t('noData')}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}