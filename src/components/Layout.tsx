/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Building2, Landmark, 
  CheckSquare, Calendar, ShieldCheck, FileSpreadsheet, 
  Settings, LogOut, Menu, X, Bell, Globe, Sparkles, Database, ShieldAlert,
  Search, Eye, ExternalLink, Briefcase, UserCheck, MessageSquare, Send, Loader2,
  Command, Plus, PlusCircle, UserPlus, CheckCircle2, FolderPlus, ArrowRight, CornerDownLeft, Zap
} from 'lucide-react';
import { translations } from '../locales';
import { User, Client, Lead, Task } from '../types';

interface LayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  activeUser: User | null;
  allUsers: User[];
  onSwitchUser: (userId: number) => void;
  notifications: any[];
  onMarkNotificationRead: (id: number) => void;
  children: React.ReactNode;
  clients?: Client[];
  leads?: Lead[];
  tasks?: Task[];
  onAddClient?: (data: any) => Promise<void>;
  onAddTask?: (data: any) => Promise<void>;
  onAddLead?: (data: any) => Promise<void>;
}

export default function Layout({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  activeUser,
  allUsers,
  onSwitchUser,
  notifications,
  onMarkNotificationRead,
  children,
  clients,
  leads,
  tasks,
  onAddClient,
  onAddTask,
  onAddLead
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);

  // Global Keyboard Shortcuts State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [, setForceThemeUpdate] = useState(0);

  useEffect(() => {
    const onThemeChange = () => setForceThemeUpdate(prev => prev + 1);
    window.addEventListener('crm-theme-changed', onThemeChange);
    return () => window.removeEventListener('crm-theme-changed', onThemeChange);
  }, []);
  const [cmdQuery, setCmdQuery] = useState('');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'client' | 'task' | 'lead'>('client');
  const [quickAddSubmitting, setQuickAddSubmitting] = useState(false);
  const [quickAddSuccess, setQuickAddSuccess] = useState('');

  // Quick Add Form Data States
  const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '', company_name: '', status: 'active_client', notes: '' });
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'medium', due_date: new Date().toISOString().split('T')[0], client_id: '', description: '' });
  const [leadForm, setLeadForm] = useState({ client_id: '', expected_revenue: '50000', source: 'Direct Referral', priority: 'medium', status: 'new' });

  // Keyboard Shortcuts Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey;

      if (isModifier && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        setQuickAddOpen(false);
      } else if (isModifier && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setQuickAddOpen(prev => !prev);
        setCommandPaletteOpen(false);
      } else if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setQuickAddOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; timestamp: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Initialize helper welcome message on language change or mount
  useEffect(() => {
    setChatMessages([
      {
        sender: 'bot',
        text: language === 'ar' 
          ? 'مرحباً بك في مساعد CRM الذكي! 🤖✨\nأنا هنا لمساعدتك بلغة طبيعية في استعلام وتحليل بيانات النظام.\n\nيمكنك أن تسألني أسئلة مثل:\n• "من هو العميل الأعلى دفعاً؟"\n• "ما هي مهامنا العاجلة والحرجة؟"\n• "كم عدد صفقات المبيعات النشطة؟"'
          : 'Welcome to the CRM Smart Assistant! 🤖✨\nI am here to help you query and analyze system data using natural language.\n\nTry asking me questions like:\n• "Who is my highest paying client?"\n• "What are the most urgent tasks?"\n• "How many active leads do we host?"',
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [language]);

  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = presetText || chatInput.trim();
    if (!textToSend || chatLoading) return;

    if (!presetText) {
      setChatInput('');
    }

    const newMessage = {
      sender: 'user' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: textToSend,
          language: language
        })
      });

      const data = await response.json();
      if (data.error) {
        setChatMessages(prev => [...prev, {
          sender: 'bot',
          text: language === 'ar' 
            ? `⚠️ حدث خطأ أثناء الاتصال بالخادم: ${data.error}`
            : `⚠️ Service error: ${data.error}`,
          timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setChatMessages(prev => [...prev, {
          sender: 'bot',
          text: data.answer || '',
          timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: language === 'ar' 
          ? '⚠️ فشل الاتصال بالخادم. يرجى التحقق من اتصال الشبكة.'
          : '⚠️ Network connection failed. Please check your connectivity.',
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [quickViewItem, setQuickViewItem] = useState<{
    type: 'client' | 'lead' | 'task';
    data: any;
  } | null>(null);

  const clientsList = clients || [];
  const leadsList = leads || [];
  const tasksList = tasks || [];

  const formatValue = (val: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(val).replace('SAR', language === 'ar' ? 'ر.س' : 'SAR');
  };

  // Quick Add submit handlers
  const handleQuickAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.phone) return;
    setQuickAddSubmitting(true);
    try {
      if (onAddClient) {
        await onAddClient(clientForm);
      } else {
        await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientForm)
        });
      }
      setQuickAddSuccess(language === 'ar' ? 'تم إضافة العميل بنجاح! ✨' : 'Client added successfully! ✨');
      setClientForm({ name: '', phone: '', email: '', company_name: '', status: 'active_client', notes: '' });
      setTimeout(() => {
        setQuickAddSuccess('');
        setQuickAddOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Quick Add Client Error:', err);
    } finally {
      setQuickAddSubmitting(false);
    }
  };

  const handleQuickAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;
    setQuickAddSubmitting(true);
    try {
      const payload = {
        ...taskForm,
        client_id: taskForm.client_id ? Number(taskForm.client_id) : null
      };
      if (onAddTask) {
        await onAddTask(payload);
      } else {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setQuickAddSuccess(language === 'ar' ? 'تم إضافة المهمة بنجاح! ⏱️' : 'Task created successfully! ⏱️');
      setTaskForm({ title: '', priority: 'medium', due_date: new Date().toISOString().split('T')[0], client_id: '', description: '' });
      setTimeout(() => {
        setQuickAddSuccess('');
        setQuickAddOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Quick Add Task Error:', err);
    } finally {
      setQuickAddSubmitting(false);
    }
  };

  const handleQuickAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.client_id) return;
    setQuickAddSubmitting(true);
    try {
      const payload = {
        client_id: Number(leadForm.client_id),
        expected_revenue: Number(leadForm.expected_revenue) || 0,
        source: leadForm.source,
        priority: leadForm.priority,
        status: leadForm.status
      };
      if (onAddLead) {
        await onAddLead(payload);
      } else {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setQuickAddSuccess(language === 'ar' ? 'تم إضافة صفقة المبيعات بنجاح! 💼' : 'Lead created successfully! 💼');
      setLeadForm({ client_id: '', expected_revenue: '50000', source: 'Direct Referral', priority: 'medium', status: 'new' });
      setTimeout(() => {
        setQuickAddSuccess('');
        setQuickAddOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Quick Add Lead Error:', err);
    } finally {
      setQuickAddSubmitting(false);
    }
  };

  // Filter lists based on searchQuery
  const filteredClients = searchQuery.trim() === '' ? [] : clientsList.filter(c => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
           c.phone.includes(searchQuery) ||
           (c.company_name && c.company_name.toLowerCase().includes(searchQuery.toLowerCase()));
  }).slice(0, 5);

  const filteredLeads = searchQuery.trim() === '' ? [] : leadsList.filter(l => {
    const client = clientsList.find(c => c.id === l.client_id);
    const clientName = client ? client.name.toLowerCase() : '';
    const source = l.source ? l.source.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    return source.includes(query) || clientName.includes(query) || l.status.includes(query);
  }).slice(0, 5);

  const filteredTasks = searchQuery.trim() === '' ? [] : tasksList.filter(t => {
    const title = t.title.toLowerCase();
    const desc = t.description ? t.description.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    return title.includes(query) || desc.includes(query) || t.priority.includes(query) || t.status.includes(query);
  }).slice(0, 5);

  const totalMatches = filteredClients.length + filteredLeads.length + filteredTasks.length;

  // Translate helper
  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, roles: ['super_admin', 'sales_manager', 'sales_employee', 'supervisor', 'regular_user'] },
    { id: 'clients', label: t('clients'), icon: Users, roles: ['super_admin', 'sales_manager', 'sales_employee', 'supervisor'] },
    { id: 'companies', label: t('companies'), icon: Building2, roles: ['super_admin', 'sales_manager', 'supervisor'] },
    { id: 'sales', label: t('sales'), icon: Landmark, roles: ['super_admin', 'sales_manager', 'sales_employee'] },
    { id: 'tasks', label: t('tasks'), icon: CheckSquare, roles: ['super_admin', 'sales_manager', 'sales_employee', 'supervisor'] },
    { id: 'calendar', label: t('calendar'), icon: Calendar, roles: ['super_admin', 'sales_manager', 'sales_employee', 'supervisor'] },
    { id: 'ai_robots', label: t('ai_robots'), icon: Sparkles, roles: ['super_admin', 'sales_manager', 'sales_employee', 'supervisor'] },
    { id: 'rbac', label: t('rbac'), icon: ShieldCheck, roles: ['super_admin', 'sales_manager'] },
    { id: 'reports', label: t('reports'), icon: FileSpreadsheet, roles: ['super_admin', 'sales_manager', 'supervisor'] },
    { id: 'settings', label: t('settings'), icon: Settings, roles: ['super_admin'] }
  ];

  // Restrict tabs based on roles
  const filteredNavItems = navItems.filter(item => {
    if (!activeUser) return true;
    return item.roles.includes(activeUser.role);
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-rose-500 text-white';
      case 'sales_manager': return 'bg-orange-500 text-white';
      case 'sales_employee': return 'bg-blue-500 text-white';
      case 'supervisor': return 'bg-emerald-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const isRtl = language === 'ar';

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`min-h-screen bg-slate-50 flex flex-col font-serif`}
    >
      {/* Top Banner indicating Simulation mode */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs px-4 py-2 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          <span className="font-semibold tracking-wide">
            {isRtl ? 'بيئة نظام CRM متكاملة - محاكاة الفلاح الكاملة للبرمجة' : 'Bilingual Production CRM Environment - Sandbox Session'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="/api/settings/backup" 
            className="flex items-center gap-1.5 hover:text-orange-500 transition-colors cursor-pointer text-slate-400"
            title="Download full MySQL database schema database.sql"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{t('backupDownload')}</span>
          </a>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">UTC: 2026-06-05</span>
        </div>
      </div>

      <div className="flex flex-1 relative">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <aside 
          className="hidden lg:flex flex-col w-64 text-slate-100 z-30 shrink-0 shadow-lg transition-colors"
          style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
        >
          {/* Logo Brand Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-white"
                style={{ background: 'linear-gradient(135deg, var(--brand-secondary, #FF6500), #ea580c)' }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-base leading-none tracking-tight text-white">CRM Solutions</h1>
                <span 
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--brand-secondary, #FF6500)' }}
                >
                  Hyper Enterprise
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items Link list */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  style={isActive ? { backgroundColor: 'var(--brand-secondary, #FF6500)', color: '#ffffff' } : undefined}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                    isActive 
                      ? 'text-white shadow-md' 
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile Summary & Meta */}
          {activeUser && (
            <div className="p-4 border-t border-slate-850 bg-slate-900/60 flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full bg-slate-700 font-bold flex items-center justify-center shrink-0 border border-slate-700 shadow-inner"
                style={{ color: 'var(--brand-secondary, #FF6500)' }}
              >
                {activeUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-white">{activeUser.name}</p>
                <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(activeUser.role)}`}>
                  {t(`role_${activeUser.role}`)}
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* --- MAIN PAGE WRAPPER --- */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          
          {/* TOP HEADER NAVIGATION BAR */}
          <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            {/* Left: Mobile hamburger & branding */}
            <div className="flex items-center gap-4">
              <button
                id="mobile-menu-trigger"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="lg:hidden flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h1 className="font-bold text-sm tracking-tight text-slate-900">Enterprise CRM</h1>
              </div>

              {/* Path / Current scope title */}
              <div className="hidden md:flex items-center gap-2 text-slate-600">
                <span className="text-slate-300">/</span>
                <span className="text-sm font-semibold text-slate-800">
                  {translations[currentTab]?.[language] || currentTab}
                </span>
              </div>
            </div>

            {/* Centered Desktop Global Search */}
            <div className="hidden md:block relative w-80 lg:w-96 font-sans">
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  placeholder={isRtl ? 'البحث السريع (عميل، فرصة مبيعات، مهمة)...' : 'Quick search (client, lead, task)...'}
                  className={`w-full ${isRtl ? 'pr-9 pl-20 text-right' : 'pl-9 pr-20 text-left'} py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-850 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all`}
                />
                
                {/* Ctrl+K Badge Trigger */}
                <button
                  type="button"
                  onClick={() => setCommandPaletteOpen(true)}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-2' : 'right-2'} hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-200/70 hover:bg-slate-300 text-[10px] font-mono font-bold text-slate-600 cursor-pointer transition-colors`}
                  title={isRtl ? 'لوحة الأوامر السريعة (Ctrl+K)' : 'Command Search Palette (Ctrl+K)'}
                >
                  <Command className="w-3 h-3 text-[#FF6500]" />
                  <span>Ctrl K</span>
                </button>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-16' : 'right-16'} p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown Search Results */}
              {showResults && searchQuery.trim() !== '' && (
                <div className={`absolute top-full ${isRtl ? 'right-0' : 'left-0'} mt-2 w-full bg-white rounded-2xl border border-slate-200 shadow-xl max-h-[400px] overflow-y-auto overflow-x-hidden z-50 p-2 divide-y divide-slate-150/80`}>
                  {totalMatches === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-sans">
                      {isRtl ? 'لا توجد نتائج مطابقة لبحثك 🔍' : 'No matching results found 🔍'}
                    </div>
                  ) : (
                    <>
                      {/* 1. Clients Group */}
                      {filteredClients.length > 0 && (
                        <div className="py-2 first:pt-0">
                          <span className="text-[10px] font-black uppercase text-slate-400 block px-3 mb-1.5 tracking-wider">
                            {isRtl ? '👥 العملاء وجهات الاتصال' : '👥 Customers / Clients'}
                          </span>
                          <div className="space-y-0.5">
                            {filteredClients.map(c => (
                              <button
                                key={c.id}
                                onClick={() => {
                                  setQuickViewItem({ type: 'client', data: c });
                                  setSearchQuery('');
                                }}
                                className="w-full text-start p-2 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between gap-3 group cursor-pointer"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#FF6500]">
                                    {c.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[240px]">
                                    {c.company_name || c.email || c.phone}
                                  </p>
                                </div>
                                <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  c.status === 'active_client' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                  c.status === 'negotiating' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                  'bg-blue-50 text-blue-700 border border-blue-100'
                                }`}>
                                  {isRtl ? (c.status === 'active_client' ? 'مستمر' : c.status === 'negotiating' ? 'تفاوض' : 'جديد') : c.status}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. Leads Group */}
                      {filteredLeads.length > 0 && (
                        <div className="py-2">
                          <span className="text-[10px] font-black uppercase text-slate-400 block px-3 mb-1.5 tracking-wider">
                            {isRtl ? '💼 فرص المبيعات والصفقات' : '💼 Sales Leads / Funnel'}
                          </span>
                          <div className="space-y-0.5">
                            {filteredLeads.map(l => {
                              const client = clientsList.find(c => c.id === l.client_id);
                              return (
                                <button
                                  key={l.id}
                                  onClick={() => {
                                    setQuickViewItem({ type: 'lead', data: l });
                                    setSearchQuery('');
                                  }}
                                  className="w-full text-start p-2 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between gap-3 group cursor-pointer"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#FF6500]">
                                      {client?.name || (isRtl ? 'فرصة مبيعات' : 'Sales Lead')}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate max-w-[240px]">
                                      {isRtl ? `المصدر: ${l.source || 'توصية مباشرة'}` : `Source: ${l.source || 'Direct Referral'}`}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0 flex flex-col items-end">
                                    <span className="text-[11px] font-bold font-mono text-slate-900">
                                      {formatValue(l.expected_revenue)}
                                    </span>
                                    <span className={`text-[9px] font-semibold ${
                                      l.priority === 'high' ? 'text-rose-600' :
                                      l.priority === 'low' ? 'text-blue-500' : 'text-amber-600'
                                    }`}>
                                      {l.priority === 'high' ? '⚡ High' : l.priority === 'low' ? '🛡️ Low' : '🟡 Med'}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 3. Tasks Group */}
                      {filteredTasks.length > 0 && (
                        <div className="py-2 last:pb-0">
                          <span className="text-[10px] font-black uppercase text-slate-400 block px-3 mb-1.5 tracking-wider">
                            {isRtl ? '⏱️ المهام المستحقة' : '⏱️ Assigned Tasks'}
                          </span>
                          <div className="space-y-0.5">
                            {filteredTasks.map(t => (
                              <button
                                key={t.id}
                                onClick={() => {
                                  setQuickViewItem({ type: 'task', data: t });
                                  setSearchQuery('');
                                }}
                                className="w-full text-start p-2 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between gap-3 group cursor-pointer"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#FF6500]">
                                    {t.title}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[240px]">
                                    {isRtl ? `تاريخ الاستحقاق: ${t.due_date}` : `Due: ${t.due_date}`}
                                  </p>
                                </div>
                                <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  t.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                  t.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {isRtl ? (t.status === 'completed' ? 'مكتمل' : t.status === 'in_progress' ? 'قيد العمل' : 'معلق') : t.status}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right Controls: Quick Add, Notifications, User simulation dropdown, Language Switcher */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 relative text-slate-700">
              
              {/* Quick Add Button with Ctrl+N badge */}
              <button
                id="quick-add-btn"
                onClick={() => {
                  setQuickAddOpen(true);
                  setQuickAddType('client');
                }}
                style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:opacity-90 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                title={isRtl ? 'إضافة سريعة (Ctrl+N)' : 'Quick Add (Ctrl+N)'}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{isRtl ? 'إضافة سريعة' : 'Quick Add'}</span>
                <kbd className="hidden lg:inline-flex items-center text-[9px] font-mono font-extrabold bg-black/20 text-white px-1.5 py-0.5 rounded">
                  Ctrl N
                </kbd>
              </button>

              {/* LANGUAGE switch button */}
              <button
                id="lang-switcher"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer bg-white shadow-xs"
              >
                <Globe className="w-4 h-4" style={{ color: 'var(--brand-secondary, #FF6500)' }} />
                <span>{language === 'ar' ? 'English' : 'العربية (RTL)'}</span>
              </button>

              {/* INTEGRATIVE ROLE SIMULATOR Dropdown */}
              <div className="relative">
                <button
                  id="role-switch-dropdown"
                  onClick={() => {
                    setRoleSelectOpen(!roleSelectOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold hover:bg-slate-100 transition-all cursor-pointer"
                  style={{ color: 'var(--brand-secondary, #FF6500)' }}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('switchRole')}</span>
                  <span className="font-bold underline">
                    {activeUser ? t(`role_${activeUser.role}`) : 'Loading...'}
                  </span>
                </button>

                {roleSelectOpen && (
                  <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-250 py-2 z-50 animate-bounce-short`}>
                    <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {isRtl ? 'محاكاة كامل صلاحيات RBAC' : 'Simulate Spatie Permissions'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {isRtl ? 'انقر لتغيير حساب ومستويات الوصول فوراً' : 'Click to toggle access limits immediately'}
                      </p>
                    </div>
                    {allUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => {
                          onSwitchUser(user.id);
                          setRoleSelectOpen(false);
                        }}
                        className={`w-full text-start px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          activeUser?.id === user.id ? 'bg-orange-50/50 font-bold text-[#FF6500]' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <p className="text-[10px] text-slate-400">{user.email}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${getRoleBadgeColor(user.role)}`}>
                          {t(`role_${user.role}`)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* NOTIFICATION Bell count & Dropdown */}
              <div className="relative">
                <button
                  id="notifications-indicator"
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setRoleSelectOpen(false);
                  }}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 relative cursor-pointer"
                >
                  <Bell className="w-5 h-5 text-slate-600" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white ring-1 ring-rose-500 pulse-orange"></span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-250 z-50`}>
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                      <span className="font-bold text-xs text-slate-700">{t('notifications')}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-[#FF6500] font-black">
                        {notifications.filter(n => !n.is_read).length}
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          {t('noNotifications')}
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className={`p-3 text-xs transition-colors hover:bg-slate-50/50 ${!notif.is_read ? 'bg-orange-50/20' : ''}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <p className="font-semibold text-slate-800">
                                {isRtl ? notif.title_ar : notif.title_en}
                              </p>
                              {!notif.is_read && (
                                <button
                                  onClick={() => onMarkNotificationRead(notif.id)}
                                  className="text-[10px] text-[#FF6500] hover:underline shrink-0 font-bold"
                                >
                                  {t('markRead')}
                                </button>
                              )}
                            </div>
                            <p className="text-slate-500 mt-1">
                              {isRtl ? notif.content_ar : notif.content_en}
                            </p>
                            <span className="text-[9px] text-slate-400 block mt-1.5 font-mono">
                              {new Date(notif.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* MAIN PAGE VIEW CONTENT CONTAINER */}
          <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative focus-mode-container overflow-x-hidden">
            {children}
          </main>

        </div>
      </div>

      {/* --- MOBILE DISPLAY NAVIGATION SIDEBAR OVERLAY --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden flex">
          <div 
            className="w-72 text-slate-100 flex flex-col h-full animate-slide-in p-5 justify-between transition-colors"
            style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
          >
            <div>
              <div className="flex justify-between items-center pb-6 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-slate-100">CRM Solutions</span>
                </div>
                <button
                  id="mobile-close-sidebar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Quick Search Input */}
              <div className="relative mb-4 font-sans">
                <Search className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} w-3.5 h-3.5 text-slate-400`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  placeholder={isRtl ? 'بحث سريع...' : 'Quick search...'}
                  className={`w-full ${isRtl ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'} py-2 bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-sans text-white placeholder-slate-400 focus:bg-slate-850 focus:outline-hidden focus:ring-1 focus:ring-[#FF6500] focus:border-[#FF6500] transition-all`}
                />
                
                {/* Mobile Results Popover inline */}
                {showResults && searchQuery.trim() !== '' && (
                  <div className="absolute left-0 right-0 mt-1 bg-[#0f2038] rounded-xl border border-slate-700/80 max-h-60 overflow-y-auto z-50 p-1.5 divide-y divide-slate-700/50 font-sans shadow-lg text-slate-100">
                    {totalMatches === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        {isRtl ? 'لا توجد نتائج' : 'No matches'}
                      </div>
                    ) : (
                      <>
                        {filteredClients.map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setQuickViewItem({ type: 'client', data: c });
                              setSearchQuery('');
                              setMobileMenuOpen(false);
                            }}
                            className="w-full text-start p-1.5 hover:bg-slate-800 text-[11px] font-medium flex items-center justify-between gap-2 rounded-lg cursor-pointer text-slate-200 hover:text-white"
                          >
                            <span className="truncate">{c.name}</span>
                            <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-orange-400 shrink-0 uppercase font-bold">
                              {isRtl ? 'عميل' : 'Client'}
                            </span>
                          </button>
                        ))}
                        {filteredLeads.map(l => {
                          const client = clientsList.find(cl => cl.id === l.client_id);
                          return (
                            <button
                              key={l.id}
                              onClick={() => {
                                setQuickViewItem({ type: 'lead', data: l });
                                setSearchQuery('');
                                setMobileMenuOpen(false);
                              }}
                              className="w-full text-start p-1.5 hover:bg-slate-800 text-[11px] font-medium flex items-center justify-between gap-2 rounded-lg cursor-pointer text-slate-200 hover:text-white"
                            >
                              <span className="truncate">{client?.name || l.source}</span>
                              <span className="text-[8px] bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded shrink-0 font-bold">
                                {isRtl ? 'صفقة' : 'Lead'}
                              </span>
                            </button>
                          );
                        })}
                        {filteredTasks.map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setQuickViewItem({ type: 'task', data: t });
                              setSearchQuery('');
                              setMobileMenuOpen(false);
                            }}
                            className="w-full text-start p-1.5 hover:bg-slate-800 text-[11px] font-medium flex items-center justify-between gap-2 rounded-lg cursor-pointer text-slate-200 hover:text-white"
                          >
                            <span className="truncate">{t.title}</span>
                            <span className="text-[8px] bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded shrink-0 font-bold">
                              {isRtl ? 'مهمة' : 'Task'}
                            </span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Links */}
              <nav className="space-y-1.5">
                {filteredNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      style={isActive ? { backgroundColor: 'var(--brand-secondary, #FF6500)', color: '#ffffff' } : undefined}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'text-white shadow-sm' 
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Profile info */}
            {activeUser && (
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-orange-400 text-sm">
                  {activeUser.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{activeUser.name}</p>
                  <span className={`inline-block px-1.5 py-0.5 mt-0.5 rounded text-[8px] font-bold ${getRoleBadgeColor(activeUser.role)}`}>
                    {t(`role_${activeUser.role}`)}
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* backdrop clicking closes menu */}
          <div className="flex-grow" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* GLOBAL SEARCH QUICK PREVIEW MODAL */}
      {quickViewItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-zoom-in text-slate-800">
            {/* Header banner */}
            <div 
              className="p-4 text-white flex justify-between items-center"
              style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
            >
              <div className="flex items-center gap-2">
                {quickViewItem.type === 'client' && <UserCheck className="w-5 h-5" style={{ color: 'var(--brand-secondary, #FF6500)' }} />}
                {quickViewItem.type === 'lead' && <Briefcase className="w-5 h-5 text-amber-400" />}
                {quickViewItem.type === 'task' && <CheckSquare className="w-5 h-5 text-emerald-400" />}
                <span className="font-extrabold text-sm tracking-tight text-white">
                  {isRtl ? 'معاينة سريعة من البحث العام' : 'Global Search Quick View'}
                </span>
              </div>
              <button
                onClick={() => setQuickViewItem(null)}
                className="p-1 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Inner Content Card */}
            <div className={`p-6 space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
              {quickViewItem.type === 'client' && (() => {
                const c = quickViewItem.data as Client;
                return (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF6500]"></span>
                        <h4 className="text-lg font-black text-[#0B192C]">{c.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: #{c.id} • Registered {new Date(c.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3.5 text-xs text-slate-700">
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</span>
                        <span className="font-mono truncate block text-slate-800">{c.email || (isRtl ? 'غير متوفر' : 'N/A')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">{isRtl ? 'رقم الهاتف' : 'Phone'}</span>
                        <span className="font-mono truncate block text-slate-800">{c.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">{isRtl ? 'الشركة / المنشأة' : 'Company Name'}</span>
                        <span className="truncate block font-semibold text-slate-800">{c.company_name || (isRtl ? 'طبيعي فردي' : 'Individual')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">{isRtl ? 'حالة العميل' : 'Relationship State'}</span>
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-orange-50 text-[#FF6500] border border-orange-100">
                          {c.status}
                        </span>
                      </div>
                    </div>

                    {c.notes && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-650">
                        <strong className="block mb-1 text-slate-700">{isRtl ? 'ملاحظات:' : 'Notes:'}</strong>
                        <p className="italic leading-relaxed text-slate-650">{c.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {quickViewItem.type === 'lead' && (() => {
                const l = quickViewItem.data as Lead;
                const client = clientsList.find(c => c.id === l.client_id);
                return (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <h4 className="text-lg font-black text-[#0B192C]">
                          {client ? client.name : (isRtl ? 'فرصة مبيعات' : 'Sales Lead')}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">Lead ID: #{l.id} • Score: {l.score}/100</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3.5 text-xs text-slate-700">
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">{isRtl ? 'مصدر الصفقة' : 'Lead Source'}</span>
                        <span className="font-bold text-slate-800">{l.source || (isRtl ? 'توصية مباشرة' : 'Direct Referral')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">{isRtl ? 'الإيراد المتوقع' : 'Expected Revenue'}</span>
                        <span className="font-mono text-emerald-600 font-black">{formatValue(l.expected_revenue)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">{isRtl ? 'الأولوية' : 'Priority'}</span>
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-lg ${
                          l.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          l.priority === 'low' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {l.priority || 'medium'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">{isRtl ? 'مرحلة الصفقة' : 'Pipeline Stage'}</span>
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 border">
                          {l.status}
                        </span>
                      </div>
                    </div>

                    {client && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
                        <strong className="block mb-1 text-slate-700">{isRtl ? 'بيانات جهة الاتصال:' : 'Contact details:'}</strong>
                        <p className="text-slate-650">📞 {client.phone} • ✉️ {client.email || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {quickViewItem.type === 'task' && (() => {
                const tItem = quickViewItem.data as Task;
                const client = clientsList.find(c => c.id === tItem.client_id);
                return (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <h4 className="text-base font-black text-[#0B192C] leading-snug">{tItem.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono">Task ID: #{tItem.id} • {isRtl ? `تاريخ الاستحقاق: ${tItem.due_date}` : `Due: ${tItem.due_date}`}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3.5 text-xs text-slate-700">
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">{isRtl ? 'مستوى الأهمية' : 'Task Priority'}</span>
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] uppercase font-bold rounded-lg ${
                          tItem.priority === 'urgent' ? 'bg-red-500 text-white animate-pulse' :
                          tItem.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          tItem.priority === 'low' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {tItem.priority}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">{isRtl ? 'حالة المهمة' : 'Task Status'}</span>
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 border col-span-1">
                          {tItem.status}
                        </span>
                      </div>
                    </div>

                    {tItem.description && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        <strong className="block mb-1 text-slate-700 text-[11px] uppercase">{isRtl ? 'التوجيهات والوصف التفصيلي:' : 'Description:'}</strong>
                        <p className="text-slate-650 whitespace-pre-line leading-relaxed italic">{tItem.description}</p>
                      </div>
                    )}

                    {client && (
                      <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl text-xs">
                        <strong className="block text-indigo-900 font-bold mb-0.5">{isRtl ? 'مرتبط بالعميل:' : 'Linked Client:'}</strong>
                        <p className="text-indigo-850 font-semibold">{client.name} ({client.company_name || 'Individual'})</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Bottom actions footer border */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setQuickViewItem(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl font-bold text-slate-600 cursor-pointer"
              >
                {isRtl ? 'إغلاق المعاينة' : 'Dismiss Preview'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const targetItem = quickViewItem;
                  setQuickViewItem(null);
                  if (targetItem.type === 'client') {
                    setCurrentTab('clients');
                  } else if (targetItem.type === 'lead') {
                    setCurrentTab('sales');
                  } else if (targetItem.type === 'task') {
                    setCurrentTab('tasks');
                  }
                }}
                className="px-4 py-2 bg-[#FF6500] hover:bg-orange-600 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>
                  {quickViewItem.type === 'client' && (isRtl ? 'ملف العملاء 👥' : 'Navigate to Customers 👥')}
                  {quickViewItem.type === 'lead' && (isRtl ? 'لوحة المبيعات 💼' : 'Navigate to Sales Board 💼')}
                  {quickViewItem.type === 'task' && (isRtl ? 'جدول المهام ⏱️' : 'Navigate to Tasks Board ⏱️')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Contextual Chat Window Float */}
      <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50`}>
        {/* Chat Float Indicator / Trigger */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          style={{ background: 'linear-gradient(135deg, var(--brand-secondary, #FF6500), #ea580c)' }}
          className="flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl hover:scale-105 active:scale-95 transition-all outline-hidden cursor-pointer relative group"
          id="chat-toggle-btn"
          title={isRtl ? 'اسأل مساعد الذكاء الاصطناعي' : 'Ask AI CRM Assistant'}
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
          
          {/* Tooltip */}
          <span className={`absolute ${isRtl ? 'left-full ml-3' : 'right-full mr-3'} top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 text-white text-[10px] font-sans font-semibold py-1.5 px-3 rounded-lg whitespace-nowrap shadow-md`}>
            {isRtl ? '💬 اسأل المساعد الذكي!' : '💬 Ask Smart Assistant!'}
          </span>
        </button>

        {/* Chat Window Box */}
        {chatOpen && (
          <div 
            className={`absolute bottom-20 ${isRtl ? 'left-0' : 'right-0'} w-96 max-w-[calc(100vw-2rem)] h-[520px] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-zoom-in`}
            id="ai-chat-window"
          >
            {/* Header */}
            <div 
              className="text-slate-100 px-4 py-3.5 flex items-center justify-between border-b border-slate-800"
              style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
            >
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5 leading-none">
                    {isRtl ? 'مساعد CRM الذكي' : 'CRM Smart Assistant'}
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  </h3>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {isRtl ? 'مدعوم بنموذج Gemini 1.5 Flash' : 'Powered by Gemini 1.5 Flash'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed transition-all ${
                    msg.sender === 'user' 
                      ? 'bg-[#FF6500] text-white rounded-br-none' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}>
                    {/* Preserve line breaks for clean outputs */}
                    <p className="whitespace-pre-line font-sans">{msg.text}</p>
                    <span className={`block text-[9px] mt-1 text-right font-mono ${
                      msg.sender === 'user' ? 'text-orange-200' : 'text-slate-450'
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Animated Loading Skeleton */}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 text-xs shadow-xs text-slate-500 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6500]" />
                    <span className="font-sans">{isRtl ? 'المساعد يفكر ويستعلم...' : 'Searching database...'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggested Queries Chips */}
            <div className="bg-slate-50 px-3.5 py-2.5 border-t border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider font-sans">
                {isRtl ? '💡 مقترحات سريعة للاستعلام:' : '💡 Fast insights & queries:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleSendChatMessage(isRtl ? 'من هو العميل الأعلى دفعاً؟' : 'Who is my highest paying client?')}
                  disabled={chatLoading}
                  className="text-[10px] font-medium bg-white hover:bg-orange-50 hover:text-[#FF6500] border border-slate-200 hover:border-orange-200 rounded-full px-2.5 py-1 text-slate-600 transition-all cursor-pointer font-sans disabled:opacity-50"
                >
                  {isRtl ? '👤 الأعلى دفعاً؟' : '👤 Highest paying client?'}
                </button>
                <button
                  onClick={() => handleSendChatMessage(isRtl ? 'ما هي أكثر المهام استعجالاً؟' : 'What are the most urgent tasks?')}
                  disabled={chatLoading}
                  className="text-[10px] font-medium bg-white hover:bg-orange-50 hover:text-[#FF6500] border border-slate-200 hover:border-orange-200 rounded-full px-2.5 py-1 text-slate-600 transition-all cursor-pointer font-sans disabled:opacity-50"
                >
                  {isRtl ? '⏳ المهام العاجلة؟' : '⏳ Urgent tasks?'}
                </button>
                <button
                  onClick={() => handleSendChatMessage(isRtl ? 'كم عدد صفقات المبيعات النشطة؟' : 'How many active leads do we host?')}
                  disabled={chatLoading}
                  className="text-[10px] font-medium bg-white hover:bg-orange-50 hover:text-[#FF6500] border border-slate-200 hover:border-orange-200 rounded-full px-2.5 py-1 text-slate-600 transition-all cursor-pointer font-sans disabled:opacity-50"
                >
                  {isRtl ? '🎯 صفقات المبيعات؟' : '🎯 Active sales leads?'}
                </button>
              </div>
            </div>

            {/* Input Footer */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="bg-white border-t border-slate-200 p-2.5 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isRtl ? 'اكتب سؤالك هنا (مثال: كم عدد عملائي)...' : 'Ask questions here (e.g. how many customers)...'}
                disabled={chatLoading}
                className={`flex-grow px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white text-xs text-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#FF6500] focus:border-[#FF6500] transition-all font-sans`}
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="p-2.5 rounded-xl bg-[#FF6500] hover:bg-orange-600 text-white disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* GLOBAL COMMAND PALETTE MODAL OVERLAY (Ctrl+K) */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-start justify-center p-4 sm:p-6 md:p-10 animate-fade-in font-sans">
          <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-zoom-in"
            id="command-palette-modal"
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <Command className="w-5 h-5 text-[#FF6500] shrink-0" />
              <input
                type="text"
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder={isRtl ? 'ابحث عن صفحة، أو إجراء سريع، أو اسم عميل (Ctrl+K)...' : 'Type a command, page, or client name (Ctrl+K)...'}
                className="w-full bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
              />
              <button 
                onClick={() => setCommandPaletteOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results / Navigation Options List */}
            <div className="p-3 overflow-y-auto space-y-4 max-h-[480px]">
              
              {/* 1. Quick Navigation Pages */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 px-3 block mb-1.5 tracking-wider">
                  {isRtl ? '📌 الانتقال السريع بين الشاشات' : '📌 Page Jumps'}
                </span>
                <div className="space-y-1">
                  {[
                    { id: 'dashboard', label: isRtl ? 'لوحة التحكم الرئيسية (Overview)' : 'Dashboard Overview', icon: LayoutDashboard },
                    { id: 'clients', label: isRtl ? 'دليل العملاء وجهات الاتصال (Clients)' : 'Clients & Directory', icon: Users },
                    { id: 'companies', label: isRtl ? 'سجل الشركات والشركاء (Companies)' : 'Companies Directory', icon: Building2 },
                    { id: 'sales', label: isRtl ? 'صفقات وفرص المبيعات (Sales Pipeline)' : 'Sales Pipeline', icon: Landmark },
                    { id: 'tasks', label: isRtl ? 'جدول المهام والتنفيذ (Tasks)' : 'Task Board', icon: CheckSquare },
                    { id: 'calendar', label: isRtl ? 'التقويم الزمني والمواعيد (Calendar)' : 'Calendar & Schedules', icon: Calendar },
                    { id: 'ai_robots', label: isRtl ? 'المساعدون والأتمتة الذكية (AI Robots)' : 'AI Robots & Automation', icon: Sparkles },
                    { id: 'rbac', label: isRtl ? 'إدارة الصلاحيات والمستخدمين (RBAC)' : 'RBAC User Permissions', icon: ShieldCheck },
                    { id: 'reports', label: isRtl ? 'التقارير المالية والتحليلات (Reports)' : 'Financial Reports', icon: FileSpreadsheet },
                    { id: 'settings', label: isRtl ? 'إعدادات النظام والنسخ الاحتياطي (Settings)' : 'System Settings', icon: Settings },
                  ]
                  .filter(p => p.label.toLowerCase().includes(cmdQuery.toLowerCase()) || p.id.includes(cmdQuery.toLowerCase()))
                  .map(p => {
                    const IconComp = p.icon;
                    const isActive = currentTab === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setCurrentTab(p.id);
                          setCommandPaletteOpen(false);
                          setCmdQuery('');
                        }}
                        className={`w-full text-start px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                          isActive ? 'bg-orange-50 border border-orange-200 text-[#FF6500] font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComp className={`w-4 h-4 ${isActive ? 'text-[#FF6500]' : 'text-slate-400 group-hover:text-[#FF6500]'}`} />
                          <span className="text-xs">{p.label}</span>
                        </div>
                        <CornerDownLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#FF6500] transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Quick Actions */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 px-3 block mb-1.5 tracking-wider">
                  {isRtl ? '⚡ إجراءات سريعة' : '⚡ Quick Actions'}
                </span>
                <div className="space-y-1">
                  {[
                    { 
                      id: 'act_add_client', 
                      label: isRtl ? 'إضافة عميل جديد' : 'Quick Add New Client', 
                      shortcut: 'Ctrl N', 
                      icon: UserPlus, 
                      action: () => { setQuickAddType('client'); setQuickAddOpen(true); setCommandPaletteOpen(false); } 
                    },
                    { 
                      id: 'act_add_task', 
                      label: isRtl ? 'إضافة مهمة جديدة' : 'Quick Add New Task', 
                      shortcut: 'Ctrl N', 
                      icon: CheckSquare, 
                      action: () => { setQuickAddType('task'); setQuickAddOpen(true); setCommandPaletteOpen(false); } 
                    },
                    { 
                      id: 'act_add_lead', 
                      label: isRtl ? 'إضافة فرصة مبيعات جديدة' : 'Quick Add Sales Lead', 
                      shortcut: 'Ctrl N', 
                      icon: Briefcase, 
                      action: () => { setQuickAddType('lead'); setQuickAddOpen(true); setCommandPaletteOpen(false); } 
                    },
                    { 
                      id: 'act_ai_chat', 
                      label: isRtl ? 'فتح المحادثة الذكية مع المساعد AI' : 'Open Smart AI Assistant Chat', 
                      shortcut: 'Chat', 
                      icon: MessageSquare, 
                      action: () => { setChatOpen(true); setCommandPaletteOpen(false); } 
                    },
                    { 
                      id: 'act_switch_lang', 
                      label: isRtl ? 'تغيير اللغة إلى English' : 'Switch Language to Arabic', 
                      shortcut: 'Lang', 
                      icon: Globe, 
                      action: () => { setLanguage(language === 'ar' ? 'en' : 'ar'); setCommandPaletteOpen(false); } 
                    }
                  ]
                  .filter(a => a.label.toLowerCase().includes(cmdQuery.toLowerCase()))
                  .map(a => {
                    const ActionIcon = a.icon;
                    return (
                      <button
                        key={a.id}
                        onClick={a.action}
                        className="w-full text-start px-3 py-2.5 rounded-xl hover:bg-orange-50/80 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-orange-100"
                      >
                        <div className="flex items-center gap-3">
                          <ActionIcon className="w-4 h-4 text-slate-400 group-hover:text-[#FF6500]" />
                          <span className="text-xs text-slate-800 font-semibold group-hover:text-[#FF6500]">{a.label}</span>
                        </div>
                        <kbd className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 group-hover:bg-orange-100 group-hover:text-[#FF6500] px-2 py-0.5 rounded-md">
                          {a.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Matching Entities Search */}
              {cmdQuery.trim() !== '' && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 px-3 block mb-1.5 tracking-wider">
                    {isRtl ? '🔍 نتائج البحث السريع في السجلات' : '🔍 CRM Search Matches'}
                  </span>
                  <div className="space-y-1">
                    {filteredClients.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setQuickViewItem({ type: 'client', data: c });
                          setCommandPaletteOpen(false);
                          setCmdQuery('');
                        }}
                        className="w-full text-start p-2.5 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between gap-3 group cursor-pointer border border-slate-100"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#FF6500]">{c.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{c.company_name || c.phone}</p>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {isRtl ? 'عميل' : 'Client'}
                        </span>
                      </button>
                    ))}
                    {filteredTasks.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setQuickViewItem({ type: 'task', data: t });
                          setCommandPaletteOpen(false);
                          setCmdQuery('');
                        }}
                        className="w-full text-start p-2.5 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between gap-3 group cursor-pointer border border-slate-100"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#FF6500]">{t.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{t.priority} • {t.due_date}</p>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                          {isRtl ? 'مهمة' : 'Task'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer keyboard hint */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold">Esc</kbd>
                  <span>{isRtl ? 'إغلاق' : 'Close'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold">Ctrl N</kbd>
                  <span>{isRtl ? 'إضافة سريعة' : 'Quick Add'}</span>
                </span>
              </div>
              <span className="text-slate-500 font-sans font-medium">
                {isRtl ? 'اختصارات لوحة التحكم' : 'CRM Keyboard Shortcuts'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD MODAL OVERLAY (Ctrl+N) */}
      {quickAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in"
            id="quick-add-modal"
          >
            {/* Modal Header */}
            <div 
              className="text-white p-4 flex items-center justify-between border-b border-slate-800"
              style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
            >
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                >
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    {isRtl ? 'إضافة سجل جديد سريع' : 'Quick Add Entry'}
                    <span className="text-[10px] font-mono font-normal bg-black/30 text-white border border-white/20 px-1.5 py-0.5 rounded">
                      Ctrl+N
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {isRtl ? 'أنشئ عميل، أو مهمة، أو فرصة مبيعات بدون مغادرة شاشتك الحالية' : 'Create client, task, or lead without leaving context'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setQuickAddOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-type Select Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5">
              <button
                onClick={() => setQuickAddType('client')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  quickAddType === 'client' 
                    ? 'bg-white text-[#FF6500] shadow-xs border border-slate-200' 
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'عميل جديد' : 'New Client'}</span>
              </button>
              <button
                onClick={() => setQuickAddType('task')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  quickAddType === 'task' 
                    ? 'bg-white text-[#FF6500] shadow-xs border border-slate-200' 
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{isRtl ? 'مهمة جديدة' : 'New Task'}</span>
              </button>
              <button
                onClick={() => setQuickAddType('lead')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  quickAddType === 'lead' 
                    ? 'bg-white text-[#FF6500] shadow-xs border border-slate-200' 
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{isRtl ? 'صفقة مبيعات' : 'New Lead'}</span>
              </button>
            </div>

            {/* Success Toast Banner */}
            {quickAddSuccess && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{quickAddSuccess}</span>
              </div>
            )}

            {/* FORM BODIES */}
            <div className="p-5">
              
              {/* 1. CLIENT FORM */}
              {quickAddType === 'client' && (
                <form onSubmit={handleQuickAddClientSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isRtl ? 'اسم العميل / المؤسسة *' : 'Client / Company Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      placeholder={isRtl ? 'مثال: شركة الحلول المتقدمة' : 'e.g. Acme Corporation'}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#FF6500] focus:outline-hidden"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isRtl ? 'رقم الهاتف *' : 'Phone Number *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={clientForm.phone}
                        onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                        placeholder="+966 50 000 0000"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#FF6500] focus:outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        value={clientForm.email}
                        onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                        placeholder="client@company.sa"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#FF6500] focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isRtl ? 'حالة العميل' : 'Client Status'}
                    </label>
                    <select
                      value={clientForm.status}
                      onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#FF6500] focus:outline-hidden"
                    >
                      <option value="active_client">{isRtl ? 'مستمر / نشط' : 'Active Client'}</option>
                      <option value="negotiating">{isRtl ? 'قيد التفاوض' : 'Negotiating'}</option>
                      <option value="new">{isRtl ? 'عميل محتمل جديد' : 'New Prospect'}</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickAddOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      {isRtl ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={quickAddSubmitting}
                      style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                      className="px-5 py-2 text-xs font-bold hover:opacity-90 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {quickAddSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                      <span>{isRtl ? 'حفظ العميل' : 'Save Client'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* 2. TASK FORM */}
              {quickAddType === 'task' && (
                <form onSubmit={handleQuickAddTaskSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isRtl ? 'عنوان المهمة *' : 'Task Title *'}
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder={isRtl ? 'مثال: مراجعة العقد النهائي مع العميل' : 'e.g. Contract review meeting'}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#FF6500] focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isRtl ? 'الأولوية' : 'Priority'}
                      </label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#FF6500] focus:outline-hidden"
                      >
                        <option value="urgent">⚡ {isRtl ? 'عاجلة جداً' : 'Urgent'}</option>
                        <option value="high">🔴 {isRtl ? 'مرتفعة' : 'High'}</option>
                        <option value="medium">🟡 {isRtl ? 'متوسطة' : 'Medium'}</option>
                        <option value="low">🔵 {isRtl ? 'منخفضة' : 'Low'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isRtl ? 'تاريخ الاستحقاق' : 'Due Date'}
                      </label>
                      <input
                        type="date"
                        required
                        value={taskForm.due_date}
                        onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#FF6500] focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isRtl ? 'العميل المرتبط (اختياري)' : 'Associated Client (Optional)'}
                    </label>
                    <select
                      value={taskForm.client_id}
                      onChange={(e) => setTaskForm({ ...taskForm, client_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#FF6500] focus:outline-hidden"
                    >
                      <option value="">{isRtl ? '-- بدون ربط بعميل --' : '-- No Client --'}</option>
                      {clientsList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickAddOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      {isRtl ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={quickAddSubmitting}
                      style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                      className="px-5 py-2 text-xs font-bold hover:opacity-90 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {quickAddSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckSquare className="w-3.5 h-3.5" />}
                      <span>{isRtl ? 'إنشاء المهمة' : 'Create Task'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* 3. LEAD FORM */}
              {quickAddType === 'lead' && (
                <form onSubmit={handleQuickAddLeadSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isRtl ? 'العميل *' : 'Client *'}
                    </label>
                    <select
                      required
                      value={leadForm.client_id}
                      onChange={(e) => setLeadForm({ ...leadForm, client_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#FF6500] focus:outline-hidden"
                    >
                      <option value="">{isRtl ? '-- اختر العميل --' : '-- Select Client --'}</option>
                      {clientsList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isRtl ? 'الإيراد المتوقع (ر.س)' : 'Expected Revenue (SAR)'}
                      </label>
                      <input
                        type="number"
                        required
                        value={leadForm.expected_revenue}
                        onChange={(e) => setLeadForm({ ...leadForm, expected_revenue: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#FF6500] focus:outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isRtl ? 'المصدر' : 'Lead Source'}
                      </label>
                      <select
                        value={leadForm.source}
                        onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#FF6500] focus:outline-hidden"
                      >
                        <option value="Direct Referral">{isRtl ? 'توصية مباشرة' : 'Direct Referral'}</option>
                        <option value="Website">{isRtl ? 'الموقع الإلكتروني' : 'Website'}</option>
                        <option value="Social Media">{isRtl ? 'وسائل التواصل' : 'Social Media'}</option>
                        <option value="Cold Call">{isRtl ? 'اتصال تسويقي' : 'Cold Call'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickAddOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      {isRtl ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={quickAddSubmitting}
                      style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                      className="px-5 py-2 text-xs font-bold hover:opacity-90 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {quickAddSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Briefcase className="w-3.5 h-3.5" />}
                      <span>{isRtl ? 'إضافة صفقة المبيعات' : 'Create Lead'}</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
