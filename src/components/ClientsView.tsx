/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Archive, RotateCcw, 
  Download, Upload, Eye, FileText, ChevronDown, Check, Sparkles, FolderOpen,
  Users, X
} from 'lucide-react';
import { translations } from '../locales';
import { Client, User } from '../types';

interface ClientsProps {
  clients: Client[];
  activeUser: User | null;
  language: 'ar' | 'en';
  onAddClient: (data: any) => void;
  onUpdateClient: (id: number, data: any) => void;
  onDeleteClient: (id: number) => void;
  onArchiveClient: (id: number) => void;
  onImportBulk: (list: any[]) => void;
}

export default function ClientsView({
  clients,
  activeUser,
  language,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onArchiveClient,
  onImportBulk
}: ClientsProps) {
  const t = (key: string) => translations[key]?.[language] || key;
  const isRtl = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    status: 'new',
    type: 'individual',
    address: '',
    notes: ''
  });

  // Attachments simulation per client row
  const [selectedClientForFiles, setSelectedClientForFiles] = useState<number | null>(null);
  const [attachmentsByClient, setAttachmentsByClient] = useState<Record<number, Array<{name: string, size: string, date: string}>>>({
    1: [{ name: 'Sponsorship_Accord_Signed.pdf', size: '2.4 MB', date: '2026-05-15' }],
    2: [{ name: 'STC_Hardware_Server_License_Specs.docx', size: '940 KB', date: '2026-06-01' }]
  });
  const [tempAttachmentName, setTempAttachmentName] = useState('');

  // Excel Excel Import Simulator State
  const [importOpen, setImportOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Unified Client Dossier Tabs state per client row
  const [activeDetailsTab, setActiveDetailsTab] = useState<Record<number, 'files' | 'emails' | 'ai_avatar'>>({});
  const [syncingClientEmails, setSyncingClientEmails] = useState<Record<number, boolean>>({});
  const [generatingClientAvatar, setGeneratingClientAvatar] = useState<Record<number, boolean>>({});
  const [aiAvatarStyle, setAiAvatarStyle] = useState<Record<number, string>>({});
  const [aiCustomPrompt, setAiCustomPrompt] = useState<Record<number, string>>({});
  const [generationLogs, setGenerationLogs] = useState<Record<number, string[]>>({});

  const handleSyncCorrespondence = async (clientId: number) => {
    setSyncingClientEmails(prev => ({ ...prev, [clientId]: true }));
    try {
      const res = await fetch(`/api/clients/${clientId}/sync-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language })
      });
      if (res.ok) {
        const updatedClient = await res.json();
        onUpdateClient(clientId, updatedClient);
      }
    } catch (e) {
      console.error('Failed to sync emails:', e);
    } finally {
      setSyncingClientEmails(prev => ({ ...prev, [clientId]: false }));
    }
  };

  const handleGenerateAIAvatar = async (clientId: number) => {
    setGeneratingClientAvatar(prev => ({ ...prev, [clientId]: true }));
    const style = aiAvatarStyle[clientId] || 'corporate_classic';
    const prompt = aiCustomPrompt[clientId] || '';
    
    // Simulating true agent-like console generation logs to the user for real retro-technical feedback
    const logs = [
      isRtl ? '⏳ بدء إعداد بارامترات النموذج...' : '⏳ Initializing model hyperparameters...',
      isRtl ? '🎯 تحليل السمات الديموغرافية والمنشأة...' : '🎯 Analysing demographic & corporate contextual tags...',
    ];
    setGenerationLogs(prev => ({ ...prev, [clientId]: logs }));

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    
    await sleep(600);
    logs.push(isRtl 
      ? `🎨 جاري الصياغة الفنية للنمط المختار [${style}]...` 
      : `🎨 Blending custom visual artistic traits for [${style}]...`
    );
    setGenerationLogs(prev => ({ ...prev, [clientId]: [...logs] }));

    await sleep(800);
    if (prompt) {
      logs.push(isRtl 
        ? `🧱 تطبيق الواصفات اليدوية: "${prompt}"` 
        : `🧱 Appending customized descriptors: "${prompt}"`
      );
      setGenerationLogs(prev => ({ ...prev, [clientId]: [...logs] }));
      await sleep(650);
    }
    
    logs.push(isRtl ? '⚡ تجميع الطبقات الهندسية وتكامل الصورة...' : '⚡ Compiling layers and generating pixel matrix...');
    setGenerationLogs(prev => ({ ...prev, [clientId]: [...logs] }));

    try {
      const res = await fetch(`/api/clients/${clientId}/generate-avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style })
      });
      if (res.ok) {
        const updatedClient = await res.json();
        logs.push(isRtl ? '✅ تم توليد وتخزين السجل البروفايل بنجاح!' : '✅ AI Profile Placeholder successfully rendered!');
        setGenerationLogs(prev => ({ ...prev, [clientId]: [...logs] }));
        await sleep(500);
        onUpdateClient(clientId, updatedClient);
      }
    } catch (e) {
      console.error('Failed to generate avatar:', e);
      logs.push(isRtl ? '❌ فشل الاتصال بخادم التوليد الذكي' : '❌ Target connection generation failed');
      setGenerationLogs(prev => ({ ...prev, [clientId]: [...logs] }));
    } finally {
      setGeneratingClientAvatar(prev => ({ ...prev, [clientId]: false }));
    }
  };

  const canEdit = activeUser?.role === 'super_admin' || activeUser?.role === 'sales_manager' || activeUser?.role === 'sales_employee';
  const canDelete = activeUser?.role === 'super_admin' || activeUser?.role === 'sales_manager';

  const handleOpenForm = (client: Client | null = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone,
        company_name: client.company_name || '',
        status: client.status,
        type: client.type,
        address: client.address || '',
        notes: client.notes || ''
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        status: 'new',
        type: 'individual',
        address: '',
        notes: ''
      });
    }
    setFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      onUpdateClient(editingClient.id, formData);
    } else {
      onAddClient(formData);
    }
    setFormOpen(false);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    const listToExport = clients.filter(c => showArchived ? c.archived_at != null : c.archived_at == null);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Email,Phone,Company,Type,Status,Notes\r\n";
    
    listToExport.forEach(c => {
      csvContent += `${c.id},"${c.name}","${c.email || ''}","${c.phone}","${c.company_name || ''}","${c.type}","${c.status}","${c.notes || ''}"\r\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", showArchived ? "archived_clients_crm.csv" : "active_clients_crm.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock template parser importer
  const triggerSampleImport = () => {
    const mockExcelRows = [
      { name: "عبدالله الروضان", email: "rodhan@stc.com.sa", phone: "+966555111222", company_name: "شركة الاتصالات السعودية (STC)", status: "lead", type: "corporate", address: "الرياض", notes: "مستورد من Excel - مهتم ببرامج الشبكات" },
      { name: "منى الدوسري", email: "mona@solutions.com", phone: "+966509998887", company_name: "مؤسسة الدوسري للحلول السريعة", status: "new", type: "corporate", address: "الدمام", notes: "مستورد من Excel - مهتم بالاستشارات" },
      { name: "إبراهيم الحربي", email: "harbi@yahoo.com", phone: "+966501239876", company_name: "", status: "negotiating", type: "individual", address: "بريدة", notes: "مستورد من Excel - تفاوض ثنائي" }
    ];
    onImportBulk(mockExcelRows);
    setImportOpen(false);
  };

  // Add client attachment mockup
  const handleAddAttachment = (e: React.FormEvent, clientId: number) => {
    e.preventDefault();
    if (!tempAttachmentName.trim()) return;
    const sizeStr = `${(Math.random() * 4 + 0.5).toFixed(1)} MB`;
    const newFile = {
      name: tempAttachmentName.trim().endsWith('.pdf') || tempAttachmentName.trim().endsWith('.docx') ? tempAttachmentName : `${tempAttachmentName}.pdf`,
      size: sizeStr,
      date: new Date().toISOString().split('T')[0]
    };
    const files = attachmentsByClient[clientId] || [];
    setAttachmentsByClient({
      ...attachmentsByClient,
      [clientId]: [newFile, ...files]
    });
    setTempAttachmentName('');
  };

  // Filtering Logic
  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phone.includes(searchQuery) ||
      (c.company_name && c.company_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    const matchesType = typeFilter === '' || c.type === typeFilter;
    const matchesArchiveState = showArchived ? c.archived_at != null : c.archived_at == null;

    return matchesSearch && matchesStatus && matchesType && matchesArchiveState;
  });

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Top action header card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{showArchived ? t('rbacTitle') : t('clients')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold font-mono">
              {filteredClients.length} {isRtl ? 'سجل' : 'items'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl ? 'أضف العملاء الجدد، نظم المرفقات القانونية، والملفات، أو استوردها جماعياً من Excel' : 'Add company client segments, attach document logs, export sheets or upload excel backups'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <button
              onClick={() => handleOpenForm(null)}
              style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl hover:opacity-90 transition-all font-bold text-xs text-white shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" style={{ color: 'var(--brand-secondary, #FF6500)' }} />
              <span>{t('addClient')}</span>
            </button>
          )}
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white font-semibold text-xs cursor-pointer"
          >
            <Upload className="w-4 h-4" style={{ color: 'var(--brand-secondary, #FF6500)' }} />
            <span>{t('importExcel')}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white font-semibold text-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>{t('exportExcel')}</span>
          </button>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs border transition-colors cursor-pointer ${
              showArchived 
                ? 'bg-orange-50 border-orange-200 text-[#FF6500]' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>{showArchived ? (isRtl ? 'النشطين' : 'View Active') : (isRtl ? 'شاهد الأرشيف' : 'View Archive')}</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <Search className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchClients')}
            className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF6500] text-xs font-serif bg-slate-50/50`}
          />
        </div>

        {/* Status drop filters */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 focus:outline-none text-xs bg-slate-50/50"
          >
            <option value="">{isRtl ? 'كل الحالات' : 'All status classes'}</option>
            <option value="new">{t('status_new')}</option>
            <option value="lead">{t('status_lead')}</option>
            <option value="negotiating">{t('status_negotiating')}</option>
            <option value="active_client">{t('status_active_client')}</option>
            <option value="inactive">{t('status_inactive')}</option>
          </select>
        </div>

        {/* Client Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-slate-200 focus:outline-none text-xs bg-slate-50/50"
          >
            <option value="">{isRtl ? 'كل أنواع العملاء' : 'All types'}</option>
            <option value="individual">{t('individual')}</option>
            <option value="corporate">{t('corporate')}</option>
          </select>
        </div>
      </div>

      {/* CLIENTS DATA LIST TABLE/CARDS */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredClients.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">{isRtl ? 'لا توجد نتائج مطابقة لبحثك' : 'No customers matching search criteria'}</h4>
            <p className="text-xs text-slate-400">{isRtl ? 'جرب البحث باسم آخر أو تأكد من تفعيل الأرشيف لرؤية العملاء المؤرشفين.' : 'Ensure correct filters are engaged or try general terms.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase select-none text-[11px]">
                  <th className={`py-4 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('clientName')}</th>
                  <th className={`py-4 px-4 hidden sm:table-cell ${isRtl ? 'text-right' : 'text-left'}`}>{t('companyName')}</th>
                  <th className={`py-4 px-4 hidden md:table-cell ${isRtl ? 'text-right' : 'text-left'}`}>{t('clientPhone')}</th>
                  <th className={`py-4 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('status')}</th>
                  <th className={`py-4 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('uploadAttachments')}</th>
                  <th className="py-4 px-4 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredClients.map(client => {
                  const clientFiles = attachmentsByClient[client.id] || [];
                  const filesExpanded = selectedClientForFiles === client.id;
                  return (
                    <React.Fragment key={client.id}>
                      <tr className="hover:bg-slate-50/20 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            {client.avatar ? (
                              <img
                                src={client.avatar}
                                alt={client.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold text-[10px] border border-slate-200 shrink-0">
                                {client.name.substring(0, 2)}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{client.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono italic block mt-0.5">{client.email || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600 hidden sm:table-cell font-medium">
                          {client.company_name || <span className="text-slate-300">({t('individual')})</span>}
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-mono hidden md:table-cell">
                          {client.phone}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            client.status === 'active_client' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            client.status === 'negotiating' ? 'bg-orange-50 text-[#FF6500] border border-orange-100' :
                            client.status === 'lead' ? 'bg-amber-50 text-amber-600 border border-amber-50' :
                            'bg-slate-100/80 text-slate-600'
                          }`}>
                            {t(`status_${client.status}`) || client.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setSelectedClientForFiles(filesExpanded ? null : client.id)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-[#FF6500]" />
                            <span>{clientFiles.length} {isRtl ? 'مرفقات' : 'files'}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${filesExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {canEdit && (
                              <button
                                onClick={() => handleOpenForm(client)}
                                className="p-1 px-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                title={t('editClient')}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {activeUser?.role !== 'regular_user' && (
                              <button
                                onClick={() => onArchiveClient(client.id)}
                                className={`p-1 px-1.5 border border-slate-200 rounded-lg transition-colors cursor-pointer ${
                                  client.archived_at 
                                    ? 'hover:bg-emerald-50 hover:text-emerald-500 text-slate-400' 
                                    : 'hover:bg-orange-50 hover:text-[#FF6500] text-slate-400'
                                }`}
                                title={client.archived_at ? t('unarchive') : t('archive')}
                              >
                                {client.archived_at ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            {canDelete && (
                              <button
                                onClick={() => {
                                  if (confirm(isRtl ? 'هل أنت متأكد من حذف هذا العميل وكافة خطوط المفاوضات التابعة له نهائياً؟' : 'Are you sure you want to permanently delete this customer context?')) {
                                    onDeleteClient(client.id);
                                  }
                                }}
                                className="p-1 px-1.5 border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-500 text-slate-400 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded rows for files/attachments logs */}
                      {filesExpanded && (
                        <tr className="bg-slate-50/50 border-y border-slate-200">
                          <td colSpan={6} className="py-4 px-6">
                            <div className="space-y-4">
                              <h5 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-[#FF6500]" />
                                <span>{isRtl ? `مستندات ومرفقات العميل: ${client.name}` : `Documentation Files Log for ${client.name}`}</span>
                              </h5>

                              {clientFiles.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic font-medium">{isRtl ? 'لا توجد مستندات قانونية أو متطلبات فنية ملحقة بالعميل.' : 'No attached service assets.'}</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl">
                                  {clientFiles.map((file, idx) => (
                                    <div key={idx} className="p-2 border border-slate-200 rounded-lg bg-white flex items-center justify-between text-[11px]">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <FileText className="w-4 h-4 text-orange-400 shrink-0" />
                                        <span className="font-semibold text-slate-700 truncate">{file.name}</span>
                                      </div>
                                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">{file.size}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Form to append mock files */}
                              {canEdit && (
                                <form onSubmit={(e) => handleAddAttachment(e, client.id)} className="flex items-center gap-2 max-w-md pt-2 border-t border-slate-100">
                                  <input
                                    type="text"
                                    required
                                    value={tempAttachmentName}
                                    onChange={(e) => setTempAttachmentName(e.target.value)}
                                    placeholder={isRtl ? 'اسم الملف الجديد (مثل: عقد_الربط.pdf)...' : 'Attachment title...'}
                                    className="flex-1 py-1 px-3 border border-slate-200 rounded-lg text-xs"
                                  />
                                  <button
                                    type="submit"
                                    className="px-3 py-1 bg-[#FF6500] hover:bg-orange-600 transition-colors text-white font-bold text-xs rounded-lg cursor-pointer"
                                  >
                                    {isRtl ? 'إلحاق مستند' : 'Add doc'}
                                  </button>
                                </form>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL WINDOW FOR CLIENT CARD FORM (Add or Edit client parameters) */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-slide-in">
            <div 
              className="p-6 text-white flex justify-between items-center"
              style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
            >
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: 'var(--brand-secondary, #FF6500)' }} />
                <span>{editingClient ? t('editClient') : t('addClient')}</span>
              </h3>
              <button 
                onClick={() => setFormOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <ChevronDown className="w-6 h-6 rotate-90" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Client Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">{t('clientName')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="فهد الأحمد"
                    className="w-full py-2 px-3 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-[#FF6500]"
                  />
                </div>

                {/* Client phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">{t('clientPhone')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+966500000000"
                    className="w-full py-2 px-3 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-[#FF6500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">{t('clientEmail')}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="example@mail.com"
                    className="w-full py-2 px-3 border border-slate-200 rounded-md text-xs"
                  />
                </div>

                {/* Company name context */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">{t('companyName')}</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    placeholder="مجموعة الراجحي"
                    className="w-full py-2 px-3 border border-slate-200 rounded-md text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">{t('status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full py-2 px-3 border border-slate-200 rounded-md text-xs bg-white"
                  >
                    <option value="new">{t('status_new')}</option>
                    <option value="lead">{t('status_lead')}</option>
                    <option value="negotiating">{t('status_negotiating')}</option>
                    <option value="active_client">{t('status_active_client')}</option>
                    <option value="inactive">{t('status_inactive')}</option>
                  </select>
                </div>

                {/* Client type selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">{t('type')}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full py-2 px-3 border border-slate-200 rounded-md text-xs bg-white"
                  >
                    <option value="individual">{t('individual')}</option>
                    <option value="corporate">{t('corporate')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                {/* Physical Location address */}
                <label className="text-xs font-bold text-slate-600 block">{t('address')}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="الرياض، طريق العليا العام"
                  className="w-full py-2 px-3 border border-slate-200 rounded-md text-xs"
                />
              </div>

              <div className="space-y-1">
                {/* Free Text descriptive notes */}
                <label className="text-xs font-bold text-slate-600 block">{t('notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  placeholder="ملاحظات تفصيلية مستفيضة..."
                  className="w-full py-2 px-3 border border-slate-200 rounded-md text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold"
                >
                  {isRtl ? 'إلغاء' : 'Dismiss'}
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                  className="px-5 py-2 rounded-xl hover:opacity-90 transition-all text-white font-black shadow-sm cursor-pointer"
                >
                  {isRtl ? 'حفظ وحجز السجل' : 'Save & Close'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EXCEL IMPORT SIMULATION MODAL */}
      {importOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-slide-in">
            <div 
              className="p-6 text-white flex justify-between items-center"
              style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
            >
              <h3 className="font-bold text-xs uppercase tracking-widest">{t('importExcel')}</h3>
              <button onClick={() => setImportOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div 
                className={`py-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-4 transition-colors ${
                  dragActive ? 'border-[#FF6500] bg-orange-50/10' : 'border-slate-250 bg-slate-50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
              >
                <Upload className="w-10 h-10 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">{t('dragDrop')}</p>
                <span className="text-[10px] text-slate-400 block mt-1.5">(XLS, XLSX or CSV backup spreadsheets supported)</span>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  {isRtl 
                    ? 'بما أنك لست بحاجة لرفع ملفات حقيقية مبرمجة، يمكنك النقر على الزر بالأسفل وسيقوم التطبيق الفعال بمحاكاة وجلب شيت إكسل حقيقي يحتوي على عملاء وتغذية الجداول بشكل فوري!'
                    : 'A demo import template is prepared to load spreadsheet data directly into database tables instantly:'}
                </p>
                <button
                  onClick={triggerSampleImport}
                  className="w-full py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100/80 transition-colors text-[#FF6500] text-xs font-bold border border-orange-200 cursor-pointer"
                >
                  {isRtl ? 'تحميل ومعالجة بيانات ملف إكسل التجريبي' : 'Load and Process sample CRM Excel rows'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
