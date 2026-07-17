import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, Shield, ShieldAlert, FileText, CheckCircle2, AlertCircle, Clock, 
  Send, CreditCard, Receipt, Plus, Trash2, Calendar, Phone, MapPin, Sparkles,
  ArrowRight, Download, UploadCloud, CheckCircle, PenTool, ClipboardList, Info
} from 'lucide-react';

// Number to English words helper for rent receipts
const numToWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  let str = '';
  str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) != 0) ? a[Number(n[4])] + 'Hundred ' : '';
  str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() ? str.trim() + ' Rupees Only' : 'Zero Rupees Only';
};

export default function TenantPortal() {
  const qc = useQueryClient();
  
  // State to track currently previewed tenant for judges
  const [selectedTenantId, setSelectedTenantId] = useState(() => {
    return localStorage.getItem('tenant_portal_preview_id') || '';
  });

  // Local state for modals and forms
  const [showSignModal, setShowSignModal] = useState(false);
  const [signName, setSignName] = useState('');
  const [signAgree, setSignAgree] = useState(false);
  
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Complaints state
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('Maintenance');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Success alert states
  const [complaintAlert, setComplaintAlert] = useState(false);
  const [docAlert, setDocAlert] = useState(false);
  const [signAlert, setSignAlert] = useState(false);

  // Fetch all tenants to populate selector
  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants'),
  });

  // Set default tenant once tenants are loaded
  useEffect(() => {
    if (!selectedTenantId && tenants.length > 0) {
      const activeTenant = tenants.find(t => t.status === 'Active') || tenants[0];
      setSelectedTenantId(activeTenant.id.toString());
      localStorage.setItem('tenant_portal_preview_id', activeTenant.id.toString());
    }
  }, [tenants, selectedTenantId]);

  const tenantId = Number(selectedTenantId);

  // Fetch all other required entities
  const { data: tenant } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => api.get('/tenants/' + tenantId),
    enabled: !!tenantId,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments', tenantId],
    queryFn: () => api.get('/payments?tenant_id=' + tenantId),
    enabled: !!tenantId,
  });

  const { data: rentDues = [] } = useQuery({
    queryKey: ['rentDues', tenantId],
    queryFn: () => api.get('/rent-dues?tenant_id=' + tenantId),
    enabled: !!tenantId,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['tenantDocs', tenantId],
    queryFn: () => api.get('/tenant-documents?tenant_id=' + tenantId),
    enabled: !!tenantId,
  });

  const { data: complaints = [] } = useQuery({
    queryKey: ['complaints', tenantId],
    queryFn: () => api.get('/complaints?tenant_id=' + tenantId),
    enabled: !!tenantId,
  });

  const { data: properties = [] } = useQuery({ 
    queryKey: ['properties'], 
    queryFn: () => api.get('/properties') 
  });

  const { data: rooms = [] } = useQuery({ 
    queryKey: ['rooms'], 
    queryFn: () => api.get('/rooms') 
  });

  const handleTenantChange = (e) => {
    const val = e.target.value;
    setSelectedTenantId(val);
    localStorage.setItem('tenant_portal_preview_id', val);
  };

  // Derived properties info
  const property = tenant ? properties.find(p => p.id === tenant.property_id) : null;
  const room = tenant ? rooms.find(r => r.id === tenant.room_id) : null;
  const propertyAddress = property ? `${property.address || ''}, ${property.city || ''}, ${property.state || ''}` : '';

  // Calculation of Rent Overviews
  const monthlyRent = tenant?.monthly_rent || 0;
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = rentDues
    .filter(d => d.status !== 'Paid')
    .reduce((sum, d) => sum + (d.pending_amount || 0), 0);

  // Compliance Status Checkers
  const hasPoliceVerification = documents.some(d => 
    d.document_name.toLowerCase().includes('police') || 
    d.document_name.toLowerCase().includes('verification')
  );

  const rentAgreementDoc = documents.find(d => 
    d.document_name.toLowerCase().includes('rent agreement') ||
    d.document_name.toLowerCase().includes('rental agreement')
  );

  // Document Upload Submit Handler
  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!uploadDocName.trim() || !uploadFile) {
      alert("Please provide a document label and choose a file.");
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await api.upload(uploadFile);
      await api.post('/tenant-documents', {
        tenant_id: tenantId,
        document_name: uploadDocName.trim(),
        document_url: file_url,
        notes: "Uploaded via Tenant Portal Checklist"
      });
      setUploadDocName('');
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      qc.invalidateQueries({ queryKey: ['tenantDocs', tenantId] });
      setDocAlert(true);
      setTimeout(() => setDocAlert(false), 5000);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Document Delete Handler
  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.del('/tenant-documents/' + docId);
      qc.invalidateQueries({ queryKey: ['tenantDocs', tenantId] });
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // Submit Complaint Handler
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintTitle.trim() || !complaintDesc.trim()) {
      alert("Please provide a title and detailed description.");
      return;
    }
    setSubmittingComplaint(true);
    try {
      await api.post('/complaints', {
        tenant_id: tenantId,
        property_id: tenant?.property_id || null,
        title: complaintTitle.trim(),
        category: complaintCategory,
        description: complaintDesc.trim(),
        status: 'Open'
      });
      setComplaintTitle('');
      setComplaintDesc('');
      qc.invalidateQueries({ queryKey: ['complaints', tenantId] });
      setComplaintAlert(true);
      setTimeout(() => setComplaintAlert(false), 5000);
    } catch (err) {
      alert("Failed to submit complaint: " + err.message);
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // Lease Signing Submit Handler
  const handleSignAgreement = async (e) => {
    e.preventDefault();
    if (!signName.trim() || !signAgree) {
      alert("Please fill your full name and check the agreement checkbox.");
      return;
    }
    try {
      await api.post('/tenant-documents', {
        tenant_id: tenantId,
        document_name: 'Rent Agreement',
        document_url: '/uploads/rent_agreement_signed.pdf',
        notes: `Digitally signed by ${signName.trim()} on ${new Date().toLocaleDateString()}`
      });
      setShowSignModal(false);
      setSignName('');
      setSignAgree(false);
      qc.invalidateQueries({ queryKey: ['tenantDocs', tenantId] });
      setSignAlert(true);
      setTimeout(() => setSignAlert(false), 5000);
    } catch (err) {
      alert("Failed to submit agreement signature: " + err.message);
    }
  };

  // Printable receipt window generator
  const printReceipt = (pay) => {
    const printWindow = window.open('', '_blank');
    const amountInWords = numToWords(pay.amount);
    const propName = property?.name || 'N/A';
    const propAddr = propertyAddress || 'N/A';
    const roomNum = room?.room_number || 'N/A';
    const tenantName = tenant?.full_name || 'N/A';

    printWindow.document.write(`
      <html>
        <head>
          <title>Rent Receipt - ${pay.id}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1f2937; background: #ffffff; }
            .receipt-container { border: 3px double #374151; padding: 32px; max-width: 650px; margin: 0 auto; position: relative; }
            .receipt-header { text-align: center; border-bottom: 2px solid #374151; padding-bottom: 16px; margin-bottom: 24px; }
            .receipt-header h1 { margin: 0; font-size: 26px; font-weight: 800; color: #111827; letter-spacing: 1.5px; }
            .receipt-header p { margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: #4b5563; text-transform: uppercase; }
            .receipt-meta { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 14px; color: #374151; }
            .receipt-body { font-size: 16px; line-height: 2; margin-bottom: 32px; color: #111827; }
            .highlight { font-weight: 700; border-bottom: 1px dashed #374151; padding: 0 4px; }
            .receipt-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
            .stamp-box { border: 2px dashed #dc2626; color: #dc2626; width: 80px; height: 95px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: 11px; font-weight: 700; text-transform: uppercase; border-radius: 4px; transform: rotate(-5deg); }
            .signature-box { text-align: center; border-top: 1px solid #9ca3af; width: 180px; padding-top: 8px; font-size: 13px; }
            .signature-name { font-family: 'Brush Script MT', cursive, sans-serif; font-size: 24px; color: #1e3a8a; font-weight: 500; margin-bottom: -4px; }
            .pan-info { font-size: 13px; margin-top: 16px; padding: 8px; background-color: #f3f4f6; border-radius: 4px; border: 1px solid #e5e7eb; color: #374151; display: inline-block; }
            .btn-print { margin-top: 24px; padding: 12px 24px; font-size: 15px; font-weight: 600; color: white; background-color: #2563eb; border: none; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; }
            .btn-print:hover { background-color: #1d4ed8; }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
              .receipt-container { border: 2px solid #000; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              <h1>RENT RECEIPT</h1>
              <p>HRA Tax Exemption Receipt (U/S 10(13A) of Income Tax Act)</p>
            </div>
            <div class="receipt-meta">
              <div>Receipt No: <strong>REC-2026-${pay.id}</strong></div>
              <div>Date of Payment: <strong>${pay.payment_date}</strong></div>
            </div>
            <div class="receipt-body">
              Received with thanks from Mr./Ms. <span class="highlight">&nbsp;&nbsp;${tenantName}&nbsp;&nbsp;</span> 
              the sum of <span class="highlight">&nbsp;&nbsp;₹${pay.amount.toLocaleString('en-IN')}&nbsp;&nbsp;</span> 
              (<span class="highlight">&nbsp;&nbsp;${amountInWords}&nbsp;&nbsp;</span>) 
              towards rent of residential premises <span class="highlight">&nbsp;&nbsp;Room ${roomNum}, ${propName}, ${propAddr}&nbsp;&nbsp;</span> 
              for the period of <span class="highlight">&nbsp;&nbsp;${pay.rent_month || 'Current Month'}&nbsp;&nbsp;</span>.
            </div>
            <div>
              <div class="pan-info">
                <strong>Landlord PAN:</strong> AAAPP8899K (Verified) | <strong>Payment Mode:</strong> ${pay.payment_method || 'UPI/Cash'} ${pay.reference_number ? `(${pay.reference_number})` : ''}
              </div>
            </div>
            <div class="receipt-footer">
              <div class="stamp-box">
                <div>Revenue</div>
                <div>Stamp</div>
                <div style="font-size: 13px; margin-top: 4px;">₹ 1.00</div>
              </div>
              <div>
                <div class="signature-name">${propName.split(' ')[0] || 'Landlord'}</div>
                <div class="signature-box">Authorized Signatory</div>
              </div>
            </div>
          </div>
          <div style="text-align: center;" class="no-print">
            <button class="btn-print" onclick="window.print()">Print Receipt</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100">
      
      {/* 1. DEMO SELECTOR (Sticky top premium selector bar) */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-md transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-650 dark:text-indigo-400 animate-pulse" />
            <h1 className="font-heading font-extrabold text-lg text-slate-800 dark:text-white">
              Tenant Co-Living Portal
            </h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
              Demo Selector
            </span>
            <select
              value={selectedTenantId}
              onChange={handleTenantChange}
              className="text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer"
            >
              <option value="" disabled>Select Tenant</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">

        {/* 2. TENANT HEADER SUMMARY */}
        {tenant ? (
          <Card className="overflow-hidden border border-slate-200 dark:border-slate-850 shadow-sm">
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 dark:from-indigo-900 dark:to-slate-900 p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                      <User className="w-6 h-6 text-indigo-100" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-heading leading-tight">{tenant.full_name}</h2>
                      <p className="text-indigo-200 text-sm font-medium">
                        {property?.name || 'Loading Property...'} • Room {room?.room_number || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {propertyAddress && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-200/90 pl-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{propertyAddress}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <Badge className="bg-white/15 text-white hover:bg-white/20 border-white/20 px-3 py-1 text-xs backdrop-blur-sm">
                    Joined: {tenant.joining_date ? new Date(tenant.joining_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </Badge>
                  <Badge className={`px-3 py-1 text-xs uppercase font-bold tracking-wider ${
                    tenant.status === 'Active' ? 'bg-emerald-500/25 text-emerald-250 border-emerald-400/30' :
                    tenant.status === 'Notice Given' ? 'bg-amber-500/25 text-amber-250 border-amber-400/30' :
                    'bg-slate-500/25 text-slate-250 border-slate-400/30'
                  }`}>
                    {tenant.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <CardContent className="bg-slate-50/70 dark:bg-slate-900 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">Contact Number</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{tenant.mobile_number || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">Aadhaar Number</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{tenant.aadhaar_number || 'Not Provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">Occupation / Employer</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{tenant.occupation || 'N/A'} {tenant.company_name ? `(${tenant.company_name})` : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12 text-slate-500">Loading Tenant Profile...</div>
        )}

        {/* Alerts for visual feedback */}
        {complaintAlert && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 p-4 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-all animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span><strong>Complaint Logged:</strong> Your ticket has been generated and notified to property maintenance.</span>
          </div>
        )}

        {docAlert && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 p-4 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-all animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span><strong>Document Uploaded:</strong> Document successfully attached to your ledger file.</span>
          </div>
        )}

        {signAlert && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 p-4 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-all animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span><strong>Agreement Signed:</strong> Digital signature successfully appended. The Rent Agreement checklist is updated.</span>
          </div>
        )}

        {/* 3. PORTAL CORE FEATURES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT & CENTER GRID: LEDGER & COMPLIANCE (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-6">

            {/* RENT & PAYMENTS LEDGER */}
            <Card className="border border-slate-200 dark:border-slate-850 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div>
                  <CardTitle className="text-lg font-bold font-heading flex items-center gap-2 text-slate-900 dark:text-white">
                    <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Rent & Payments Ledger
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">Monitor due dates, payments history, and download tax receipt copies</CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                
                {/* 3 Metrics Overview */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-100/80 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Monthly Rent</p>
                    <p className="text-sm sm:text-lg font-extrabold text-indigo-700 dark:text-indigo-300 mt-1">₹{monthlyRent.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-center">
                    <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Total Paid</p>
                    <p className="text-sm sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">₹{totalPaid.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-rose-50/80 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 text-center">
                    <p className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wide">Pending Due</p>
                    <p className="text-sm sm:text-lg font-extrabold text-rose-700 dark:text-rose-300 mt-1">₹{totalPending.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Monthly Rent Dues Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">Rent Dues Breakdown</h4>
                  {rentDues.length === 0 ? (
                    <div className="text-center py-4 bg-slate-50 dark:bg-slate-855 rounded-lg text-slate-400 text-xs">No Rent Dues Logged</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rentDues.slice(0, 6).map(due => (
                        <div key={due.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                              {due.month}/{due.year}
                            </p>
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                              Due: ₹{due.rent_amount} | Paid: ₹{due.amount_paid || 0}
                            </p>
                          </div>
                          <div>
                            <Badge className={`text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wide rounded ${
                              due.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900' :
                              due.status === 'Partially Paid' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-900' :
                              'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-900'
                            }`}>
                              {due.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* History Table of Payments */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">Payment Transactions</h4>
                  {payments.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-850 rounded-lg text-slate-400 text-sm">No transaction records found.</div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-slate-100/80 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                            <th className="p-3 font-bold">Rent Period</th>
                            <th className="p-3 font-bold">Date</th>
                            <th className="p-3 font-bold">Amount</th>
                            <th className="p-3 font-bold">Method</th>
                            <th className="p-3 font-bold text-right">Tax Receipt (HRA)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {payments.map(pay => (
                            <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                              <td className="p-3 font-extrabold text-indigo-700 dark:text-indigo-400">
                                {pay.rent_month || 'Current Month'}
                              </td>
                              <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                                {pay.payment_date}
                              </td>
                              <td className="p-3 font-extrabold text-emerald-700 dark:text-emerald-400">
                                ₹{pay.amount.toLocaleString('en-IN')}
                              </td>
                              <td className="p-3">
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                  {pay.payment_method || 'UPI'}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-[10px] font-bold px-2.5 border-indigo-300 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900"
                                  onClick={() => printReceipt(pay)}
                                >
                                  <Receipt className="w-3 h-3 mr-1" />
                                  Download (HRA)
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* COMPLIANCE STATUS CHECKLIST */}
            <Card className="border border-slate-200 dark:border-slate-855 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-bold font-heading flex items-center gap-2 text-slate-900 dark:text-white">
                  <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Compliance & Verification Checklist
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">Verification checks mandatory for residency compliance and tax exemption status</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* 3 Main Compliance Items */}
                <div className="space-y-4">
                  
                  {/* Police Verification Check */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-start gap-3.5">
                    {hasPoliceVerification ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5 animate-bounce" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Police Verification Certificate</h4>
                        <Badge className={hasPoliceVerification ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900"}>
                          {hasPoliceVerification ? "Verified" : "Pending Action"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Required by local municipal corporation bylaws. Please upload your verification certificate if not done.
                      </p>
                      {!hasPoliceVerification && (
                        <div className="pt-1.5">
                          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer">
                            <UploadCloud className="w-4 h-4" />
                            <span>Upload Certificate File</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setUploadDocName("Police Verification Certificate");
                                  setUploadFile(file);
                                }
                              }} 
                            />
                          </label>
                          {uploadFile && uploadDocName === "Police Verification Certificate" && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-650 dark:text-slate-400 truncate max-w-[200px]">{uploadFile.name}</span>
                              <Button size="sm" className="h-6 text-[10px] px-2 bg-indigo-650 hover:bg-indigo-700 text-white" disabled={uploading} onClick={handleUploadDoc}>
                                {uploading ? 'Uploading...' : 'Confirm Upload'}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rent Agreement Check */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-start gap-3.5">
                    {rentAgreementDoc ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <PenTool className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Lease/Rental Agreement (11 Months)</h4>
                        <Badge className={rentAgreementDoc ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900"}>
                          {rentAgreementDoc ? "Signed" : "Draft Ready"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Formal lease deed with digital stamp paper. Used for address verification and HRA tax filings.
                      </p>
                      <div className="pt-1.5 flex gap-2">
                        {rentAgreementDoc ? (
                          <a 
                            href={rentAgreementDoc.document_url.startsWith('http') ? rentAgreementDoc.document_url : `http://localhost:8000${rentAgreementDoc.document_url}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline" className="h-7 text-[10px] border-indigo-200 text-indigo-600 dark:border-indigo-900 dark:text-indigo-400">
                              <Download className="w-3.5 h-3.5 mr-1" />
                              Download Agreement
                            </Button>
                          </a>
                        ) : (
                          <Button 
                            size="sm" 
                            className="h-7 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => setShowSignModal(true)}
                          >
                            <PenTool className="w-3.5 h-3.5 mr-1" />
                            Review & Sign Agreement
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Documents List & KYC Uploader */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <UploadCloud className="w-4 h-4 text-indigo-500" />
                        KYC Document Archives
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                        Upload ID proofs, address proofs, company letters to your ledger dossier.
                      </p>
                    </div>

                    {/* KYC Document Upload Form */}
                    <form onSubmit={handleUploadDoc} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">Document Type/Label</label>
                        <Input 
                          placeholder="e.g. Aadhaar Card Front" 
                          value={uploadDocName}
                          onChange={(e) => setUploadDocName(e.target.value)}
                          className="h-8 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium border-slate-300 dark:border-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">Select File</label>
                        <Input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={(e) => setUploadFile(e.target.files[0])}
                          className="h-8 text-xs py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium border-slate-300 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <Button type="submit" disabled={uploading} className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                          {uploading ? 'Uploading...' : 'Upload File'}
                        </Button>
                      </div>
                    </form>

                    {/* Uploaded Documents Feed */}
                    {documents.length > 0 && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                        <p className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">Active Documents</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {documents.map(doc => (
                            <div key={doc.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                <div className="truncate">
                                  <p className="font-bold truncate text-slate-900 dark:text-slate-100">{doc.document_name}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{doc.notes || 'No description'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                <a 
                                  href={doc.document_url.startsWith('http') ? doc.document_url : `http://localhost:8000${doc.document_url}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"
                                  title="Download File"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                                <button 
                                  onClick={() => handleDeleteDoc(doc.id)}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-rose-500"
                                  title="Delete File"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </CardContent>
            </Card>

          </div>

          {/* RIGHT GRID: COMPLAINTS DESK (1 col on desktop) */}
          <div className="space-y-6">
            
            <Card className="border border-slate-200 dark:border-slate-850 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-bold font-heading flex items-center gap-2 text-slate-900 dark:text-white">
                  <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Complaints Desk
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">Submit repair requests, check technicians updates and tickets log</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                
                {/* Submit Complaint Form */}
                <form onSubmit={handleSubmitComplaint} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Issue Title</label>
                    <Input 
                      placeholder="e.g. WiFi Router Not Working" 
                      value={complaintTitle}
                      onChange={(e) => setComplaintTitle(e.target.value)}
                      required
                      className="text-sm h-9 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={complaintCategory}
                      onChange={(e) => setComplaintCategory(e.target.value)}
                      className="w-full text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="Maintenance">Maintenance</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Internet/Wifi">Internet & Wifi</option>
                      <option value="Security">Security</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description of Issue</label>
                    <Textarea 
                      placeholder="Provide room details, appliance numbers, or specific problems to help technician..."
                      value={complaintDesc}
                      onChange={(e) => setComplaintDesc(e.target.value)}
                      required
                      className="text-sm min-h-[90px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium border-slate-300 dark:border-slate-700 resize-y"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-medium shadow-sm transition-all"
                    disabled={submittingComplaint}
                  >
                    {submittingComplaint ? (
                      'Filing Complaint...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Complaint Ticket
                      </>
                    )}
                  </Button>
                </form>

                {/* Live Feed List of Complaints */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Your Lodged Tickets</h4>
                  
                  {complaints.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-850/50 rounded-xl text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800">
                      No complaints logged. Excellent!
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {complaints.map(comp => (
                        <div key={comp.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-sm font-bold text-slate-800 dark:text-white leading-snug">{comp.title}</h5>
                            <Badge className={`text-[9px] px-1.5 py-0.5 uppercase tracking-wider font-extrabold rounded-md shrink-0 ${
                              comp.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-455 border border-emerald-200/50' :
                              comp.status === 'In Progress' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-455 border border-indigo-200/50' :
                              'bg-amber-500/15 text-amber-600 dark:text-amber-455 border border-amber-250/50'
                            }`}>
                              {comp.status || 'Open'}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 font-medium">
                            {comp.description}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                              {comp.category || 'Maintenance'}
                            </span>
                            <span>
                              {comp.created_at ? new Date(comp.created_at).toLocaleDateString('en-IN') : 'Just now'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>

          </div>

        </div>

      </div>

      {/* 4. LEASE AGREEMENT SIGNING MODAL */}
      {showSignModal && tenant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  E-Sign Rental Lease Agreement
                </h3>
                <p className="text-xs text-slate-400">Review terms and type full name to authorize digital agreement</p>
              </div>
              <button 
                onClick={() => setShowSignModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Lease Content (Scrollable) */}
            <div className="flex-1 p-6 overflow-y-auto text-slate-700 dark:text-slate-300 text-xs sm:text-sm space-y-4 leading-relaxed scrollbar-thin">
              <div className="text-center font-bold text-sm underline tracking-wider uppercase">
                RESIDENTIAL LEASE AGREEMENT
              </div>
              <p>
                This agreement of lease is made and entered into on <span className="font-bold text-slate-900 dark:text-white">{tenant.joining_date || 'Today'}</span>, by and between the Landlord, namely <span className="font-bold text-slate-900 dark:text-white">{property?.name || 'Apex Resi Management'}</span> (hereinafter called the Lessor), and the Tenant, namely <span className="font-bold text-slate-900 dark:text-white">{tenant.full_name}</span> (hereinafter called the Lessee).
              </p>
              <h5 className="font-bold text-slate-900 dark:text-white uppercase">1. Demised Premises:</h5>
              <p>
                The Lessor hereby leases to the Lessee and the Lessee leases from the Lessor, the residential accommodation located at <span className="font-semibold text-slate-900 dark:text-white">Room {room?.room_number || 'N/A'}, {property?.name || 'N/A'}, {propertyAddress}</span>.
              </p>
              <h5 className="font-bold text-slate-900 dark:text-white uppercase">2. Lease Term & Rent Payment:</h5>
              <p>
                This lease is contracted for a standard term of eleven (11) months starting from the joining date. The Lessee agrees to pay a monthly rent of <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{tenant.monthly_rent?.toLocaleString('en-IN')}</span> per month. All rent payments are due on or before the 5th of each calendar month.
              </p>
              <h5 className="font-bold text-slate-900 dark:text-white uppercase">3. Security Deposit:</h5>
              <p>
                The Lessee has deposited a security amount of <span className="font-bold text-slate-900 dark:text-white">₹{tenant.security_deposit?.toLocaleString('en-IN') || (tenant.monthly_rent * 2).toLocaleString('en-IN')}</span> as interest-free security deposit. The security deposit will be fully refunded within 30 days of clean vacancy after adjusting electricity bills or damage costs, if any.
              </p>
              <h5 className="font-bold text-slate-900 dark:text-white uppercase">4. Maintenance & Compliance:</h5>
              <p>
                The Lessee shall keep the room in clean condition and comply with co-living house rules. Police verification records must be submitted within 15 days of occupancy. Failure to register verification certificates can lead to eviction proceedings.
              </p>
              <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-550 space-y-1">
                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  Legal Disclosure & Consent
                </p>
                <p>
                  By typing your name below, you confirm that your details are accurate, and you authorize this digitally signed contract as a binding lease document for HRA tax exemption claims.
                </p>
              </div>
            </div>

            {/* Modal Signature Action Footer */}
            <form onSubmit={handleSignAgreement} className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Type Full Name to Sign</label>
                  <Input 
                    placeholder="e.g. Amit Sharma"
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    required
                    className="h-9 font-medium"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input 
                    type="checkbox" 
                    id="chk-agree" 
                    checked={signAgree}
                    onChange={(e) => setSignAgree(e.target.checked)}
                    required
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="chk-agree" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    I agree to the lease terms & contract details
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowSignModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-medium"
                  disabled={!signName.trim() || !signAgree}
                >
                  Sign & File Lease Agreement
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
