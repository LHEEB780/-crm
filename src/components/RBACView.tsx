/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, ShieldAlert, KeyRound, Check, HelpCircle, Users, Activity } from 'lucide-react';
import { translations } from '../locales';
import { User } from '../types';

interface RBACProps {
  users: User[];
  activeUser: User | null;
  language: 'ar' | 'en';
}

export default function RBACView({
  users,
  activeUser,
  language
}: RBACProps) {
  const t = (key: string) => translations[key]?.[language] || key;
  const isRtl = language === 'ar';

  // System roles matrix definition
  const rolesDef = [
    { name: 'super_admin', label: t('role_super_admin'), desc: isRtl ? 'له كافة الصلاحيات الإدارية المطلقة والنسخ الاحتياطي وإسناد الصلاحيات.' : 'Full administrative capabilities including back-ups and credentials adjustments' },
    { name: 'sales_manager', label: t('role_sales_manager'), desc: isRtl ? 'له صلاحيات إدارة فروع الشركات والعملاء، ومراسنتهم وتعديل الفواتير وعروض الأسعار.' : 'Manages partner accounts, quotations, bills and schedules team tasks.' },
    { name: 'sales_employee', label: t('role_sales_employee'), desc: isRtl ? 'له صلاحيات محصورة على تسجيل العملاء والمهام ومتابعة الصفقات الجارية والتقويم.' : 'Restricted to client registrations, pipelines, tasks and calendar schedules.' },
    { name: 'supervisor', label: t('role_supervisor'), desc: isRtl ? 'له صلاحيات تقتصر على مراقبة العمل الفني واستعراض التقارير دون تعديلات تجارية.' : 'Monitors technical progress and views summary analytics sheets.' },
    { name: 'regular_user', label: t('role_regular_user'), desc: isRtl ? 'حساب مقيد للاستعراض العام للوحة التحكم دون أي تعديلات أو إدراج بيانات.' : 'Read-only profile restricted to dashboard previews with no edit capabilities.' }
  ];

  // Specific Spatie Permissions
  const permissionGroups = [
    { key: 'view_clients', label: isRtl ? 'عرض بيانات العملاء (Clients)' : 'View Client Profiles', super_admin: true, sales_manager: true, sales_employee: true, supervisor: true, regular_user: true },
    { key: 'edit_clients', label: isRtl ? 'تعديل وإضافة عملاء (Create/Edit)' : 'Create & Edit Client Data', super_admin: true, sales_manager: true, sales_employee: true, supervisor: false, regular_user: false },
    { key: 'delete_clients', label: isRtl ? 'حذف عملاء (Delete)' : 'Delete Client Data', super_admin: true, sales_manager: true, sales_employee: false, supervisor: false, regular_user: false },
    { key: 'manage_companies', label: isRtl ? 'إدارة الشركات والفروع والعقود' : 'Manage Companies & Agreements', super_admin: true, sales_manager: true, sales_employee: false, supervisor: true, regular_user: false },
    { key: 'manage_invoices', label: isRtl ? 'إصدار/تأكيد سداد الفواتير (Invoices)' : 'Manage Invoices & Ledger', super_admin: true, sales_manager: true, sales_employee: false, supervisor: false, regular_user: false },
    { key: 'manage_settings', label: isRtl ? 'التحكم الإداري والنسخ الاحتياطي' : 'Manage Settings & Backups', super_admin: true, sales_manager: false, sales_employee: false, supervisor: false, regular_user: false }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'border-l-4 border-l-rose-500 bg-rose-50/10';
      case 'sales_manager': return 'border-l-4 border-[#FF6500] bg-orange-50/10';
      case 'sales_employee': return 'border-l-4 border-blue-500 bg-blue-50/10';
      case 'supervisor': return 'border-l-4 border-emerald-500 bg-emerald-50/10';
      default: return 'border-l-4 border-slate-300 bg-slate-50/10';
    }
  };

  const getBadgeClass = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-rose-50 text-rose-500 border border-rose-100';
      case 'sales_manager': return 'bg-orange-50 text-[#FF6500] border border-orange-100';
      case 'sales_employee': return 'bg-blue-50 text-blue-500 border border-blue-105';
      case 'supervisor': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs font-serif">
      
      {/* BANNER SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t('rbacTitle')}</span>
            <ShieldCheck className="w-5 h-5 text-[#FF6500]" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl ? 'تطبيق معايير الأمان المعتمدة في لوت لوائح Spatie Permissions لمنع تسريب المعلومات وتقييد الموظفين بالصلاحيات المنصوصة.' : 'Auditing security access levels using role guidelines to enforce compliance and prevent unauthorized resource leaks'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE ROLES DESCRIPTION CARDS */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 pb-2 border-b border-slate-200 flex items-center gap-1.5">
            <Users className="w-4.5 h-4.5 text-[#FF6500]" />
            <span>{isRtl ? 'توصيف أدوار النظام المتاحة' : 'Platform Roles Directory'}</span>
          </h3>

          <div className="space-y-3">
            {rolesDef.map(role => (
              <div 
                key={role.name} 
                className={`p-4 border border-slate-200 rounded-2xl relative space-y-1.5 ${getRoleColor(role.name)} ${
                  activeUser?.role === role.name ? 'ring-2 ring-orange-400' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-800">{role.label}</span>
                  {activeUser?.role === role.name && (
                    <span className="text-[10px] bg-[#FF6500] text-white px-1.5 py-0.5 rounded font-bold font-sans">ACTIVE SESSION</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-serif">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: PERMISSIONS GRID MATRIX & ACTIVE STAFF */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Permission Matrix Grid Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <KeyRound className="w-4.5 h-4.5 text-orange-500" />
              <span>{t('rolePower')}</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-500 font-extrabold select-none border-b border-slate-100 uppercase text-center">
                    <th className={`py-3 px-3 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الصلاحيات الفردية' : 'Spatie Permission Target'}</th>
                    <th className="py-3 px-1.5">Admin</th>
                    <th className="py-3 px-1.5">Manager</th>
                    <th className="py-3 px-1.5">Staff</th>
                    <th className="py-3 px-1.5">Supervisor</th>
                    <th className="py-3 px-1.5">Guest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {permissionGroups.map(grp => (
                    <tr key={grp.key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800">{grp.label}</td>
                      <td className="py-3 px-1.5 text-center">
                        {grp.super_admin ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3 px-1.5 text-center">
                        {grp.sales_manager ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3 px-1.5 text-center">
                        {grp.sales_employee ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3 px-1.5 text-center">
                        {grp.supervisor ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3 px-1.5 text-center">
                        {grp.regular_user ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* List of personnel matching users in the backend database.sql */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Activity className="w-4.5 h-4.5 text-[#FF6500]" />
              <span>{isRtl ? 'المستخدمين وممثلي الحسابات المسجلين' : 'Authorized Personnel Registry'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {users.map(person => (
                <div key={person.id} className="p-4 border border-slate-200 rounded-2xl space-y-2 relative shadow-xs bg-slate-50/20">
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <p className="font-bold text-slate-800">{person.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{person.email}</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active"></span>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                    <span className={`inline-block px-2 py-0.5 rounded font-black uppercase text-[8px] ${getBadgeClass(person.role)}`}>
                      {t(`role_${person.role}`)}
                    </span>
                    <span className="text-slate-400 font-mono text-[9px]">{person.phone || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
