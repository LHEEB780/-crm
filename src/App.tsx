/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import ClientsView from './components/ClientsView';
import CompaniesView from './components/CompaniesView';
import SalesView from './components/SalesView';
import TasksView from './components/TasksView';
import CalendarView from './components/CalendarView';
import RBACView from './components/RBACView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import AIRobotsView from './components/AIRobotsView';
import { 
  Client, Company, CompanyBranch, CompanyContact, 
  Contract, Lead, Opportunity, Deal, Quotation, Invoice, Task, User, ActivityLog 
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  
  // Real full-stack loaded collections
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  // Sales state lists
  const [leads, setLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [quotations, setQuotationList] = useState<Quotation[]>([]);
  const [invoices, setInvoicesList] = useState<Invoice[]>([]);
  
  // Tasks, Logs, Notifications
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Dashboard overall aggregates state
  const [dashboardStats, setDashboardStats] = useState<any>({
    stats: {
      totalClients: 0,
      archivedClients: 0,
      activeLeads: 0,
      totalPaidEarnings: 0,
      pendingEarnings: 0,
      activeTasks: 0,
      urgentTasks: 0
    },
    leadsFunnel: { new: 0, contacted: 0, qualified: 0, unqualified: 0 },
    recentClients: [],
    recentLogs: []
  });

  const [loading, setLoading] = useState(true);

  // Sync API Fetching function
  const fetchEverything = async () => {
    try {
      // 1. Session and users list
      const sessRes = await fetch('/api/session');
      if (sessRes.ok) {
        const sessData = await sessRes.json();
        setActiveUser(sessData.user);
      }

      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const usersList = await usersRes.json();
        setAllUsers(usersList);
      }

      // 2. Clients
      const clientsRes = await fetch('/api/clients');
      if (clientsRes.ok) {
        const clientsList = await clientsRes.json();
        setClients(clientsList);
      }

      // 3. Campanies structural directories
      const compRes = await fetch('/api/companies');
      if (compRes.ok) setCompanies(await compRes.json());

      const branchRes = await fetch('/api/branches');
      if (branchRes.ok) setBranches(await branchRes.json());

      const contactRes = await fetch('/api/contacts');
      if (contactRes.ok) setContacts(await contactRes.json());

      const contractRes = await fetch('/api/contracts');
      if (contractRes.ok) setContracts(await contractRes.json());

      // 4. Sales metrics
      const salesRes = await fetch('/api/sales');
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setLeads(salesData.leads || []);
        setOpportunities(salesData.opportunities || []);
        setDeals(salesData.deals || []);
        setQuotationList(salesData.quotations || []);
        setInvoicesList(salesData.invoices || []);
      }

      // 5. Tasks
      const tasksRes = await fetch('/api/tasks');
      if (tasksRes.ok) setTasks(await tasksRes.json());

      // 6. Logs & Notifications
      const logsRes = await fetch('/api/logs');
      if (logsRes.ok) setActivityLogs(await logsRes.json());

      const notifsRes = await fetch('/api/notifications');
      if (notifsRes.ok) setNotifications(await notifsRes.json());

      // 7. Core dashboard aggregates
      const dbRes = await fetch('/api/dashboard');
      if (dbRes.ok) {
        const dbMetrics = await dbRes.json();
        setDashboardStats(dbMetrics);
      }

      // 8. Restore theme colors
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings.primary_color) {
          document.documentElement.style.setProperty('--brand-primary', settings.primary_color);
          localStorage.setItem('crm_theme_primary', settings.primary_color);
        }
        if (settings.secondary_color) {
          document.documentElement.style.setProperty('--brand-secondary', settings.secondary_color);
          localStorage.setItem('crm_theme_secondary', settings.secondary_color);
        }
      }

    } catch (e) {
      console.error('Full-stack CRM synchronization failure:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEverything();

    const handleThemeChange = (e: any) => {
      if (e.detail?.primary) {
        document.documentElement.style.setProperty('--brand-primary', e.detail.primary);
      }
      if (e.detail?.secondary) {
        document.documentElement.style.setProperty('--brand-secondary', e.detail.secondary);
      }
    };
    window.addEventListener('crm-theme-changed', handleThemeChange);
    return () => window.removeEventListener('crm-theme-changed', handleThemeChange);
  }, []);

  // Simulating real user RBAC switches
  const handleSwitchUser = async (userId: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/session/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        await fetchEverything();
      }
    } catch (e) {
      console.error('Role switcher failure:', e);
    }
  };

  // Mark interactive notifications read
  const handleMarkNotificationRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        // refresh core dashboard view metrics
        fetchEverything();
      }
    } catch (e) {
      console.error('Notification read error:', e);
    }
  };

  // CLIENT MUTATIONS
  const handleAddClient = async (clientData: any) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Add client fails:', e);
    }
  };

  const handleUpdateClient = async (id: number, clientData: any) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Update client fails:', e);
    }
  };

  const handleDeleteClient = async (id: number) => {
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Delete client fails:', e);
    }
  };

  const handleArchiveClient = async (id: number) => {
    try {
      const res = await fetch(`/api/clients/${id}/archive`, { method: 'POST' });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Archive client error:', e);
    }
  };

  const handleImportClients = async (clientsList: any[]) => {
    try {
      const res = await fetch('/api/clients/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientsList })
      });
      if (res.ok) {
        alert(language === 'ar' ? `استيراد كامل لِـ ${clientsList.length} عميل في قواعد البيانات!` : `Imported ${clientsList.length} customers successfully!`);
        await fetchEverything();
      }
    } catch (e) {
      console.error('XML/Excel import error:', e);
    }
  };

  // COMPANY PARTNERS & CONTRACTS MUTATIONS
  const handleAddCompany = async (compData: any) => {
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compData)
      });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Add company fails:', e);
    }
  };

  const handleAddContract = async (contractData: any) => {
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData)
      });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Add contract fails:', e);
    }
  };

  // SALES PIPELINE MUTATIONS
  const handleUpdateLeadStatus = async (leadId: number, status: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Shifting lead phase error:', e);
    }
  };

  const handleUpdateLeadPriority = async (leadId: number, priority: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/priority`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Updating lead priority error:', e);
    }
  };

  const handleUpdateInvoiceStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(language === 'ar' ? 'تم معالجة السداد وتعديل ميزان الإيرادات والأكواد الضريبية بنجاح!' : 'Payment processed. Revenue balances updated!');
        await fetchEverything();
      }
    } catch (e) {
      console.error('Invoice payment error:', e);
    }
  };

  const handleAddLead = async (leadData: any) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Add lead error:', e);
    }
  };

  const handleAddOpportunity = async (oppData: any) => {
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oppData)
      });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Add opp error:', e);
    }
  };

  const handleAddQuotation = async (quoteData: any) => {
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData)
      });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Add quotation error:', e);
    }
  };

  const handleAddInvoice = async (invoiceData: any) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Add invoice error:', e);
    }
  };

  // TASKS MULTI-MUTATIONS
  const handleAddTask = async (taskData: any) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Task schedule error:', e);
    }
  };

  const handleUpdateTask = async (id: number, taskData: any) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Update task error:', e);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchEverything();
    } catch (e) {
      console.error('Remove task error:', e);
    }
  };

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      language={language}
      setLanguage={setLanguage}
      activeUser={activeUser}
      allUsers={allUsers}
      onSwitchUser={handleSwitchUser}
      notifications={notifications}
      onMarkNotificationRead={handleMarkNotificationRead}
      clients={clients}
      leads={leads}
      tasks={tasks}
      onAddClient={handleAddClient}
      onAddTask={handleAddTask}
      onAddLead={handleAddLead}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
          <div 
            className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--brand-secondary, #FF6500)', borderTopColor: 'transparent' }}
          ></div>
          <span className="text-xs font-bold text-slate-500 font-mono">Synchronizing CRM Collections...</span>
        </div>
      ) : (
        <>
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={dashboardStats.stats}
              leadsFunnel={dashboardStats.leadsFunnel}
              recentClients={dashboardStats.recentClients}
              recentLogs={dashboardStats.recentLogs}
              language={language}
              onQuickAction={(actionId) => setCurrentTab(actionId)}
              clients={clients}
            />
          )}

          {currentTab === 'clients' && (
            <ClientsView
              clients={clients}
              activeUser={activeUser}
              language={language}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              onArchiveClient={handleArchiveClient}
              onImportBulk={handleImportClients}
            />
          )}

          {currentTab === 'companies' && (
            <CompaniesView
              companies={companies}
              branches={branches}
              contacts={contacts}
              contracts={contracts}
              language={language}
              onAddCompany={handleAddCompany}
              onAddContract={handleAddContract}
            />
          )}

          {currentTab === 'sales' && (
            <SalesView
              clients={clients}
              leads={leads}
              opportunities={opportunities}
              deals={deals}
              quotations={quotations}
              invoices={invoices}
              language={language}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onUpdateLeadPriority={handleUpdateLeadPriority}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
              onAddLead={handleAddLead}
              onAddOpportunity={handleAddOpportunity}
              onAddQuotation={handleAddQuotation}
              onAddInvoice={handleAddInvoice}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              users={allUsers}
              clients={clients}
              activeUser={activeUser}
              language={language}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              users={allUsers}
              clients={clients}
              language={language}
              onAddTask={handleAddTask}
            />
          )}

          {currentTab === 'rbac' && (
            <RBACView
              users={allUsers}
              activeUser={activeUser}
              language={language}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              clients={clients}
              leads={leads}
              invoices={invoices}
              contracts={contracts}
              language={language}
            />
          )}

          {currentTab === 'ai_robots' && (
            <AIRobotsView
              language={language}
              onRefreshData={fetchEverything}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              language={language}
              onRefreshData={fetchEverything}
            />
          )}
        </>
      )}
    </Layout>
  );
}
