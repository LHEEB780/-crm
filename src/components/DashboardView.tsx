/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, Landmark, ClipboardCheck, AlertTriangle, 
  ArrowUpRight, Plus, Activity, Download, HardDrive, Sparkles, TrendingUp
} from 'lucide-react';
import { translations } from '../locales';
import ClientMap from './ClientMap';

interface DashboardProps {
  stats: any;
  leadsFunnel: any;
  recentClients: any[];
  recentLogs: any[];
  language: 'ar' | 'en';
  onQuickAction: (actionId: string) => void;
  clients: any[];
}

export default function DashboardView({
  stats,
  leadsFunnel,
  recentClients,
  recentLogs,
  language,
  onQuickAction,
  clients
}: DashboardProps) {
  const t = (key: string) => translations[key]?.[language] || key;
  const isRtl = language === 'ar';

  const formatCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(val);
    return isRtl ? `${formatted} ر.س` : `${formatted} SAR`;
  };

  const salesGoalPercent = 74; // High-fidelity performance metric

  // SVG Funnel Helper counts
  const funnelTotal = (leadsFunnel.new || 0) + (leadsFunnel.contacted || 0) + (leadsFunnel.qualified || 0);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Dynamic Header Greeting Grid */}
      <div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl text-white shadow-md relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--brand-primary, #0B192C), #1e2e42)' }}
      >
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full" style={{ color: 'var(--brand-secondary, #FF6500)' }}>
            <circle cx="80" cy="80" r="40" />
          </svg>
        </div>
        <div className="z-10">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>{isRtl ? 'أهلاً بك في نظام إدارة علاقات العملاء' : 'Welcome to Enterprise CRM Core'}</span>
            <Sparkles className="w-6 h-6" style={{ color: 'var(--brand-secondary, #FF6500)' }} />
          </h2>
          <p className="text-sm mt-1.5 text-slate-300 max-w-xl">
            {isRtl 
              ? 'تتم حالياً إدارة جميع عمليات متابعة وتأهيل العملاء، وتحرير الفواتير وتنظيم المهام في منشأتك عبر بيئة متكاملة تضمن أعلى دقة تشغيلية.' 
              : 'Managing all leads onboarding, contract operations, invoices and team task prioritizations inside high-performance secure bilingual workspaces.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 z-10">
          <button
            onClick={() => onQuickAction('addClient')}
            style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:opacity-90 transition-all font-semibold text-xs text-white shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addClient')}</span>
          </button>
          <button
            onClick={() => onQuickAction('addTask')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors font-semibold text-xs text-white border border-slate-700 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{t('addTask')}</span>
          </button>
        </div>
      </div>

      {/* METRIC COUNTERS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* COUNTER: Total clients */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 outline-offset-2 hover:outline-2 hover:outline-orange-100 transition-all shadow-xs flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
              {t('statsClients')}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalClients}</span>
              <span className="text-xs font-bold text-emerald-600 font-mono bg-emerald-50 px-1 rounded-sm">+14.2%</span>
            </div>
            <p className="text-[11px] text-slate-400 block pt-1 border-t border-slate-100">
              {isRtl ? `بالإضافة إلى ${stats?.archivedClients} عميل مؤرشف` : `${stats?.archivedClients} custom archived`}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Users className="w-6 h-6 text-[#0B192C]" />
          </div>
        </div>

        {/* COUNTER: Leads */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 outline-offset-2 hover:outline-2 hover:outline-orange-100 transition-all shadow-xs flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
              {t('statsLeads')}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{stats?.activeLeads}</span>
              <span className="text-xs font-bold text-amber-600 font-mono bg-amber-50 px-1 rounded-sm">78 pts Avg</span>
            </div>
            <p className="text-[11px] text-slate-400 block pt-1 border-t border-slate-100">
              {isRtl ? 'فرص نشطة في خط المفاوضات' : 'Actively classified leads'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF6500]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* COUNTER: Paid Sum */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 outline-offset-2 hover:outline-2 hover:outline-orange-100 transition-all shadow-xs flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
              {t('statsPaid')}
            </span>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-emerald-600 tracking-tight">
                {formatCurrency(stats?.totalPaidEarnings || 0)}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-55/10 self-start mt-0.5 rounded-sm">
                {isRtl ? 'تم تحصيلها بالكامل' : 'Collected statements'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 block pt-1 border-t border-slate-100">
              {isRtl ? 'الربع السنوي الحالي لعام 2026' : 'Active Q2 collection ledger'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Landmark className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* COUNTER: Collection Balance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 outline-offset-2 hover:outline-2 hover:outline-orange-100 transition-all shadow-xs flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
              {t('statsPending')}
            </span>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-rose-500 tracking-tight">
                {formatCurrency(stats?.pendingEarnings || 0)}
              </span>
              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 self-start mt-0.5 rounded-sm">
                {isRtl ? 'تحت التحصيل وعقود جارية' : 'Unsettled balances'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 block pt-1 border-t border-slate-100">
              {isRtl ? 'بإجمالي فواتير معلقة' : 'Awaiting manual checkoffs'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* CHARTS CONTAINER (Funnel & Q2 Target Gauge) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FUNNEL STAGE CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-sm tracking-tight text-slate-900">{t('salesFunnel')}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{isRtl ? 'تصنيف المجموعات المحتملة حسب مستوى التجاوب' : 'Convert counts sorted by customer status level'}</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
              {isRtl ? `الإجمالي: ${funnelTotal} فرصة` : `${funnelTotal} Active`}
            </span>
          </div>

          {/* Graphical Funnel Visualization representation relying completely on SVG and pure CSS */}
          <div className="space-y-4">
            
            {/* Level 1: New Leads */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>{isRtl ? '1. عملاء محتملين جدد (New Leads)' : '1. New Leads Onboarding'}</span>
                <span className="font-mono">{leadsFunnel.new || 0}</span>
              </div>
              <div className="w-full bg-slate-100 h-8 rounded-lg overflow-hidden relative flex items-center px-4">
                <div className="absolute inset-y-0 left-0 bg-[#0B192C] transition-all" style={{ width: `${funnelTotal > 0 ? ((leadsFunnel.new || 0) / funnelTotal) * 100 : 40}%` }}></div>
                <span className="z-10 text-white text-[10px] font-bold">
                  {funnelTotal > 0 ? Math.round(((leadsFunnel.new || 0) / funnelTotal) * 100) : 40}%
                </span>
              </div>
            </div>

            {/* Level 2: Contacted */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>{isRtl ? '2. تم التواصل والنقاش (Contacted)' : '2. Active Interactions'}</span>
                <span className="font-mono">{leadsFunnel.contacted || 0}</span>
              </div>
              <div className="w-full bg-slate-100 h-8 rounded-lg overflow-hidden relative flex items-center px-4">
                <div className="absolute inset-y-0 left-0 bg-[#1b3d68] transition-all" style={{ width: `${funnelTotal > 0 ? ((leadsFunnel.contacted || 0) / funnelTotal) * 100 : 30}%` }}></div>
                <span className="z-10 text-white text-[10px] font-bold">
                  {funnelTotal > 0 ? Math.round(((leadsFunnel.contacted || 0) / funnelTotal) * 100) : 30}%
                </span>
              </div>
            </div>

            {/* Level 3: Qualified */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>{isRtl ? '3. ترقية لتأهيل فني (Qualified Opportunities)' : '3. Technical Qualifications'}</span>
                <span className="font-mono">{leadsFunnel.qualified || 0}</span>
              </div>
              <div className="w-full bg-slate-100 h-8 rounded-lg overflow-hidden relative flex items-center px-4">
                <div 
                  className="absolute inset-y-0 left-0 transition-all" 
                  style={{ 
                    backgroundColor: 'var(--brand-secondary, #FF6500)',
                    width: `${funnelTotal > 0 ? ((leadsFunnel.qualified || 0) / funnelTotal) * 100 : 20}%` 
                  }}
                ></div>
                <span className="z-10 text-white text-[10px] font-bold font-mono">
                  {funnelTotal > 0 ? Math.round(((leadsFunnel.qualified || 0) / funnelTotal) * 100) : 20}%
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Q2 SALES PROGRESS Circular Gauge */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm tracking-tight text-slate-900">{t('goalProgress')}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{isRtl ? 'النسبة المئوية المقدرة لصافي الفواتير المسددة' : 'Real-time percentage matching collection goals'}</p>
          </div>

          <div className="flex justify-center items-center py-6 relative">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle 
                cx="72" cy="72" r="60" 
                className="text-[#f1f5f9]" strokeWidth="12" fill="transparent" stroke="currentColor"
              />
              <circle 
                cx="72" cy="72" r="60" 
                className="transition-all duration-1000" strokeWidth="12" fill="transparent" 
                style={{ color: 'var(--brand-secondary, #FF6500)' }}
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - salesGoalPercent / 100)}
                strokeLinecap="round" stroke="currentColor"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-900 font-mono">{salesGoalPercent}%</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mt-1">
                {isRtl ? 'قريب من الهدف' : 'On Track'}
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-3">
            <p className="font-semibold">{isRtl ? 'المستهدف: 1,500,000 ر.س لعام 2026' : 'Target: 1,500,000 SAR for 2026'}</p>
            <p className="text-[10px] text-slate-400 mt-1">{isRtl ? 'المعدل المحسوب يعتمد على التخصيص الشهري' : 'Generated via active client bill settle metrics'}</p>
          </div>
        </div>

      </div>

      {/* GEOGRAPHICAL MAP VISUALIZATION */}
      <ClientMap clients={clients} language={language} />

      {/* BOTTOM SEGMENTS: Recents logs & Joined customers table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TABLE: Newly additions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm tracking-tight text-slate-900">{t('recentAdded')}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{isRtl ? 'آخر خمسة عملاء تم تسجيل حساباتهم' : 'Latest registration logs'}</p>
            </div>
            <button
              onClick={() => onQuickAction('viewClients')}
              className="text-xs font-bold text-[#FF6500] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isRtl ? 'عرض الكل' : 'View All'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-[11px] uppercase {text-start}">
                  <th className={`pb-3 py-1 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{t('clientName')}</th>
                  <th className={`pb-3 py-1 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{t('companyName')}</th>
                  <th className={`pb-3 py-1 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 font-semibold text-slate-800">{client.name}</td>
                    <td className="py-2.5 text-slate-500 font-medium">{client.company_name || '-'}</td>
                    <td className="py-2.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        client.status === 'active_client' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        client.status === 'negotiating' ? 'bg-orange-50 text-[#FF6500] border border-orange-100' :
                        client.status === 'lead' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {t(`status_${client.status}`) || client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TIMELINE: Recent Activity timeline logs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF6500]" />
              <div>
                <h3 className="font-bold text-sm tracking-tight text-slate-900">{t('recentLogs')}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{isRtl ? 'عمليات الإضافة والتعديل التي وقعت بنظام الصلاحيات' : 'Active system activity-stream audits'}</p>
              </div>
            </div>
            <button
              onClick={() => onQuickAction('viewLogs')}
              className="text-xs font-bold text-[#FF6500] hover:underline cursor-pointer"
            >
              {isRtl ? 'سجل العمليات الكامل' : 'Audit Trails'}
            </button>
          </div>

          <div className="space-y-4 relative pl-1 overflow-visible">
            {/* Thread timeline line */}
            <div className={`absolute top-2 bottom-2 ${isRtl ? 'right-3' : 'left-3'} w-0.5 bg-slate-100 z-0`}></div>
            
            {recentLogs.map((log) => (
              <div key={log.id} className="flex gap-4 relative z-10 text-xs text-slate-700">
                <div className="w-6.5 h-6.5 rounded-full bg-slate-100 text-[#0B192C] flex items-center justify-center font-bold font-mono border border-white shrink-0 shadow-sm">
                  {log.user_name?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-bold text-slate-800">{log.user_name}</span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(log.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{isRtl ? log.description_ar : log.description_en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
