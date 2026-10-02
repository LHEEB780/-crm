/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart3, FileSpreadsheet, Download, FileText, 
  Search, Sparkles, Filter, ChevronRight, TrendingUp, Award, DollarSign
} from 'lucide-react';
import { translations } from '../locales';
import { Client, Lead, Invoice, Contract } from '../types';

interface ReportsProps {
  clients: Client[];
  leads: Lead[];
  invoices: Invoice[];
  contracts: Contract[];
  language: 'ar' | 'en';
}

export default function ReportsView({
  clients,
  leads,
  invoices,
  contracts,
  language
}: ReportsProps) {
  const t = (key: string) => translations[key]?.[language] || key;
  const isRtl = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [reportType, setReportType] = useState<'financial' | 'pipelines' | 'conversions'>('financial');

  // Math Calculations for Reports
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total_amount), 0);
  const projectedPipeline = leads.reduce((sum, l) => sum + Number(l.expected_revenue), 0);
  const activeAgreementsSum = contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + Number(c.value), 0);

  const conversionPercentage = leads.length > 0
    ? Math.round((leads.filter(l => l.status === 'qualified').length / leads.length) * 100)
    : 0;

  const averageTicket = invoices.length > 0
    ? Math.round(invoices.reduce((sum, i) => sum + i.total_amount, 0) / invoices.length)
    : 0;

  const formatCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(val);
    return isRtl ? `${formatted} ر.س` : `${formatted} SAR`;
  };

  // Mock excel data rows
  const summaryRows = clients.map(cli => {
    const cliInvoices = invoices.filter(i => i.client_id === cli.id);
    const billingTotal = cliInvoices.reduce((sum, i) => sum + i.total_amount, 0);
    const paidTotal = cliInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0);
    const arrearsVal = billingTotal - paidTotal;

    return {
      name: cli.name,
      company: cli.company_name || '-',
      totalInvoiced: billingTotal,
      paid: paidTotal,
      arrears: arrearsVal,
      status: arrearsVal > 0 ? (isRtl ? 'مستحقات معلقة' : 'Outstanding') : (isRtl ? 'مسدد بالكامل' : 'Settled')
    };
  });

  const filteredSummary = summaryRows.filter(row => 
    row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic Trigger to download Excel/CSV data block
  const handleExportCSV = () => {
    const headers = ['Client Name', 'Company', 'Total Invoiced (SAR)', 'Paid (SAR)', 'Arrears (SAR)', 'Status'];
    const rows = filteredSummary.map(r => [r.name, r.company, r.totalInvoiced, r.paid, r.arrears, r.status]);
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.map(v => `"${v}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CRM_Performance_Auditing_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs font-serif">
      
      {/* HEADER BANNER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t('reports')}</span>
            <BarChart3 className="w-5 h-5 text-[#FF6500]" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl ? 'استعراض مراكز الربحية، قيم العقود النشطة، تحليلات التحول والصفقات المغلقة مع إمكانية تصديرها كملفات CSV أو بصيغة PDF.' : 'Corporate financial analytics, contract portfolios and invoice audits equipped with CSV spreadsheet extraction.'}
          </p>
        </div>

        {/* Buttons to export */}
        <div className="flex gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Export CSV Sheet</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Print PDF Overview</span>
          </button>
        </div>
      </div>

      {/* METRIC ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="font-bold text-[10px] uppercase tracking-widest">{isRtl ? 'إيرادات محصلة فعلية' : 'Paid Net Revenue'}</span>
            <DollarSign className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-[#0B192C]">{formatCurrency(totalRevenue)}</p>
          <span className="text-[10px] text-emerald-600 font-bold">✔️ {isRtl ? 'تحصيل ناجح من فواتير العملاء' : 'Secured via client invoices'}</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="font-bold text-[10px] uppercase tracking-widest">{isRtl ? 'عقود تجارية جارية' : 'Running Contract Book'}</span>
            <Award className="w-4.5 h-4.5 text-[#FF6500]" />
          </div>
          <p className="text-xl font-extrabold text-[#0B192C]">{formatCurrency(activeAgreementsSum)}</p>
          <span className="text-[10px] text-[#FF6500] font-bold">📂 {isRtl ? 'مجموع قيم العقود والاتفاقيات' : 'Total legal commitments val'}</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="font-bold text-[10px] uppercase tracking-widest">{isRtl ? 'صفقات بايبلاين مرتقبة' : 'Pipeline Projection'}</span>
            <TrendingUp className="w-4.5 h-4.5 text-blue-500" />
          </div>
          <p className="text-xl font-extrabold text-[#0B192C]">{formatCurrency(projectedPipeline)}</p>
          <span className="text-[10px] text-blue-500 font-bold">🚀 {isRtl ? 'قيم الفرص المتوقعة للمبيعات' : 'Forecasted pipeline valuation'}</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="font-bold text-[10px] uppercase tracking-widest">{isRtl ? 'معدل النجاح والتحويل' : 'Lead Conversion Rate'}</span>
            <Sparkles className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-[#0B192C]">{conversionPercentage}%</p>
          <span className="text-[10px] text-slate-400">CONVERSION SUCCESS RATIO</span>
        </div>

      </div>

      {/* HISTOGRAM BAR CHART SKELETON WITH RELEVANT STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Sales distribution by client categories */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-xs tracking-widest uppercase text-slate-[#0B192C] border-b border-slate-100 pb-2.5">
            {isRtl ? 'مستويات كفاءة الإغلاق الفني' : 'Quarterly Sales funnel yield'}
          </h3>

          <div className="relative pt-6">
            <svg viewBox="0 0 100 60" className="w-full h-auto overflow-visible">
              {/* Funnel level 1: Leads */}
              <polygon points="5,5 95,5 80,15 20,15" fill="#0B192C" opacity="0.95" />
              <text x="50" y="11" fill="white" fontSize="4" textAnchor="middle" fontWeight="bold">Leads Portfolio 100%</text>

              {/* level 2: Contacted opportunities */}
              <polygon points="20,17 80,17 65,30 35,30" fill="#FF6500" opacity="0.9" />
              <text x="50" y="24" fill="white" fontSize="4" textAnchor="middle" fontWeight="bold">Contacted Yield 65%</text>

              {/* level 3: Closed supply contracts */}
              <polygon points="35,32 65,32 55,45 45,45" fill="#3b82f6" />
              <text x="50" y="39" fill="white" fontSize="4" textAnchor="middle" fontWeight="bold">Agreements Closed 35%</text>

              {/* point 4: Settle payment invoices */}
              <polygon points="45,47 55,47 50,56 50,56" fill="#10b981" />
              <text x="50" y="52" fill="white" fontSize="3" textAnchor="middle" fontWeight="bold">Invoiced Settled 24%</text>
            </svg>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 text-center">
            {isRtl ? 'هرم تحويل صفقات العملاء المحتملين إلى اتفاقيات وعقود مبيعات جارية.' : 'Commercial funnel demonstrating client acquisition to settlement yields.'}
          </p>
        </div>

        {/* Corporate Spreadsheet rows visualizer */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-xs tracking-widest uppercase text-slate-[#0B192C]">
              {isRtl ? 'بيانات التقرير المالي للشركاء' : 'Corporate Ledger Sheet Preview'}
            </h3>

            <div className="relative">
              <Search className="absolute top-2 left-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'بحث في الكشوفات...' : 'Search ledger rows...'}
                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-[10px] font-sans"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-start border-collapse text-[11px] font-serif">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150 select-none">
                  <th className={`py-2 px-3 ${isRtl ? 'text-right' : 'text-left'}`}>Contact</th>
                  <th className={`py-2 px-3 ${isRtl ? 'text-right' : 'text-left'}`}>Enterprise</th>
                  <th className="py-2 px-3 text-center">Invoiced (SAR)</th>
                  <th className="py-2 px-3 text-center">Paid (SAR)</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSummary.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 italic">No ledger rows match query</td>
                  </tr>
                ) : (
                  filteredSummary.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{row.name}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">{row.company}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">{formatCurrency(row.totalInvoiced)}</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-black">{formatCurrency(row.paid)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-semibold ${
                          row.arrears > 0 ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
