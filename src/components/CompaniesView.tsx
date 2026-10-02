/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, MapPin, Phone, Globe, ShieldCheck, 
  FileText, Plus, Landmark, ArrowUpRight, Search, Landmark as BranchIcon,
  ChevronDown
} from 'lucide-react';
import { translations } from '../locales';
import { Company, CompanyBranch, CompanyContact, Contract } from '../types';

interface CompaniesProps {
  companies: Company[];
  branches: CompanyBranch[];
  contacts: CompanyContact[];
  contracts: Contract[];
  language: 'ar' | 'en';
  onAddCompany: (data: any) => void;
  onAddContract: (data: any) => void;
}

export default function CompaniesView({
  companies,
  branches,
  contacts,
  contracts,
  language,
  onAddCompany,
  onAddContract
}: CompaniesProps) {
  const t = (key: string) => translations[key]?.[language] || key;
  const isRtl = language === 'ar';

  const [activeCompanyTab, setActiveCompanyTab] = useState<number>(companies[0]?.id || 1);
  const [searchQuery, setSearchQuery] = useState('');

  // Creation forms
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [contractFormOpen, setContractFormOpen] = useState(false);

  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    email: '',
    phone: '',
    website: '',
    address: ''
  });

  const [newContract, setNewContract] = useState({
    company_id: activeCompanyTab,
    title: '',
    value: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  const selectedCompany = companies.find(c => c.id === activeCompanyTab) || companies[0];
  const companyBranches = branches.filter(b => b.company_id === activeCompanyTab);
  const companyContacts = contacts.filter(c => c.company_id === activeCompanyTab);
  const companyContracts = contracts.filter(c => c.company_id === activeCompanyTab);

  const totalContractsValue = companyContracts.reduce((sum, c) => sum + Number(c.value), 0);

  const formatCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(val);
    return isRtl ? `${formatted} ر.س` : `${formatted} SAR`;
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCompany(newCompany);
    setNewCompany({ name: '', industry: '', email: '', phone: '', website: '', address: '' });
    setCompanyFormOpen(false);
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    onAddContract({
      ...newContract,
      company_id: activeCompanyTab,
      value: Number(newContract.value)
    });
    setNewContract({ company_id: activeCompanyTab, title: '', value: '', start_date: '', end_date: '', status: 'active' });
    setContractFormOpen(false);
  };

  // filter company matching queries
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner and Quick additions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t('companies')}</span>
            <Building2 className="w-5 h-5 text-[#FF6500]" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl ? 'إدارة مقرات الشركات الشريكة، فروعها التشغيلية، جهات الاتصال المسؤولة، وسجل العقود والاتفاقيات المبرمة.' : 'Manage corporate customer accounts, secondary branches, purchase contacts and active legal agreements'}
          </p>
        </div>
        <button
          onClick={() => setCompanyFormOpen(true)}
          style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:opacity-90 transition-all font-bold text-xs text-white shadow-sm self-start md:self-auto cursor-pointer"
        >
          <Building2 className="w-4 h-4" style={{ color: 'var(--brand-secondary, #FF6500)' }} />
          <span>{t('addCompany')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: COMPANY LIST & FILTER */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4 h-[calc(100vh-280px)] overflow-y-auto">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'ابحث عن منشأة...' : 'Search company partners...'}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            {filteredCompanies.map(company => (
              <button
                key={company.id}
                onClick={() => {
                  setActiveCompanyTab(company.id);
                  setNewContract(prev=>({...prev, company_id: company.id}));
                }}
                className={`w-full text-start p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer group ${
                  activeCompanyTab === company.id
                    ? 'border-orange-500 bg-[#0B192C] text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="font-bold text-xs">{company.name}</p>
                  <span className={`text-[10px] mt-1 block font-mono ${activeCompanyTab === company.id ? 'text-orange-400' : 'text-slate-400'}`}>
                    {company.industry || '-'}
                  </span>
                </div>
                <ArrowUpRight className={`w-3.5 h-3.5 transition-transform ${
                  activeCompanyTab === company.id ? 'text-orange-400 scale-110' : 'text-slate-400 group-hover:translate-x-0.5'
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMNS: SELECTED COMPANY PROFILE DETAILS */}
        {selectedCompany ? (
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Main company metrics card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-[#FF6500] shrink-0 font-bold text-base">
                    {selectedCompany.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{selectedCompany.name}</h3>
                    <p className="text-[11px] text-[#FF6500] font-bold mt-0.5 uppercase tracking-wide">{selectedCompany.industry}</p>
                  </div>
                </div>

                <div className="bg-slate-50 px-4 py-2 rounded-xl text-center border border-slate-100 shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">{isRtl ? 'حجم التعاقدات الإجمالي' : 'Aggregated Agreements Value'}</span>
                  <span className="text-sm font-black text-[#0B192C] tracking-tight">{formatCurrency(totalContractsValue)}</span>
                </div>
              </div>

              {/* Grid metadata info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Globe className="w-4 h-4 text-[#FF6500] shrink-0" />
                  <span className="truncate">{selectedCompany.website || '-'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Phone className="w-4 h-4 text-[#FF6500] shrink-0" />
                  <span className="truncate font-mono">{selectedCompany.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-[#FF6500] shrink-0" />
                  <span className="truncate">{selectedCompany.address || '-'}</span>
                </div>
              </div>
            </div>

            {/* 2. Branches directories & Contact lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Branches Panel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-bold text-xs tracking-widest text-[#0B192C] uppercase border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>{t('branchesList')}</span>
                </h4>

                {companyBranches.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">{isRtl ? 'لم يتم العثور على فروع مسجلة لهذه الشركة.' : 'No geographical branches registered.'}</p>
                ) : (
                  <div className="space-y-3 max-h-56 overflow-y-auto">
                    {companyBranches.map(br => (
                      <div key={br.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between items-center font-bold text-slate-800">
                          <span>{br.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-orange-100 text-[#FF6500] text-[9px] font-sans font-bold">{br.city}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{br.address}</p>
                        <div className="pt-1.5 border-t border-slate-200/60 text-[10px] flex justify-between items-center text-slate-400">
                          <span>👤 {br.manager_name}</span>
                          <span className="font-mono">{br.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Procurement Contacts Panel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-bold text-xs tracking-widest text-[#0B192C] uppercase border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  <span>{t('contactsList')}</span>
                </h4>

                {companyContacts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">{isRtl ? 'لا توجد جهات اتصال تم شراؤها أو إضافتها.' : 'No procurement direct contacts registered.'}</p>
                ) : (
                  <div className="space-y-3 max-h-56 overflow-y-auto">
                    {companyContacts.map(ct => (
                      <div key={ct.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-xs text-slate-600">
                        <p className="font-bold text-slate-800">{ct.name}</p>
                        <p className="text-[11px] text-[#FF6500] font-semibold">{ct.position || '-'}</p>
                        <div className="pt-1.5 text-[10px] text-slate-400 flex flex-wrap justify-between items-center font-mono gap-1">
                          <span>📧 {ct.email}</span>
                          <span>📞 {ct.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* 3. Operational contracts center logs */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="font-bold text-xs tracking-widest text-[#0B192C] uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span>{t('contractsTitle')}</span>
                </h4>
                <button
                  onClick={() => setContractFormOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-orange-50 hover:text-[#FF6500] text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addContract')}</span>
                </button>
              </div>

              {companyContracts.length === 0 ? (
                <div className="text-center p-8 space-y-1.5">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 italic font-medium">{isRtl ? 'لا توجد عقود معتمدة مسبقاً.' : 'No running contracts logged.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {companyContracts.map(con => (
                    <div key={con.id} className="p-4 border border-slate-200 hover:border-orange-200 bg-white rounded-2xl relative shadow-xs flex flex-col justify-between gap-3 group">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h5 className="font-bold text-xs text-slate-800 group-hover:text-[#FF6500] transition-colors">{con.title}</h5>
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold shrink-0 uppercase tracking-wider ${
                            con.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                            con.status === 'under_review' ? 'bg-amber-50 text-amber-500' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {con.status}
                          </span>
                        </div>
                        <span className="text-sm font-black text-slate-900 block mt-2 font-serif">{formatCurrency(con.value)}</span>
                      </div>
                      
                      <div className="border-t border-slate-100 pt-2.5 text-[9px] text-slate-400 font-mono flex justify-between">
                        <span>START: {con.start_date}</span>
                        <span>END: {con.end_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="lg:col-span-3 text-center p-16">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500">Please register a partner company to initiate metadata tracking.</p>
          </div>
        )}

      </div>

      {/* MODAL 1: ADD COMPANY */}
      {companyFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-slide-in">
            <div 
              className="p-5 text-white flex justify-between items-center"
              style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
            >
              <h3 className="font-bold text-xs uppercase tracking-widest">{t('addCompany')}</h3>
              <button onClick={() => setCompanyFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <ChevronDown className="w-6 h-6 rotate-90" />
              </button>
            </div>
            <form onSubmit={handleCreateCompany} className="p-6 space-y-4 text-xs font-serif">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">{isRtl ? 'اسم المنشأة/الجهة *' : 'Company Brand Name *'}</label>
                <input
                  type="text" required
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                  placeholder="مجموعة محمد النهدي القابضة"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">{isRtl ? 'القطاع والصناعة *' : 'Industry sector *'}</label>
                <input
                  type="text" required
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                  placeholder="المالية والاستثمار، تقنية معلومات"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Email</label>
                  <input
                    type="email"
                    value={newCompany.email}
                    onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                    placeholder="hq@nahdi.sa"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Phone</label>
                  <input
                    type="text"
                    value={newCompany.phone}
                    onChange={(e) => setNewCompany({...newCompany, phone: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                    placeholder="920044455"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Website</label>
                <input
                  type="text"
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({...newCompany, website: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                  placeholder="www.nahdigroup.sa"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Address</label>
                <input
                  type="text"
                  value={newCompany.address}
                  onChange={(e) => setNewCompany({...newCompany, address: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                  placeholder="الرياض، حي الصحافة"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setCompanyFormOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl font-bold">
                  {isRtl ? 'إلغاء' : 'Dismiss'}
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                  className="px-5 py-2 rounded-xl hover:opacity-90 text-white font-black cursor-pointer shadow-sm transition-all"
                >
                  {isRtl ? 'إدراج الشركة' : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CONTRACT */}
      {contractFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-slide-in">
            <div 
              className="p-5 text-white flex justify-between items-center"
              style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
            >
              <h3 className="font-bold text-xs uppercase tracking-widest">{t('addContract')}</h3>
              <button onClick={() => setContractFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <ChevronDown className="w-6 h-6 rotate-90" />
              </button>
            </div>
            <form onSubmit={handleCreateContract} className="p-6 space-y-4 text-xs font-serif">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">{isRtl ? 'موضوع / عنوان الاتفاقية الاتفاقية *' : 'Contract Subject / Title *'}</label>
                <input
                  type="text" required
                  value={newContract.title}
                  onChange={(e) => setNewContract({...newContract, title: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                  placeholder="عقد ربط وصيانة سنوي للخوادم السحابية البرمجية المعززة"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">{isRtl ? 'قيمة العقد المالية (SAR) *' : 'Financial Statement Value (SAR) *'}</label>
                <input
                  type="number" required
                  value={newContract.value}
                  onChange={(e) => setNewContract({...newContract, value: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-slate-700"
                  placeholder="120000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Start Date</label>
                  <input
                    type="date" required
                    value={newContract.start_date}
                    onChange={(e) => setNewContract({...newContract, start_date: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">End Date</label>
                  <input
                    type="date" required
                    value={newContract.end_date}
                    onChange={(e) => setNewContract({...newContract, end_date: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Status</label>
                <select
                  value={newContract.status}
                  onChange={(e) => setNewContract({...newContract, status: e.target.value as any})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="active">Active</option>
                  <option value="under_review">Under Review</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setContractFormOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl font-bold">
                  {isRtl ? 'إلغاء' : 'Dismiss'}
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                  className="px-5 py-2 rounded-xl hover:opacity-90 text-white font-black cursor-pointer shadow-sm transition-all"
                >
                  {isRtl ? 'اعتماد العقد' : 'Commit Agreement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
