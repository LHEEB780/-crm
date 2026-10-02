/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, Save, Mail, Database, Palette, 
  Download, ShieldAlert, Sparkles, Sliders, RefreshCw,
  Check, Coins, AlertCircle, CheckCircle
} from 'lucide-react';
import { translations } from '../locales';

const colorPresets = [
  {
    id: 'default',
    nameAr: 'النهدي البرتقالي الموصى به',
    nameEn: 'Nahdi Brilliant Orange',
    primary: '#0B192C',
    secondary: '#FF6500'
  },
  {
    id: 'emerald',
    nameAr: 'الواحة الخضراء الهادئة',
    nameEn: 'Emerald Oasis Green',
    primary: '#064E3B',
    secondary: '#10B981'
  },
  {
    id: 'violet_gold',
    nameAr: 'البنفسجي الإمبراطوري والذهبي',
    nameEn: 'Imperial Violet Gold',
    primary: '#4C1D95',
    secondary: '#F59E0B'
  },
  {
    id: 'slate_crimson',
    nameAr: 'الرمادي الفولاذي والأحمر',
    nameEn: 'Slate & Crimson Bold',
    primary: '#1E293B',
    secondary: '#EF4444'
  },
  {
    id: 'ocean_breeze',
    nameAr: 'الأزرق البحري الفاخر',
    nameEn: 'Luxury Teal Depth',
    primary: '#0F3057',
    secondary: '#008891'
  },
  {
    id: 'burgundy_rose',
    nameAr: 'الأحمر الملكي والوردي كلاسيك',
    nameEn: 'Ruby Red & Rose Gold',
    primary: '#74154B',
    secondary: '#FA709A'
  },
  {
    id: 'sunset_glow',
    nameAr: 'وهج الصحراء والغروب',
    nameEn: 'Desert Sunset Glow',
    primary: '#2F1245',
    secondary: '#FD3A69'
  },
  {
    id: 'charcoal_neon',
    nameAr: 'الفحم التقني والسيان المنعش',
    nameEn: 'Tech Charcoal & Neon Cyan',
    primary: '#0F172A',
    secondary: '#06B6D4'
  }
];

const currenciesList = [
  { code: 'SAR', symbolAr: 'ر.س', labelAr: 'ريال سعودي (SAR)', labelEn: 'Saudi Riyal (SAR)' },
  { code: 'AED', symbolAr: 'د.إ', labelAr: 'درهم إماراتي (AED)', labelEn: 'UAE Dirham (AED)' },
  { code: 'KWD', symbolAr: 'د.ك', labelAr: 'دينار كويتي (KWD)', labelEn: 'Kuwaiti Dinar (KWD)' },
  { code: 'QAR', symbolAr: 'ر.ق', labelAr: 'ريال قطري (QAR)', labelEn: 'Qatari Riyal (QAR)' },
  { code: 'BHD', symbolAr: 'د.ب', labelAr: 'دينار بحريني (BHD)', labelEn: 'Bahraini Dinar (BHD)' },
  { code: 'OMR', symbolAr: 'ر.ع', labelAr: 'ريال عماني (OMR)', labelEn: 'Omani Rial (OMR)' },
  { code: 'EGP', symbolAr: 'ج.م', labelAr: 'جنيه مصري (EGP)', labelEn: 'Egyptian Pound (EGP)' },
  { code: 'USD', symbolAr: '$', labelAr: 'دولار أمريكي (USD)', labelEn: 'US Dollar (USD)' },
  { code: 'EUR', symbolAr: '€', labelAr: 'يورو (EUR)', labelEn: 'Euro (EUR)' },
  { code: 'GBP', symbolAr: '£', labelAr: 'جنيه إسترليني (GBP)', labelEn: 'British Pound (GBP)' },
  { code: 'IQD', symbolAr: 'د.ع', labelAr: 'دينار عراقي (IQD)', labelEn: 'Iraqi Dinar (IQD)' },
  { code: 'JOD', symbolAr: 'د.أ', labelAr: 'دينار أردني (JOD)', labelEn: 'Jordanian Dinar (JOD)' }
];


interface SettingsProps {
  language: 'ar' | 'en';
  onRefreshData?: () => void;
}

export default function SettingsView({
  language,
  onRefreshData
}: SettingsProps) {
  const t = (key: string) => translations[key]?.[language] || key;
  const isRtl = language === 'ar';

  const [saving, setSaving] = useState(false);
  const [backupTriggered, setBackupTriggered] = useState(false);
  const [killing, setKilling] = useState(false);
  const [showConfirmKill, setShowConfirmKill] = useState(false);
  const [killSuccess, setKillSuccess] = useState(false);

  // Status and color save notifications
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [colorSavedToast, setColorSavedToast] = useState(false);
  const [savingColors, setSavingColors] = useState(false);

  const handleKillSwitch = async () => {
    setKilling(true);
    try {
      const res = await fetch('/api/ai-robots/kill-switch', { method: 'POST' });
      if (res.ok) {
        setKillSuccess(true);
        setShowConfirmKill(false);
        if (onRefreshData) onRefreshData();
      } else {
        setSaveErrorMsg(isRtl ? 'فشل الاتصال بخدمة بروتوكول الطوارئ.' : 'Failed to connect to the Emergency Safety Protocol Service.');
        setTimeout(() => setSaveErrorMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setKilling(false);
    }
  };

  const [smtpConf, setSmtpConf] = useState({
    host: 'smtp.sendgrid.net',
    port: '465',
    user: 'crm_admin_delivery@nahdiservices.sa',
    encryption: 'ssl/tls'
  });

  const [brandConf, setBrandConf] = useState({
    name: 'النهدي قنوات مبيعات متطابقة',
    email: 'laheeblaheeb0@gmail.com',
    phone: '+966112223333',
    p_color: '#0B192C',
    s_color: '#FF6500',
    currency: 'SAR',
    currency_ar: 'ر.س'
  });

  const applyThemeColors = (primary: string, secondary: string) => {
    try {
      if (primary) document.documentElement.style.setProperty('--brand-primary', primary);
      if (secondary) document.documentElement.style.setProperty('--brand-secondary', secondary);
      localStorage.setItem('crm_theme_primary', primary);
      localStorage.setItem('crm_theme_secondary', secondary);
      window.dispatchEvent(new CustomEvent('crm-theme-changed', {
        detail: { primary, secondary }
      }));
    } catch (e) {
      console.error('Failed to apply theme colors:', e);
    }
  };

  // Dedicated direct color saver (applies and saves immediately without requiring email or form submit)
  const handleColorSelectAndSave = async (primary: string, secondary: string) => {
    setBrandConf(prev => ({
      ...prev,
      p_color: primary,
      s_color: secondary
    }));
    applyThemeColors(primary, secondary);
    setSavingColors(true);
    setColorSavedToast(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_color: primary,
          secondary_color: secondary
        })
      });
      if (res.ok) {
        setColorSavedToast(true);
        setTimeout(() => setColorSavedToast(false), 3500);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed auto-saving colors:', err);
    } finally {
      setSavingColors(false);
    }
  };

  React.useEffect(() => {
    // Initial load from standard database API:
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSmtpConf({
            host: data.mail_host || 'smtp.sendgrid.net',
            port: String(data.mail_port || '465'),
            user: data.mail_username || 'crm_admin_delivery@nahdiservices.sa',
            encryption: data.mail_encryption || 'ssl/tls'
          });
          const pColor = data.primary_color || '#0B192C';
          const sColor = data.secondary_color || '#FF6500';
          setBrandConf({
            name: data.company_name_ar || 'النهدي قنوات مبيعات متطابقة',
            email: data.email || 'laheeblaheeb0@gmail.com',
            phone: data.phone || '+966112223333',
            p_color: pColor,
            s_color: sColor,
            currency: data.currency_en || 'SAR',
            currency_ar: data.currency_ar || 'ر.س'
          });
          applyThemeColors(pColor, sColor);
        }
      })
      .catch(err => console.error('Failed reading settings:', err));
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
    
    // Save to server data persistence endpoints
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name_ar: brandConf.name,
        company_name_en: 'Nahdi Sales CRM Channels',
        address_ar: 'الرياض، المملكة العربية السعودية',
        address_en: 'Riyadh, Kingdom of Saudi Arabia',
        email: brandConf.email || '',
        phone: brandConf.phone || '',
        tax_rate: 15,
        currency_en: brandConf.currency,
        currency_ar: brandConf.currency_ar,
        primary_color: brandConf.p_color,
        secondary_color: brandConf.s_color,
        mail_driver: 'smtp',
        mail_host: smtpConf.host,
        mail_port: parseInt(smtpConf.port, 10) || 465,
        mail_username: smtpConf.user,
        mail_encryption: smtpConf.encryption,
        backup_interval: 'daily'
      })
    })
    .then(async res => {
      setSaving(false);
      if (res.ok) {
        applyThemeColors(brandConf.p_color, brandConf.s_color);
        if (onRefreshData) onRefreshData();
        setSaveSuccessMsg(isRtl ? 'تم حفظ وتعديل ألوان النظام وإعدادات المؤسسة بنجاح!' : 'Branding configuration and color scheme saved successfully!');
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      } else {
        setSaveErrorMsg(isRtl ? 'حدث خطأ أثناء الاتصال بالخادم لحفظ الإعدادات.' : 'Central database rejected configuration save.');
        setTimeout(() => setSaveErrorMsg(null), 4000);
      }
    })
    .catch(err => {
      console.error('Settings save error:', err);
      setSaving(false);
      setSaveErrorMsg(isRtl ? 'فشل إرسال الإعدادات إلى الخادم.' : 'Could not contact backend settings processor.');
      setTimeout(() => setSaveErrorMsg(null), 4000);
    });
  };

  // Disaster Recovery: download database.sql schema
  const triggerSchemaDownload = () => {
    setBackupTriggered(true);
    
    // Fetch and download the database.sql schema directly
    fetch('/database.sql')
      .then(res => res.text())
      .then(sqlString => {
        const element = document.createElement("a");
        const file = new Blob([sqlString], { type: 'text/sql' });
        element.href = URL.createObjectURL(file);
        element.download = "crm_relational_schema.sql";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        setTimeout(() => setBackupTriggered(false), 2000);
      })
      .catch(err => {
        // Fallback static copy if request does not resolve within Sandbox
        console.error("Schema fetch failure, providing static download fallback", err);
        const fallbackSchema = `-- CRM Relational Database Schema Backup\nCREATE DATABASE IF NOT EXISTS crm_database;\nUSE crm_database;`;
        const element = document.createElement("a");
        const file = new Blob([fallbackSchema], { type: 'text/sql' });
        element.href = URL.createObjectURL(file);
        element.download = "crm_relational_schema_backup.sql";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setTimeout(() => setBackupTriggered(false), 2000);
      });
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs font-serif">
      
      {/* BANNER SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t('settings')}</span>
            <Settings className="w-5 h-5 text-[#FF6500]" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl ? 'تهيئة خوادم البريد الإلكتروني SMTP، وإدارة ألوان الهوية المؤسسية، واسترجاع قواعد البيانات والعمليات الاحتياطية للسلامة.' : 'Adjust SMTP configurations, system defaults, corporate colors and disaster backup recovery procedures.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: BRAND CONFIG & MAILING CONFIG */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification Messages */}
          {saveSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}
          {saveErrorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{saveErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} noValidate className="space-y-6">
            
            {/* 1. SMTP Server Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-[#0B192C] pb-2 border-b border-slate-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500" />
                <span>{isRtl ? 'إعدادات خادم البريد والاشعارات التلقائية (SMTP)' : 'Outgoing Email SMTP Configuration'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">SMTP Host Mail Server</label>
                  <input
                    type="text"
                    value={smtpConf.host}
                    onChange={(e) => setSmtpConf({...smtpConf, host: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">SMTP Port Link</label>
                  <input
                    type="text"
                    value={smtpConf.port}
                    onChange={(e) => setSmtpConf({...smtpConf, port: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">SMTP Username Identity</label>
                  <input
                    type="text"
                    value={smtpConf.user}
                    onChange={(e) => setSmtpConf({...smtpConf, user: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Encryption Standard</label>
                  <select
                    value={smtpConf.encryption}
                    onChange={(e) => setSmtpConf({...smtpConf, encryption: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="ssl/tls">SSL/TLS Security</option>
                    <option value="starttls">STARTTLS Server</option>
                    <option value="none">None unencrypted</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Platform Brand Guidelines */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <h3 className="font-extrabold text-[#0B192C] pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-2 font-serif text-sm">
                  <Palette className="w-4 h-4 text-[#FF6500]" />
                  <span>{isRtl ? 'تخصيص هوية وعملة النظام' : 'Visual Identity & System Defaults'}</span>
                </span>
                <span className="text-[10px] bg-amber-50 text-[#FF6500] font-bold uppercase px-2 py-0.5 rounded-lg border border-amber-200">
                  {isRtl ? 'تهيئة الهوية' : 'Corporate Identity'}
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">{isRtl ? 'مسمى النظام المخصص' : 'System Custom Name'}</label>
                  <input
                    type="text"
                    value={brandConf.name}
                    onChange={(e) => setBrandConf({...brandConf, name: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-sans text-slate-800 focus:ring-2 focus:ring-[#FF6500]/20 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isRtl ? 'العملة الأساسية لنظام المبيعات' : 'Primary Sales Currency'}</span>
                  </label>
                  <select
                    value={brandConf.currency}
                    onChange={(e) => {
                      const selected = currenciesList.find(c => c.code === e.target.value);
                      if (selected) {
                        setBrandConf({
                          ...brandConf,
                          currency: selected.code,
                          currency_ar: selected.symbolAr
                        });
                      }
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-xs font-bold font-sans cursor-pointer text-slate-800 focus:ring-2 focus:ring-[#FF6500]/20 focus:outline-hidden"
                  >
                    {currenciesList.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {isRtl ? `${curr.labelAr} [${curr.symbolAr}]` : `${curr.labelEn} [${curr.code}]`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SYSTEM EMAIL & CONTACT PHONE INPUT FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#FF6500]" />
                    <span>{isRtl ? 'البريد الإلكتروني المعتمد للنظام / المؤسسة' : 'System & Official Email Address'}</span>
                  </label>
                  <input
                    type="text"
                    value={brandConf.email}
                    onChange={(e) => setBrandConf({...brandConf, email: e.target.value})}
                    placeholder="laheeblaheeb0@gmail.com"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 bg-white focus:ring-2 focus:ring-[#FF6500]/20 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">
                    {isRtl ? 'رقم الهاتف الرسمي للمؤسسة' : 'Official Contact Phone'}
                  </label>
                  <input
                    type="text"
                    value={brandConf.phone}
                    onChange={(e) => setBrandConf({...brandConf, phone: e.target.value})}
                    placeholder="+966 11 222 3333"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 bg-white focus:ring-2 focus:ring-[#FF6500]/20 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* HARMONIOUS PALETTES PRESETS GRID */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-600 block">
                    {isRtl ? 'خيارات ألوان متناهية التناسق والمظهر' : 'Harmonious Match Color Palettes'}
                  </label>
                  <span className="text-[10px] text-[#FF6500] font-bold">
                    {isRtl ? '⚡ اضغط على أي لون ليتم حفظه وتطبيقه فوراً وبدون بريد' : '⚡ Click any palette to apply & save instantly'}
                  </span>
                </div>

                {colorSavedToast && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? '✅ تم حفظ وتطبيق ألوان النظام بنجاح فوري وبدون الحاجة لبريد إلكتروني!' : '✅ Theme colors saved and applied instantly!'}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {colorPresets.map((preset) => {
                    const isActive = brandConf.p_color.toLowerCase() === preset.primary.toLowerCase() &&
                                     brandConf.s_color.toLowerCase() === preset.secondary.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleColorSelectAndSave(preset.primary, preset.secondary)}
                        className={`p-2.5 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between h-20 group relative overflow-hidden ${
                          isActive 
                            ? 'border-[#FF6500] bg-orange-50/10 shadow-xs ring-2 ring-[#FF6500]/50' 
                            : 'border-slate-200 hover:border-[#FF6500] hover:bg-slate-50 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          {/* Colored overlapping badges */}
                          <div className="flex -space-x-1.5 rtl:space-x-reverse items-center">
                            <span className="w-5.5 h-5.5 rounded-full border border-white shadow-xs block shrink-0" style={{ backgroundColor: preset.primary }}></span>
                            <span className="w-5.5 h-5.5 rounded-full border border-white shadow-xs block shrink-0" style={{ backgroundColor: preset.secondary }}></span>
                          </div>
                          {isActive && (
                            <span className="bg-[#FF6500] text-white p-0.5 rounded-full block shrink-0">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-[10px] w-full font-sans tracking-tight text-slate-800">
                          <span className="font-bold block truncate">{isRtl ? preset.nameAr : preset.nameEn}</span>
                          <span className="text-[8px] text-slate-400 font-mono mt-0.5 block truncate">
                            {preset.primary} + {preset.secondary}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MANUAL ADJUST CODES */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#0B192C] uppercase tracking-wider block">
                    {isRtl ? 'تخصيص الألوان يدويًا (كود هيكس)' : 'Precision Manual Hex Coloring'}
                  </span>
                  <button
                    type="button"
                    disabled={savingColors}
                    onClick={() => handleColorSelectAndSave(brandConf.p_color, brandConf.s_color)}
                    style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                    className="px-3 py-1 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {savingColors ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    <span>{isRtl ? 'حفظ الألوان فوراً' : 'Save Colors'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 block">{isRtl ? 'اللون الأساسي (Dark Color)' : 'Primary Accent Color'}</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={brandConf.p_color}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBrandConf({...brandConf, p_color: val});
                          applyThemeColors(val, brandConf.s_color);
                        }}
                        className="w-10 h-10 rounded-lg border border-slate-200 shrink-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={brandConf.p_color}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBrandConf({...brandConf, p_color: val});
                          applyThemeColors(val, brandConf.s_color);
                        }}
                        className="flex-1 p-2 text-center border border-slate-200 rounded-lg font-mono text-xs text-slate-700 bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 block">{isRtl ? 'اللون الثانوي (Brilliant Highlight)' : 'Secondary Color'}</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={brandConf.s_color}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBrandConf({...brandConf, s_color: val});
                          applyThemeColors(brandConf.p_color, val);
                        }}
                        className="w-10 h-10 rounded-lg border border-slate-200 shrink-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={brandConf.s_color}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBrandConf({...brandConf, s_color: val});
                          applyThemeColors(brandConf.p_color, val);
                        }}
                        className="flex-1 p-2 text-center border border-slate-200 rounded-lg font-mono text-xs text-slate-700 bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
              className="px-6 py-3 rounded-xl text-white font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:opacity-90 disabled:opacity-50"
            >
              <Save className="w-4 h-4" style={{ color: 'var(--brand-secondary, #FF6500)' }} />
              <span>{saving ? (isRtl ? 'جاري الحفظ...' : 'Saving updates...') : (isRtl ? 'حفظ التغييرات الهيكلية' : 'Commit Configuration')}</span>
            </button>

          </form>
        </div>

        {/* RIGHT COLUMN: DISASTER RECOVERY & SYSTEM BACKUPS SQL EXPORT */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-[#FF6500] flex items-center gap-2 pb-2.5 border-b border-slate-800">
              <Database className="w-4.5 h-4.5 text-orange-400" />
              <span>{isRtl ? 'قسم النسخ الاحتياطي وحماية قواعد البيانات' : 'Disaster Recovery & SQL Engine'}</span>
            </h3>

            <p className="text-[11px] text-slate-300 leading-relaxed font-serif">
              {isRtl 
                ? 'تحميل وبث الملحق الكامل لهيكلية MySQL. يتم تصدير جداول الفواتير، وممثلي المبيعات، ومستويات الرتب الأمنية، والأولويات التشغيلية للنسخ المباشر.'
                : 'Directly extract local relational database structures including index parameters, permissions schemas and sample data rows.'}
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">ENGINE PORT:</span>
                <span className="font-mono text-emerald-400 font-bold">3306 (MySQL)</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">SCHEMATIC CHAR:</span>
                <span className="font-mono text-emerald-400 font-bold">utf8mb4_unicode_ci</span>
              </div>
            </div>

            <button
              onClick={triggerSchemaDownload}
              disabled={backupTriggered}
              className="w-full py-3 px-4 bg-[#FF6500] hover:bg-orange-600 disabled:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md text-xs"
            >
              {backupTriggered ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{isRtl ? 'جاري تجميع الملف...' : 'Packaging Schema...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-orange-200" />
                  <span>{isRtl ? 'تحميل ملف database.sql المحدث' : 'Download database.sql'}</span>
                </>
              )}
            </button>
          </div>

          {/* EMERGENCY SYSTEM OVERRIDE / KILL SWITCH CARD */}
          <div className="bg-red-950 text-white p-6 rounded-2xl border border-red-800 space-y-4 shadow-md relative overflow-hidden">
            {/* Pulsing glow background decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl -mr-10 -mt-10 ${!killSuccess ? 'animate-pulse' : ''}`} />
            
            <h3 className="font-extrabold text-red-400 flex items-center gap-2 pb-2.5 border-b border-red-900 justify-between">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <span className="font-serif">{isRtl ? 'المفتاح الشامل لإخماد الطوارئ' : 'Emergency Robot Kill Switch'}</span>
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-sm font-bold font-mono ${killSuccess ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                {killSuccess 
                  ? (isRtl ? 'تم الإيقاف 🔴' : 'TERMINATED 🔴') 
                  : (isRtl ? 'نشط وقيد الخدمة 🟢' : 'SECURE 🟢')}
              </span>
            </h3>

            <p className="text-[11px] text-red-200 leading-relaxed font-sans">
              {isRtl 
                ? 'إجراء وقائي فوري يُعطل كافة روبوتات الذكاء الاصطناعي النشطة تلقائياً بضغطة واحدة، لوقف عمليات الفحص وتأهيل الصفقات واقتطاع الفواتير لتفادي أي سلوك غير متوقع.'
                : 'Primary system override to instantly suspend all active AI routines. This terminates lead sorting, automated escalators, and audits immediately.'}
            </p>

            <div className="bg-red-950/60 p-3 rounded-lg border border-red-900 text-[10px] space-y-1 text-red-300 font-mono">
              <div className="flex justify-between">
                <span>SYSTEM TARGETS:</span>
                <span>ALL AI CLIENTS</span>
              </div>
              <div className="flex justify-between">
                <span>AUDIT RECORDING:</span>
                <span className="text-red-400">ENABLED (activity_logs)</span>
              </div>
            </div>

            {killSuccess ? (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded-xl text-center space-y-2">
                <p className="text-[11px] text-red-200 font-bold">
                  {isRtl 
                    ? '🔔 تم تفعيل وضع الطوارئ؛ جرى تجميد كافة العمليات وإرسال السجل لقاعدة.' 
                    : '🔔 Override successful! All connected AI agents are offline.'}
                </p>
                <button
                  onClick={() => {
                    setKillSuccess(false);
                    setShowConfirmKill(false);
                  }}
                  className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded-md text-[10px] font-bold cursor-pointer transition-all"
                >
                  {isRtl ? 'تحضير النظام للمسح مجدداً' : 'Clear Alert Status'}
                </button>
              </div>
            ) : !showConfirmKill ? (
              <button
                onClick={() => setShowConfirmKill(true)}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md text-xs font-sans tracking-wide"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-100" />
                <span>{isRtl ? 'إطلاق بروتوكول تجميد الروبوتات' : 'ACTIVATE EMERGENCY OVERRIDE'}</span>
              </button>
            ) : (
              <div className="space-y-3 p-3 bg-red-950 border border-red-700/60 rounded-xl">
                <span className="block text-[11px] font-bold text-red-300 text-center animate-pulse">
                  ⚠️ {isRtl ? 'هل أنت متأكد؟ سيتم إيقاف الروبوتات فوراً' : 'CONFIRM IMMUTABLE SHUTDOWN?'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowConfirmKill(false)}
                    className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold cursor-pointer transition-all"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleKillSwitch}
                    disabled={killing}
                    className="py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-950 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    {killing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>☢️ {isRtl ? 'نعم، إيقاف' : 'Yes, Halt'}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
