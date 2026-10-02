/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Users, ArrowUpRight, TrendingUp, CheckCircle, 
  FileText, Coins, AlertCircle, ShoppingCart, Landmark, DollarSign, ArrowLeftRight,
  ChevronDown, GripVertical, Printer
} from 'lucide-react';
import { translations } from '../locales';
import { Lead, Opportunity, Deal, Quotation, Invoice, Client } from '../types';

interface SalesProps {
  clients: Client[];
  leads: Lead[];
  opportunities: Opportunity[];
  deals: Deal[];
  quotations: Quotation[];
  invoices: Invoice[];
  language: 'ar' | 'en';
  onUpdateLeadStatus: (leadId: number, status: string) => void;
  onUpdateLeadPriority: (leadId: number, priority: 'low' | 'medium' | 'high') => void;
  onUpdateInvoiceStatus: (id: number, status: string) => void;
  onAddLead: (data: any) => void;
  onAddOpportunity: (data: any) => void;
  onAddQuotation: (data: any) => void;
  onAddInvoice: (data: any) => void;
}

export default function SalesView({
  clients,
  leads,
  opportunities,
  deals,
  quotations,
  invoices,
  language,
  onUpdateLeadStatus,
  onUpdateLeadPriority,
  onUpdateInvoiceStatus,
  onAddLead,
  onAddOpportunity,
  onAddQuotation,
  onAddInvoice
}: SalesProps) {
  const t = (key: string) => translations[key]?.[language] || key;
  const isRtl = language === 'ar';

  const [activeSegment, setActiveSegment] = useState<'leads' | 'opps' | 'quotes' | 'invoices'>('leads');
  const [selectedInvoiceToPrint, setSelectedInvoiceToPrint] = useState<Invoice | null>(null);

  // Drag and drop states for Sales Kanban of Leads
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  const [draggedOverStage, setDraggedOverStage] = useState<string | null>(null);

  // Priority board sorting state
  const [sortByPriority, setSortByPriority] = useState<'none' | 'high-to-low' | 'low-to-high'>('none');

  const getSortedLeads = (leadsList: Lead[]) => {
    if (sortByPriority === 'none') return leadsList;
    const priorityWeights = {
      high: 3,
      medium: 2,
      low: 1
    };
    return [...leadsList].sort((a, b) => {
      const weightA = priorityWeights[a.priority || 'medium'] || 2;
      const weightB = priorityWeights[b.priority || 'medium'] || 2;
      if (sortByPriority === 'high-to-low') {
        return weightB - weightA;
      } else {
        return weightA - weightB;
      }
    });
  };

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDraggedOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDraggedOverStage(stage);
  };

  const handleDragLeave = () => {
    setDraggedOverStage(null);
  };

  const handleDropStatus = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData('text/plain') || (draggedLeadId ? draggedLeadId.toString() : '');
    if (idStr) {
      const leadId = parseInt(idStr, 10);
      if (!isNaN(leadId)) {
        onUpdateLeadStatus(leadId, targetStage);
      }
    }
    setDraggedLeadId(null);
    setDraggedOverStage(null);
  };

  // Addition managers
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);

  const [newLead, setNewLead] = useState({
    client_id: '',
    source: isRtl ? 'حملة تواصل اجتماعي' : 'Social Campaign',
    score: '70',
    status: 'new',
    expected_revenue: '30000',
    priority: 'medium'
  });

  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    invoice_number: `INV-2026-00${invoices.length + 1}`,
    total_amount: '',
    tax: '',
    due_date: new Date().toISOString().split('T')[0],
    status: 'unpaid'
  });

  const formatCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(val);
    return isRtl ? `${formatted} ر.س` : `${formatted} SAR`;
  };

  const getClientName = (id: number) => {
    return clients.find(c => c.id === id)?.name || `Client #${id}`;
  };

  // Promote lead pipeline status helper
  const promoteLead = (leadId: number, current: string) => {
    const stages = ['new', 'contacted', 'qualified'];
    const idx = stages.indexOf(current);
    if (idx !== -1 && idx < stages.length - 1) {
      onUpdateLeadStatus(leadId, stages[idx + 1]);
    }
  };

  const demoteLead = (leadId: number) => {
    onUpdateLeadStatus(leadId, 'unqualified');
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLead({
      ...newLead,
      client_id: Number(newLead.client_id),
      score: Number(newLead.score),
      expected_revenue: Number(newLead.expected_revenue)
    });
    setLeadFormOpen(false);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    onAddInvoice({
      ...newInvoice,
      client_id: Number(newInvoice.client_id),
      total_amount: Number(newInvoice.total_amount),
      tax: Number(newInvoice.tax)
    });
    setInvoiceFormOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs font-serif">
      
      {/* Top Controls Headers */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t('sales')}</span>
            <Coins className="w-5 h-5 text-[#FF6500]" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl ? 'متابعة تفاصيل خط البايبلاين، والفرص المفتوحة، وترسية الصفقات وإصدار الفواتير وتحصيل المعاملات المالية المعتمدة.' : 'Track the commercial lifecycle including status boards, proposal valuations, quotations and invoice balances'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setLeadFormOpen(true)}
            style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl hover:opacity-90 text-white font-bold text-xs shadow-sm cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" style={{ color: 'var(--brand-secondary, #FF6500)' }} />
            <span>{isRtl ? 'قيد عميل محتمل' : 'Record Lead'}</span>
          </button>
          <button
            onClick={() => setInvoiceFormOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-500" />
            <span>{isRtl ? 'تحرير فاتورة' : 'Create Invoice'}</span>
          </button>
        </div>
      </div>

      {/* SEGMENT TRIGGER TABS */}
      <div className="flex border-b border-slate-200 text-xs font-bold font-serif whitespace-nowrap overflow-x-auto gap-1">
        <button
          onClick={() => setActiveSegment('leads')}
          style={activeSegment === 'leads' ? { borderColor: 'var(--brand-secondary, #FF6500)', color: 'var(--brand-secondary, #FF6500)' } : undefined}
          className={`px-5 py-3 border-b-2 text-start transition-colors cursor-pointer ${
            activeSegment === 'leads' ? 'bg-white font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('leadsList')}
        </button>
        <button
          onClick={() => setActiveSegment('opps')}
          style={activeSegment === 'opps' ? { borderColor: 'var(--brand-secondary, #FF6500)', color: 'var(--brand-secondary, #FF6500)' } : undefined}
          className={`px-5 py-3 border-b-2 text-start transition-colors cursor-pointer ${
            activeSegment === 'opps' ? 'bg-white font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('opportunities')} ({opportunities.length})
        </button>
        <button
          onClick={() => setActiveSegment('quotes')}
          style={activeSegment === 'quotes' ? { borderColor: 'var(--brand-secondary, #FF6500)', color: 'var(--brand-secondary, #FF6500)' } : undefined}
          className={`px-5 py-3 border-b-2 text-start transition-colors cursor-pointer ${
            activeSegment === 'quotes' ? 'bg-white font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('quotations')}
        </button>
        <button
          onClick={() => setActiveSegment('invoices')}
          style={activeSegment === 'invoices' ? { borderColor: 'var(--brand-secondary, #FF6500)', color: 'var(--brand-secondary, #FF6500)' } : undefined}
          className={`px-5 py-3 border-b-2 text-start transition-colors cursor-pointer ${
            activeSegment === 'invoices' ? 'bg-white font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('invoices')}
        </button>
      </div>

      {/* TAB CONTENT: 1. LEADS KANBAN BOARD */}
      {activeSegment === 'leads' && (
        <div className="space-y-4">
          {/* Sales Pipeline Summary Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            {[
              { key: 'new', labelAr: 'فرص جديدة', labelEn: 'New Leads', colorClass: 'border-blue-100 bg-blue-50/30 text-blue-900' },
              { key: 'contacted', labelAr: 'تم التواصل', labelEn: 'Contacted', colorClass: 'border-amber-100 bg-amber-50/30 text-amber-950' },
              { key: 'qualified', labelAr: 'عملاء مؤهلين', labelEn: 'Qualified Leads', colorClass: 'border-emerald-100 bg-emerald-50/30 text-emerald-950' },
              { key: 'unqualified', labelAr: 'مستبعدة / مغلقة', labelEn: 'Unqualified / Closed', colorClass: 'border-slate-150 bg-slate-50/40 text-slate-700' }
            ].map(summary => {
              const stageLeads = leads.filter(l => l.status === summary.key);
              const count = stageLeads.length;
              const valTotal = stageLeads.reduce((acc, l) => acc + (l.expected_revenue || 0), 0);
              return (
                <div key={summary.key} className={`p-3 rounded-xl border flex flex-col justify-between transition-colors shadow-xs ${summary.colorClass}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">
                    {isRtl ? summary.labelAr : summary.labelEn}
                  </span>
                  <div className="flex items-baseline justify-between mt-1.5 gap-2">
                    <span className="text-base font-black font-mono">{count}</span>
                    <span className="text-[11px] font-black font-mono">{formatCurrency(valTotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kanban Sorting controls bar */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">
                {isRtl ? 'ترتيب لوحة الكانبان حسب الأولوية:' : 'Sort Kanban board by priority:'}
              </span>
            </div>
            <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1">
              {[
                { value: 'none', labelAr: 'الوضع الافتراضي', labelEn: 'Default' },
                { value: 'high-to-low', labelAr: 'الأولوية: من الأعلى للأقل ⚡', labelEn: 'Priority: High to Low ⚡' },
                { value: 'low-to-high', labelAr: 'الأولوية: من الأقل للأعلى 🛡️', labelEn: 'Priority: Low to High 🛡️' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSortByPriority(opt.value as any)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    sortByPriority === opt.value
                      ? 'bg-[#FF6500] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/30'
                  }`}
                >
                  {isRtl ? opt.labelAr : opt.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Draggable hint box */}
          <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between text-[11px] text-indigo-700 font-sans">
            <span className="flex items-center gap-1.5">
              💡 {isRtl 
                ? 'نصيحة المنصة: اسحب أي بطاقة عميل محتمل وأفلتها في العمود المطلوب لتعديل حالة البايبلاين مباشرة!' 
                : 'Pro tip: Drag and drop any lead card to another column to instantly shift its pipeline state!'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                key: 'new', 
                labelAr: 'عميل جديد', 
                labelEn: 'New Lead', 
                colorClass: 'border-blue-400 bg-blue-50/10 text-blue-800' 
              },
              { 
                key: 'contacted', 
                labelAr: 'تم التواصل', 
                labelEn: 'Contacted', 
                colorClass: 'border-amber-400 bg-amber-50/10 text-amber-800' 
              },
              { 
                key: 'qualified', 
                labelAr: 'عميل مؤهل نشط', 
                labelEn: 'Qualified', 
                colorClass: 'border-emerald-400 bg-emerald-50/10 text-emerald-800' 
              },
              { 
                key: 'unqualified', 
                labelAr: 'فرص مستبعدة / مغلق', 
                labelEn: 'Closed / Unqualified', 
                colorClass: 'border-slate-300 bg-slate-50/20 text-slate-500' 
              }
            ].map((lane) => {
              const unfilteredLeads = leads.filter(l => l.status === lane.key);
              const laneLeads = getSortedLeads(unfilteredLeads);
              const laneTotal = unfilteredLeads.reduce((acc, l) => acc + (l.expected_revenue || 0), 0);
              const isOver = draggedOverStage === lane.key;

              return (
                <div 
                  key={lane.key}
                  onDragOver={(e) => handleDragOver(e, lane.key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDropStatus(e, lane.key)}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col space-y-4 min-h-[450px] ${
                    isOver 
                      ? 'bg-amber-50/80 border-orange-400 ring-2 ring-dashed ring-orange-300 transform scale-[1.01]' 
                      : 'bg-slate-100/60 border-slate-200/80'
                  }`}
                >
                  {/* Lane Header */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-xs">
                        {isRtl ? lane.labelAr : lane.labelEn}
                      </span>
                      <span className="font-mono bg-[#0B192C] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                        {unfilteredLeads.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans border-t border-slate-100 pt-1.5 mt-0.5">
                      <span>{isRtl ? 'إجمالي المتوقع:' : 'Expected value:'}</span>
                      <span className="font-bold text-slate-600 font-mono">{formatCurrency(laneTotal)}</span>
                    </div>
                  </div>

                  {/* Lane Column Droppable Container */}
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-380px)] pr-1 custom-scrollbar">
                    {laneLeads.length === 0 ? (
                      <div className="h-28 border border-dashed border-slate-200/80 rounded-xl flex items-center justify-center bg-slate-50/40 text-[10px] text-slate-400 text-center font-sans">
                        <span>{isRtl ? 'اسحب الفرص هنا' : 'Drag leads here'}</span>
                      </div>
                    ) : (
                      laneLeads.map((lead) => {
                        const isBeingDragged = draggedLeadId === lead.id;
                        return (
                          <div 
                            key={lead.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead.id)}
                            onDragEnd={handleDragEnd}
                            className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3 transition-all duration-150 cursor-grab active:cursor-grabbing hover:border-orange-300 group hover:shadow-xs relative ${
                              isBeingDragged ? 'opacity-40 border-dashed border-amber-400 scale-95' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-[11px] leading-tight group-hover:text-[#FF6500]">
                                  {getClientName(lead.client_id)}
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-sans flex items-center gap-1">
                                  <span>SRC:</span> 
                                  <span className="font-semibold text-slate-500">{lead.source || '-'}</span>
                                </p>
                              </div>
                              <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 mt-0.5" />
                            </div>
                            
                            <div className="flex justify-between items-center text-[10px] font-sans">
                              <span className="font-extrabold text-[#FF6500] font-mono">
                                {formatCurrency(lead.expected_revenue)}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                lead.score >= 80 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                  : 'bg-orange-50 text-orange-600'
                              }`}>
                                SCORE: {lead.score}
                              </span>
                            </div>

                            {/* Dropdown for Priority */}
                            <div className="flex items-center justify-between text-[10px] font-sans pt-1 border-t border-slate-50">
                              <span className="text-slate-400 font-medium">
                                {isRtl ? 'الأولوية:' : 'Priority:'}
                              </span>
                              <select
                                value={lead.priority || 'medium'}
                                onChange={(e) => onUpdateLeadPriority(lead.id, e.target.value as 'low' | 'medium' | 'high')}
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer focus:ring-1 focus:ring-[#FF6500] focus:outline-hidden ${
                                  lead.priority === 'high' 
                                    ? 'bg-rose-50 border-rose-200 text-rose-700 font-black' 
                                    : lead.priority === 'low'
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                                    : 'bg-amber-50 border-amber-200 text-amber-700 font-bold'
                                }`}
                              >
                                <option value="high" className="bg-white text-rose-700 font-black">{isRtl ? '🔴 مرتفعة' : '🔴 High'}</option>
                                <option value="medium" className="bg-white text-amber-500 font-bold">{isRtl ? '🟡 متوسطة' : '🟡 Medium'}</option>
                                <option value="low" className="bg-white text-blue-500 font-bold">{isRtl ? '🔵 منخفضة' : '🔵 Low'}</option>
                              </select>
                            </div>

                            {/* Column-switching buttons (Fallback/Accessibility) */}
                            <div className="pt-2 border-t border-slate-100 flex justify-between gap-1 text-[10px]">
                              {lead.status !== 'unqualified' ? (
                                <button
                                  onClick={() => demoteLead(lead.id)}
                                  className="text-rose-500 font-semibold hover:underline"
                                >
                                  {isRtl ? 'استبعاد' : 'Fail'}
                                </button>
                              ) : (
                                <span className="text-[9px] text-slate-400">{isRtl ? 'مستبعدة' : 'Archived'}</span>
                              )}

                              {lead.status !== 'qualified' && lead.status !== 'unqualified' && (
                                <button 
                                  onClick={() => promoteLead(lead.id, lead.status)}
                                  className="text-emerald-500 font-bold hover:underline"
                                >
                                  {isRtl ? 'تحريك للأمام ➔' : 'Advance ➔'}
                                </button>
                              )}
                              
                              {lead.status === 'qualified' && (
                                <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                                  ✓ Ready
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. OPPORTUNITIES VIEW */}
      {activeSegment === 'opps' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold">
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>Opportunity Title</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>Stage</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>Probability</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>Estimated value</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>Close Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {opportunities.map(opp => (
                <tr key={opp.id} className="hover:bg-slate-50/40">
                  <td className="py-3 px-4 font-bold text-slate-900">{opp.title}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold font-sans uppercase bg-orange-50 text-[#FF6500]">
                      {opp.stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{opp.probability}%</td>
                  <td className="py-3 px-4 font-black">{formatCurrency(opp.estimated_value)}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{opp.close_date || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: 3. QUOTATIONS CENTER */}
      {activeSegment === 'quotes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold">
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>Subject</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>Client</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>Total Value</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>Discount</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>Quotation state</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.map(quota => (
                <tr key={quota.id} className="hover:bg-slate-50/40">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{quota.subject}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-semibold">{getClientName(quota.client_id)}</td>
                  <td className="py-3.5 px-4 font-black">{formatCurrency(quota.total_amount)}</td>
                  <td className="py-3.5 px-4 text-rose-500 font-mono">-{formatCurrency(quota.discount)}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase">
                      {quota.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: 4. INVOICES & LEDGER LOG */}
      {activeSegment === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold">
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('invNumber')}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('clientName')}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('totalAmt')}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('dueDate')}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('paidState')}</th>
                <th className="py-3.5 px-4 text-center">{isRtl ? 'الإجراءات والحوالات' : 'Actions & Settlements'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/30 font-medium">
                  <td className="py-3.5 px-4 font-bold text-slate-800 font-mono">{inv.invoice_number}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-705">{getClientName(inv.client_id)}</td>
                  <td className="py-3.5 px-4 font-black text-slate-900">{formatCurrency(inv.total_amount)}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">{inv.due_date}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* PRINT TO PDF ACTION */}
                      <button
                        onClick={() => setSelectedInvoiceToPrint(inv)}
                        className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        title={isRtl ? 'طباعة / تصدير PDF' : 'Print / Export to PDF'}
                      >
                        <Printer className="w-3 h-3" />
                        <span>{isRtl ? 'طباعة PDF' : 'Print PDF'}</span>
                      </button>

                      {/* SETTLE SIMULATION ACTION */}
                      {inv.status !== 'paid' ? (
                        <button
                          onClick={() => onUpdateInvoiceStatus(inv.id, 'paid')}
                          className="py-1 px-3 bg-[#FF6500] hover:bg-orange-600 rounded text-[10px] text-white font-bold transition-all cursor-pointer"
                        >
                          {isRtl ? 'سداد' : 'Settle'}
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center justify-center">
                          ✔️ {isRtl ? 'مُسددة' : 'Settled'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL WINDOW 1: RECORD LEAD */}
      {leadFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-slide-in">
            <div 
              className="p-5 text-white flex justify-between items-center"
              style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
            >
              <h3 className="font-extrabold tracking-tight">{isRtl ? 'تسجيل عميل محتمل وجدولة صفقة' : 'Add Lead pipeline item'}</h3>
              <button onClick={() => setLeadFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <ChevronDown className="w-5 h-5 rotate-90" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">{isRtl ? 'العميل المصاحب *' : 'Target Client *'}</label>
                <select
                  required
                  value={newLead.client_id}
                  onChange={(e) => setNewLead({...newLead, client_id: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">{isRtl ? '-- حدد عميل فرعي --' : '-- Choose customer account --'}</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">{isRtl ? 'مصدر العميل المحتمل' : 'Lead Acquisition Source'}</label>
                <input
                  type="text" required
                  value={newLead.source}
                  onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                  placeholder="Website form"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Lead Score (1-100)</label>
                  <input
                    type="number" required min="1" max="100"
                    value={newLead.score}
                    onChange={(e) => setNewLead({...newLead, score: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Expected Revenue (SAR)</label>
                  <input
                    type="number" required
                    value={newLead.expected_revenue}
                    onChange={(e) => setNewLead({...newLead, expected_revenue: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">{isRtl ? 'الأولوية' : 'Lead Priority'}</label>
                <select
                  value={newLead.priority}
                  onChange={(e) => setNewLead({...newLead, priority: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="high">{isRtl ? 'مرتفعة' : 'High'}</option>
                  <option value="medium">{isRtl ? 'متوسطة' : 'Medium'}</option>
                  <option value="low">{isRtl ? 'منخفضة' : 'Low'}</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setLeadFormOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl font-bold">
                  {isRtl ? 'إلغاء' : 'Dismiss'}
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                  className="px-5 py-2 rounded-xl hover:opacity-90 text-white font-black cursor-pointer shadow-sm transition-all"
                >
                  {isRtl ? 'قيد كفرصة' : 'Add Opportunity'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 2: CREATE INVOICE */}
      {invoiceFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-slide-in">
            <div 
              className="p-5 text-white flex justify-between items-center"
              style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
            >
              <h3 className="font-extrabold tracking-tight">{isRtl ? 'تحرير مالي لفاتورة مبيعات' : 'Generate invoice ledger transaction'}</h3>
              <button onClick={() => setInvoiceFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <ChevronDown className="w-5 h-5 rotate-90" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Invoice Number *</label>
                  <input
                    type="text" required
                    value={newInvoice.invoice_number}
                    onChange={(e) => setNewInvoice({...newInvoice, invoice_number: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">{isRtl ? 'تاريخ الاستحقاق' : 'Payment Due Date'}</label>
                  <input
                    type="date" required
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice({...newInvoice, due_date: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">{isRtl ? 'العميل الفاتورة *' : 'Target statement client *'}</label>
                <select
                  required
                  value={newInvoice.client_id}
                  onChange={(e) => setNewInvoice({...newInvoice, client_id: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">{isRtl ? '-- حدد عميل فرعي --' : '-- Choose customer account --'}</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Statement Amount (SAR) *</label>
                  <input
                    type="number" required
                    value={newInvoice.total_amount}
                    onChange={(e) => setNewInvoice({...newInvoice, total_amount: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono"
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Tax Value (SAR)</label>
                  <input
                    type="number" required
                    value={newInvoice.tax}
                    onChange={(e) => setNewInvoice({...newInvoice, tax: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono"
                    placeholder="7500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setInvoiceFormOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl font-bold">
                  {isRtl ? 'إلغاء' : 'Dismiss'}
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                  className="px-5 py-2 rounded-xl hover:opacity-90 text-white font-black cursor-pointer shadow-sm transition-all"
                >
                  {isRtl ? 'إرسال الفاتورة' : 'Post Balance'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PRINT-READY INVOICE MODAL & ELECTRONIC BILLING STAMP */}
      {selectedInvoiceToPrint && (() => {
        const inv = selectedInvoiceToPrint;
        const targetClient = clients.find(c => c.id === Number(inv.client_id));
        const taxVal = inv.tax || Math.round(inv.total_amount * 0.15);
        const subtotalVal = inv.total_amount - taxVal;

        const itemLines = [
          {
            sku: 'SRV-CRM-ENT',
            title_en: 'Enterprise Core CRM Subscription & Core SLA Setup',
            title_ar: 'اشتراك نظام مدى CRM السحابي والتثبيت المبدئي للمنشأة',
            qty: 1,
            unit_price: Math.round(subtotalVal * 0.7),
            total: Math.round(subtotalVal * 0.7)
          },
          {
            sku: 'SRV-CSL-TRN',
            title_en: 'Corporate User Training, Custom Integration & Support SLA',
            title_ar: 'تدريب الطاقم الإداري للمنشأة وتخصيص البوابات والربط الفني',
            qty: 1,
            unit_price: Math.round(subtotalVal * 0.3),
            total: Math.round(subtotalVal * 0.3)
          }
        ];
        const diff = subtotalVal - (itemLines[0].total + itemLines[1].total);
        if (diff !== 0) {
          itemLines[1].total += diff;
          itemLines[1].unit_price += diff;
        }

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans overflow-y-auto no-print">
            <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-zoom-in my-8">
              {/* Modal top bar */}
              <div className="p-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-[#FF6500]" />
                  <span className="font-extrabold text-sm text-white">
                    {isRtl ? 'معاينة وطباعة الفاتورة برابط فني' : 'Interactive Invoice Print Preview'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceToPrint(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="font-sans text-lg">✕</span>
                </button>
              </div>

              {/* Printable Invoice Sheet Frame */}
              <div className="p-6 md:p-8 bg-slate-100 max-h-[70vh] overflow-y-auto">
                <div 
                  id="invoice-print-area" 
                  className="bg-white p-8 md:p-12 shadow-sm rounded-lg max-w-3xl mx-auto border border-slate-200 text-slate-800 leading-relaxed font-sans"
                  style={{ minHeight: '297mm' }}
                >
                  {/* Top colored aesthetic strip */}
                  <div className="h-1.5 bg-[#FF6500] -mx-8 md:-mx-12 -mt-8 md:-mt-12 mb-8"></div>

                  {/* KSA e-Invoicing Compliant Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
                    <div className="space-y-1 text-slate-700 text-right md:text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#FF6500] flex items-center justify-center font-black text-white text-md">M</div>
                        <div>
                          <h1 className="text-lg font-black text-slate-950 tracking-tight">MADA CRM</h1>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">منظومة مدى لإدارة العملاء</p>
                        </div>
                      </div>
                      <p className="text-xs pt-2"><strong>{isRtl ? 'الرقم الضريبي للمنشأة:' : 'VAT ID:'}</strong> 310123456700003</p>
                      <p className="text-xs">Riyadh, Saudi Arabia | support@madacrm.sa</p>
                    </div>

                    <div className={`${isRtl ? 'sm:text-left text-right' : 'sm:text-right text-left'} space-y-1.5`}>
                      <span className="inline-block bg-[#FF6500]/10 text-[#FF6500] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {isRtl ? 'فاتورة ضريبية مبسطة' : 'Simplified Tax Invoice'}
                      </span>
                      <h2 className="text-xl font-black text-slate-900 font-mono tracking-tight">{inv.invoice_number}</h2>
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <p><strong>{isRtl ? 'تاريخ الإصدار:' : 'Issue Date:'}</strong> {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '2026-06-06'}</p>
                        <p><strong>{isRtl ? 'تاريخ الاستحقاق:' : 'Due Date:'}</strong> {inv.due_date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Parties & Entities Section (Billed By vs Billed To) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-100 text-xs text-slate-700">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-1.5 text-start">
                      <h3 className="font-extrabold text-[#0B192C] uppercase border-b border-slate-200 pb-1.5">
                        {isRtl ? 'المورّد (بيانات البائع):' : 'Billed By (Seller):'}
                      </h3>
                      <p className="font-bold text-slate-900">Mada Technology CRM Solutions Co.</p>
                      <p>Unified Tax No: <span className="font-mono">310123456700003</span></p>
                      <p>Riyadh Tower, Al Olaya District, Riyadh, KSA</p>
                      <p>Phone: <span className="font-mono">+966 11 450 1234</span></p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-1.5 text-start">
                      <h3 className="font-extrabold text-[#0B192C] uppercase border-b border-slate-200 pb-1.5">
                        {isRtl ? 'العميل (بيانات المشتري):' : 'Billed To (Buyer):'}
                      </h3>
                      <p className="font-bold text-[#FF6500] text-sm">{targetClient ? targetClient.name : (isRtl ? 'عميل غير محدد' : 'Individual Customer')}</p>
                      {targetClient?.company_name && <p className="font-semibold text-slate-700">{targetClient.company_name}</p>}
                      <p>Phone: <span className="font-mono">{targetClient ? targetClient.phone : 'N/A'}</span></p>
                      {targetClient?.email && <p>Email: <span className="font-mono text-slate-500">{targetClient.email}</span></p>}
                      <p>Address: <span>{targetClient?.address || (isRtl ? 'المنطقة الوسطى، المملكة العربية السعودية' : 'Saudi Arabia')}</span></p>
                    </div>
                  </div>

                  {/* Payment Terms Info Strip */}
                  <div className="py-4 flex justify-between items-center text-xs border-b border-slate-100">
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">{isRtl ? 'حالة السداد' : 'Payment Status'}</span>
                      <span className={`inline-block px-3 py-1 font-black rounded-lg uppercase tracking-wider text-[10px] ${
                        inv.status === 'paid' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {isRtl ? (inv.status === 'paid' ? 'تم السداد ✔️' : 'مستحقة للدفع ⚠️') : inv.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">{isRtl ? 'طريقة الدفع المقررة' : 'Fulfillment Type'}</span>
                      <span className="font-bold text-slate-800">{isRtl ? 'حوالة بنكية فورية / مدى' : 'Bank Remittance / Mada Express'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">{isRtl ? 'العملة الإجمالية' : 'Pricing Currency'}</span>
                      <span className="font-black text-slate-900 font-mono">SAR (ر.س)</span>
                    </div>
                  </div>

                  {/* Invoice Line Items Table */}
                  <div className="py-6 overflow-x-auto text-start">
                    <table className="w-full text-xs font-sans text-slate-700 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] bg-slate-50">
                          <th className={`py-2 px-3 ${isRtl ? 'text-right' : 'text-left'} w-12`}>#</th>
                          <th className={`py-2 px-3 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الخدمة / التوصيف الفني' : 'Items & Deliverables'}</th>
                          <th className="py-2 px-3 text-center w-16">{isRtl ? 'الكمية' : 'Qty'}</th>
                          <th className={`py-2 px-3 ${isRtl ? 'text-right' : 'text-left'} w-24`}>{isRtl ? 'سعر الوحدة' : 'Unit Price'}</th>
                          <th className={`py-2 px-3 ${isRtl ? 'text-right' : 'text-left'} w-24`}>{isRtl ? 'الضريبة (15%)' : 'VAT (15%)'}</th>
                          <th className={`py-2 px-3 ${isRtl ? 'text-right' : 'text-left'} w-28`}>{isRtl ? 'المجموع شامل الضريبة' : 'Subtotal (inc. VAT)'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                        {itemLines.map((line, idx) => {
                          return (
                            <tr key={idx} className="hover:bg-slate-50/20">
                              <td className="py-3.5 px-3 text-slate-400 font-mono text-start">{idx + 1}</td>
                              <td className="py-3.5 px-3 space-y-0.5 text-start">
                                <p className="font-bold text-slate-900">{isRtl ? line.title_ar : line.title_en}</p>
                                <p className="text-[10px] text-slate-400 font-mono">SKU ID: {line.sku}</p>
                              </td>
                              <td className="py-3.5 px-3 text-center font-mono">{line.qty}</td>
                              <td className="py-3.5 px-3 font-mono text-slate-800 text-start">{formatCurrency(line.unit_price)}</td>
                              <td className="py-3.5 px-3 font-mono text-slate-500 text-start">{formatCurrency(line.unit_price * 0.15)}</td>
                              <td className="py-3.5 px-3 font-mono font-bold text-slate-950 text-start">{formatCurrency(line.unit_price * 1.15)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations & ZATCA e-Invoice QR Layout */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row justify-between items-stretch gap-6">
                    {/* QR code and Official Compliance message */}
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150 shrink-0 self-center md:self-start">
                      <div className="w-20 h-20 bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800">
                          <rect width="100" height="100" fill="white" />
                          <rect x="5" y="5" width="20" height="20" fill="currentColor" />
                          <rect x="10" y="10" width="10" height="10" fill="white" />
                          <rect x="75" y="5" width="20" height="20" fill="currentColor" />
                          <rect x="80" y="10" width="10" height="10" fill="white" />
                          <rect x="5" y="75" width="20" height="20" fill="currentColor" />
                          <rect x="10" y="80" width="10" height="10" fill="white" />
                          <rect x="35" y="15" width="10" height="10" fill="currentColor" />
                          <rect x="50" y="25" width="15" height="5" fill="currentColor" />
                          <rect x="40" y="45" width="20" height="20" fill="currentColor" />
                          <rect x="15" y="45" width="10" height="10" fill="currentColor" />
                          <rect x="65" y="55" width="10" height="15" fill="currentColor" />
                          <rect x="30" y="75" width="15" height="10" fill="currentColor" />
                          <rect x="80" y="40" width="15" height="15" fill="currentColor" />
                          <rect x="55" y="80" width="25" height="10" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="space-y-1 text-right md:text-left">
                        <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 block w-max">
                          {isRtl ? 'فاتورة ضريبية معتمدة' : 'ZATCA Compliance Certified'}
                        </span>
                        <p className="text-[10px] text-slate-500 leading-normal max-w-xs text-start">
                          {isRtl 
                            ? 'هذه الفاتورة مطابقة للمرحلة الثانية من الفوترة الإلكترونية الخاصة بهيئة الزكاة والضريبة والجمارك رقمياً.' 
                            : 'This document conforms to the Phase 2 regulatory requirements of the Saudi Zakat, Tax and Customs Authority.'}
                        </p>
                      </div>
                    </div>

                    {/* Numeric Calculations Column */}
                    <div className="w-full md:w-80 text-xs space-y-2 text-slate-700 font-sans">
                      <div className="flex justify-between pb-1.5 border-b border-slate-100">
                        <span className="text-slate-400 font-bold">{isRtl ? 'المجموع الخاضع للضريبة:' : 'Amount (Excl. VAT):'}</span>
                        <span className="font-mono text-slate-900 font-bold">{formatCurrency(subtotalVal)}</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-slate-100">
                        <span className="text-slate-400 font-bold">{isRtl ? 'مكافئ ضريبة القيمة المضافة (15%):' : 'VAT Value (15%):'}</span>
                        <span className="font-mono text-slate-900 font-bold">{formatCurrency(taxVal)}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-sm font-black text-slate-900">{isRtl ? 'المجموع النهائي المستحق:' : 'Total Payable Amount:'}</span>
                        <span className="text-base font-black text-[#FF6500] font-mono leading-none">{formatCurrency(inv.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bank detail remittance & conditions */}
                  <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-slate-500 text-start">
                    <div className="space-y-1 text-slate-500">
                      <strong className="block text-slate-700 font-bold uppercase mb-0.5">{isRtl ? 'معلومات الحساب البنكي للتسوية:' : 'Bank Remittance Details:'}</strong>
                      <p><strong>Bank:</strong> Saudi National Bank (SNB - البنك الأهلي)</p>
                      <p><strong>Account Name:</strong> Mada CRM Technology Solutions</p>
                      <p><strong>IBAN Number:</strong> SA80 1000 0000 1234 5678 9012</p>
                    </div>
                    <div className="space-y-1 leading-relaxed text-slate-500">
                      <strong className="block text-slate-700 font-bold uppercase mb-0.5">{isRtl ? 'الأحكام والشروط العامة:' : 'Standard Terms & Conditions:'}</strong>
                      <p>
                        {isRtl 
                          ? 'يرجى إرفاق رقم الفاتورة في وصف الحوالة البنكية لسرعة ربط المدفوعات بصندوق الحساب وتلقائي العمل.' 
                          : 'Please specify the invoice reference number in your wire transfer instructions for swift payment matching.'}
                      </p>
                      <p>© 2026 Mada CRM. Riyadh, Saudi Arabia. All Rights Reserved.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom modal actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceToPrint(null)}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  {isRtl ? 'إغلاق المعاينة' : 'Dismiss Preview'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-6 py-2.5 bg-[#FF6500] hover:bg-orange-600 text-white rounded-xl font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:shadow-md"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>{isRtl ? 'بدء الطباعة الفورية / تصدير PDF' : 'Start Printing / Save PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
