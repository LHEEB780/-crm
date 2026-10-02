/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DB } from './server/database';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares to parse bodies
  app.use(express.json());

  // Simulating active user session variables
  let currentUserId = 1; // Default to Admin Ahmad

  // --- API ROUTES ---

  // 1. Simulating Session Active User / Role Switcher
  app.get('/api/session', (req, res) => {
    const fullData = DB.getFullData();
    const currentUser = fullData.users.find(u => u.id === currentUserId) || fullData.users[0];
    res.json({
      userId: currentUserId,
      user: currentUser,
      roles: [
        { id: 1, name: 'super_admin', name_ar: 'مدير النظام', name_en: 'System Administrator' },
        { id: 2, name: 'sales_manager', name_ar: 'مدير المبيعات', name_en: 'Sales Manager' },
        { id: 3, name: 'sales_employee', name_ar: 'موظف المبيعات', name_en: 'Sales Representative' },
        { id: 4, name: 'supervisor', name_ar: 'المشرف العام', name_en: 'Supervisor' },
        { id: 5, name: 'regular_user', name_ar: 'مستخدم عادي', name_en: 'Regular User' }
      ]
    });
  });

  app.post('/api/session/switch', (req, res) => {
    const { userId } = req.body;
    const fullData = DB.getFullData();
    const exists = fullData.users.find(u => u.id === Number(userId));
    if (exists) {
      currentUserId = Number(userId);
      DB.logActivity(currentUserId, 'login', undefined, undefined, `تم تبديل المستخدم النشط إلى "${exists.name}"`, `Simulated active user switched to "${exists.name}"`);
      res.json({ success: true, user: exists });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  // 2. Dashboard Analytics
  app.get('/api/dashboard', (req, res) => {
    try {
      const data = DB.getFullData();
      
      // Calculate Stats
      const activeClients = data.clients.filter(c => c.archived_at == null);
      const totalClientsCount = activeClients.length;
      const archivedClientsCount = data.clients.filter(c => c.archived_at != null).length;
      
      const activeLeadsCount = data.leads.filter(l => l.status !== 'unqualified').length;
      
      const totalInvoicesPaidSum = data.invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + Number(i.total_amount), 0);
        
      const pendingInvoicesSum = data.invoices
        .filter(i => i.status === 'unpaid' || i.status === 'partially_paid')
        .reduce((sum, i) => sum + Number(i.total_amount), 0);

      const activeTasksCount = data.tasks.filter(t => t.status !== 'completed' && t.status !== 'canceled').length;
      const urgentTasksCount = data.tasks.filter(t => t.status !== 'completed' && t.status !== 'canceled' && t.priority === 'urgent').length;

      // Sales Funnel statistics
      const leadsByStatus = {
        new: data.leads.filter(l => l.status === 'new').length,
        contacted: data.leads.filter(l => l.status === 'contacted').length,
        qualified: data.leads.filter(l => l.status === 'qualified').length,
        unqualified: data.leads.filter(l => l.status === 'unqualified').length,
      };

      // Recents
      const recentClients = [...activeClients]
        .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      const recentLogs = data.activity_logs.slice(0, 6);

      res.json({
        stats: {
          totalClients: totalClientsCount,
          archivedClients: archivedClientsCount,
          activeLeads: activeLeadsCount,
          totalPaidEarnings: totalInvoicesPaidSum,
          pendingEarnings: pendingInvoicesSum,
          activeTasks: activeTasksCount,
          urgentTasks: urgentTasksCount
        },
        leadsFunnel: leadsByStatus,
        recentClients,
        recentLogs,
        companyNameAr: data.settings.company_name_ar,
        companyNameEn: data.settings.company_name_en,
        taxRate: data.settings.tax_rate,
        currencyAr: data.settings.currency_ar,
        currencyEn: data.settings.currency_en
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 3. Clients CRUD
  app.get('/api/clients', (req, res) => {
    res.json(DB.getClients());
  });

  app.post('/api/clients', (req, res) => {
    const fresh = DB.addClient(currentUserId, req.body);
    res.status(201).json(fresh);
  });

  app.put('/api/clients/:id', (req, res) => {
    const updated = DB.updateClient(currentUserId, Number(req.params.id), req.body);
    if (updated) res.json(updated);
    else res.status(404).json({ error: 'Client not found' });
  });

  app.delete('/api/clients/:id', (req, res) => {
    const success = DB.deleteClient(currentUserId, Number(req.params.id));
    if (success) res.json({ success: true });
    else res.status(404).json({ error: 'Client not found' });
  });

  app.post('/api/clients/:id/archive', (req, res) => {
    const updated = DB.archiveClient(currentUserId, Number(req.params.id));
    if (updated) res.json(updated);
    else res.status(404).json({ error: 'Client not found' });
  });

  // Dynamic Mail Synchronization simulation
  app.post('/api/clients/:id/sync-emails', (req, res) => {
    const client = DB.getClientById(Number(req.params.id));
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const { language = 'ar' } = req.body;
    const isAr = language === 'ar';
    const clientName = client.name;
    const companyName = client.company_name || 'الربط المباشر';

    // Core mail template list
    const simulatedEmails = isAr ? [
      {
        id: `email-${Date.now()}-1`,
        subject: `متابعة: طلب استكمال وثائق الشراكة وتأكيد ترقية باقة السيرفر لِـ ${companyName}`,
        body: `السلام عليكم ورحمة الله وبركاته،\n\nالسيد ${clientName}،\n\nنشكركم على ثقتكم الغالية بنا وتواصلكم المستمر. لقد استلمنا بريدكم الأخير بخصوص مسودة البنية البرمجية، ويسرنا تزويدكم بالترقية المطلوبة. يرجى التكرم بتوقيع نسخة الاتفاقية القانونية NDA الملحقة بفولدر السجلات لنبدأ فوراً.\n\nتقبلوا فائق تقديرنا،\nم. رعد القحطاني - إدارة علاقات العملاء في الإدارة العامة`,
        date: new Date().toISOString(),
        from: 'r.qahtani@crm-solutions.com',
        folder: 'inbox'
      },
      {
        id: `email-${Date.now()}-2`,
        subject: `استفسار بخصوص تدشين لوحة التحكم والجدول الزمني للربط`,
        body: `أهلاً رعد،\n\nقمنا بمناقشة الخطة داخل طاقم العمل في ${companyName}، ونرغب بمعرفة هل من الممكن تفعيل التدريب النظري لممثلي مصلحة الدعم التقني الأسبوع القادم؟ سنكون جاهزين لبدء رفع الملفات على السيرفرات الاختبارية صباح الثلاثاء.\n\nتحياتي وتقديري،\n${clientName}`,
        date: new Date(Date.now() - 3600000).toISOString(),
        from: client.email || 'client@business.com',
        folder: 'sent'
      },
      {
        id: `email-${Date.now()}-3`,
        subject: `تأكيد حجز الجلسة الاستشارية ومناقشة تفاصيل الفواتير والضرائب`,
        body: `مرحباً ${clientName}،\n\nنود إفادتكم بأنه تم جدولة لقائكم الفني المباشر مع رئيس قسم الأنظمة يوم الخميس القادم الساعة ١١:٠٠ صباحاً بتوقيت الرياض لمراجعة استقطاع الفواتير ضريبياً وتصفير عقود التوريد السنوية.\n\nشكراً لكم واختياركم لنا شريكاً لنجاحكم،\nCRM automated dispatch`,
        date: new Date(Date.now() - 7200000).toISOString(),
        from: 'financial@crm-solutions.com',
        folder: 'inbox'
      }
    ] : [
      {
        id: `email-${Date.now()}-1`,
        subject: `Follow-up: SLA Technical Specifications and Service Deployment for ${companyName}`,
        body: `Dear ${clientName},\n\nWe trust this message finds you well.\n\nWe have received your requested server configurations for ${companyName}. Our technology officer has validated your nodes, and we are ready to proceed with deployment. Please review the attached contract sheet in your attachments tab and let us know if any terms need alignment.\n\nWarm regards,\nCRM Enterprise Team`,
        date: new Date().toISOString(),
        from: 'relations@crm-solutions.com',
        folder: 'inbox'
      },
      {
        id: `email-${Date.now()}-2`,
        subject: `RE: SLA Technical Specifications and Service Deployment`,
        body: `Hi CRM team,\n\nWe reviewed the SLA and find the parameters excellent. We have uploaded our company registration to the attachment folder. Looking forward to our kickoff workshop soon.\n\nBest,\n${clientName}`,
        date: new Date(Date.now() - 1800000).toISOString(),
        from: client.email || 'client@business.com',
        folder: 'sent'
      }
    ];

    // Append to client emails
    const existingEmails = client.emails || [];
    const updated = DB.updateClient(currentUserId, client.id, {
      emails: [...simulatedEmails, ...existingEmails]
    });

    DB.logActivity(currentUserId, 'update', 'Client', client.id, `مزامنة البريد الإلكتروني وجلب المراسلات للعميل ${clientName}`, `Synchronized correspondence logs with mail server for client ${clientName}`);

    res.json(updated);
  });

  // AI-Image Profile Generator Simulation
  app.post('/api/clients/:id/generate-avatar', (req, res) => {
    const client = DB.getClientById(Number(req.params.id));
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const { prompt, style = 'corporate' } = req.body;

    // Curated high quality avatars index representing different corporate styles
    const corporateWomen = [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&h=300&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
      'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&h=300&q=80'
    ];

    const corporateMen = [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80'
    ];

    let selectedAvatar = '';

    if (style === 'corporate_classic') {
      // Choose based on name cues or randomness
      const isFemaleHint = client.name.includes('منى') || client.name.includes('سارة') || client.name.includes('نورة') || client.name.includes('منى') || client.name.includes('بشرى');
      const portraits = isFemaleHint ? corporateWomen : corporateMen;
      const seedIndex = client.name.charCodeAt(0) % portraits.length;
      selectedAvatar = portraits[seedIndex];
    } else if (style === 'vector_badge') {
      const escapedSeed = encodeURIComponent(client.name);
      selectedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${escapedSeed}&backgroundColor=0b192c,ff6500,22c55e,a855f7&fontSize=42`;
    } else if (style === 'shapes_creative') {
      const escapedSeed = encodeURIComponent(client.name);
      selectedAvatar = `https://api.dicebear.com/7.x/shapes/svg?seed=${escapedSeed}`;
    } else {
      // Default fallback - nice warm corporate stock
      const combined = [...corporateWomen, ...corporateMen];
      const seedIndex = client.name.charCodeAt(0) % combined.length;
      selectedAvatar = combined[seedIndex];
    }

    const updated = DB.updateClient(currentUserId, client.id, {
      avatar: selectedAvatar
    });

    DB.logActivity(
      currentUserId,
      'update',
      'Client',
      client.id,
      `إنشاء وتعيين صورة رمزية ذكية (AI Avatar) للعميل ${client.name} بنمط "${style}"`,
      `Generated and set smart profile AI avatar for client ${client.name} with "${style}" style`
    );

    res.json(updated);
  });

  // Excel Excel Import Simulator
  app.post('/api/clients/import', (req, res) => {
    const { clientsList } = req.body;
    if (!clientsList || !Array.isArray(clientsList)) {
      return res.status(400).json({ error: 'No clients list provided' });
    }
    const importedCount = clientsList.length;
    for (const client of clientsList) {
      DB.addClient(currentUserId, {
        name: client.name || 'مستورد',
        email: client.email || '',
        phone: client.phone || '050000000',
        company_name: client.company_name || '',
        status: client.status || 'new',
        type: client.type || 'individual',
        address: client.address || '',
        notes: client.notes || 'مستورد عبر ملف إكسل',
        archived_at: null
      });
    }
    DB.logActivity(currentUserId, 'import', 'Client', undefined, `استيراد بنجاح لعدد ${importedCount} عميل عبر شيت إكسل`, `Successfully imported ${importedCount} client items via Excel upload`);
    res.json({ success: true, count: importedCount });
  });

  // 4. Companies CRUD
  app.get('/api/companies', (req, res) => {
    res.json(DB.getCompanies());
  });

  app.post('/api/companies', (req, res) => {
    const fresh = DB.addCompany(currentUserId, req.body);
    res.status(201).json(fresh);
  });

  app.put('/api/companies/:id', (req, res) => {
    const updated = DB.updateCompany(currentUserId, Number(req.params.id), req.body);
    if (updated) res.json(updated);
    else res.status(404).json({ error: 'Company not found' });
  });

  app.delete('/api/companies/:id', (req, res) => {
    const success = DB.deleteCompany(currentUserId, Number(req.params.id));
    if (success) res.json({ success: true });
    else res.status(404).json({ error: 'Company not found' });
  });

  // Branches, Contacts, Contracts
  app.get('/api/branches', (req, res) => {
    res.json(DB.getBranches());
  });

  app.post('/api/branches', (req, res) => {
    res.status(201).json(DB.addBranch(currentUserId, req.body));
  });

  app.get('/api/contacts', (req, res) => {
    res.json(DB.getContacts());
  });

  app.post('/api/contacts', (req, res) => {
    res.status(201).json(DB.addContact(currentUserId, req.body));
  });

  app.get('/api/contracts', (req, res) => {
    res.json(DB.getContracts());
  });

  app.post('/api/contracts', (req, res) => {
    res.status(201).json(DB.addContract(currentUserId, req.body));
  });

  // 5. Sales & Pipeline (Leads, Opportunities, Deals, Quotations, Invoices)
  app.get('/api/sales', (req, res) => {
    res.json({
      leads: DB.getLeads(),
      opportunities: DB.getOpportunities(),
      deals: DB.getDeals(),
      quotations: DB.getQuotations(),
      invoices: DB.getInvoices()
    });
  });

  app.post('/api/leads', (req, res) => {
    const entry = DB.addLead(currentUserId, req.body);
    res.status(201).json(entry);
  });

  app.put('/api/leads/:id/status', (req, res) => {
    const { status } = req.body;
    const entry = DB.updateLeadStatus(currentUserId, Number(req.params.id), status);
    if (entry) res.json(entry);
    else res.status(404).json({ error: 'Lead not found' });
  });

  app.put('/api/leads/:id/priority', (req, res) => {
    const { priority } = req.body;
    const entry = DB.updateLeadPriority(currentUserId, Number(req.params.id), priority);
    if (entry) res.json(entry);
    else res.status(404).json({ error: 'Lead not found' });
  });

  app.post('/api/opportunities', (req, res) => {
    const entry = DB.addOpportunity(currentUserId, req.body);
    res.status(201).json(entry);
  });

  app.post('/api/quotations', (req, res) => {
    const entry = DB.addQuotation(currentUserId, req.body);
    res.status(201).json(entry);
  });

  app.post('/api/invoices', (req, res) => {
    const entry = DB.addInvoice(currentUserId, req.body);
    res.status(201).json(entry);
  });

  app.put('/api/invoices/:id/status', (req, res) => {
    const { status } = req.body;
    const entry = DB.updateInvoiceStatus(currentUserId, Number(req.params.id), status);
    if (entry) res.json(entry);
    else res.status(404).json({ error: 'Invoice not found' });
  });

  // 6. Tasks CRUD (priorities/assignments)
  app.get('/api/tasks', (req, res) => {
    res.json(DB.getTasks());
  });

  app.post('/api/tasks', (req, res) => {
    const entry = DB.addTask(currentUserId, req.body);
    res.status(201).json(entry);
  });

  app.put('/api/tasks/:id', (req, res) => {
    const entry = DB.updateTask(currentUserId, Number(req.params.id), req.body);
    if (entry) res.json(entry);
    else res.status(404).json({ error: 'Task not found' });
  });

  app.post('/api/tasks/:id/comments', (req, res) => {
    const entry = DB.addTaskComment(currentUserId, Number(req.params.id), req.body);
    if (entry) res.json(entry);
    else res.status(404).json({ error: 'Task not found' });
  });

  // Subtasks endpoints
  app.post('/api/tasks/:id/subtasks', (req, res) => {
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Subtask title is required' });
    }
    const entry = DB.addSubtask(currentUserId, Number(req.params.id), title);
    if (entry) res.status(201).json(entry);
    else res.status(404).json({ error: 'Task not found' });
  });

  app.patch('/api/tasks/:id/subtasks/:subtaskId', (req, res) => {
    const { completed } = req.body;
    const entry = DB.toggleSubtask(currentUserId, Number(req.params.id), req.params.subtaskId, completed);
    if (entry) res.json(entry);
    else res.status(404).json({ error: 'Task or subtask not found' });
  });

  app.delete('/api/tasks/:id/subtasks/:subtaskId', (req, res) => {
    const entry = DB.deleteSubtask(currentUserId, Number(req.params.id), req.params.subtaskId);
    if (entry) res.json(entry);
    else res.status(404).json({ error: 'Task or subtask not found' });
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const success = DB.deleteTask(currentUserId, Number(req.params.id));
    if (success) res.json({ success: true });
    else res.status(404).json({ error: 'Task not found' });
  });

  // 7. Notifications
  app.get('/api/notifications', (req, res) => {
    res.json(DB.getNotifications(currentUserId));
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    const success = DB.markNotificationRead(currentUserId, Number(req.params.id));
    res.json({ success });
  });

  // 8. Logs
  app.get('/api/logs', (req, res) => {
    res.json(DB.getLogs());
  });

  // 9. Users
  app.get('/api/users', (req, res) => {
    res.json(DB.getUsers());
  });

  // 10. Settings & backup
  app.get('/api/settings', (req, res) => {
    res.json(DB.getSettings());
  });

  app.put('/api/settings', (req, res) => {
    const entry = DB.updateSettings(currentUserId, req.body);
    res.json(entry);
  });

  // SQL Backup Endpoint
  app.get('/api/settings/backup', (req, res) => {
    try {
      const sqlContent = fs.readFileSync(path.join(process.cwd(), 'database.sql'), 'utf-8');
      res.setHeader('Content-disposition', 'attachment; filename=database.sql');
      res.setHeader('Content-type', 'application/sql');
      res.send(sqlContent);
      DB.logActivity(currentUserId, 'export', undefined, undefined, 'تحميل نسخة احتياطية SQL لقاعدة البيانات كاملة وبنية المجلدات', 'Downloaded complete MySQL backup backup file from the system settings');
    } catch (e: any) {
      res.status(500).json({ error: 'database.sql is ready but could not be downloaded. Check root location.' });
    }
  });

  // 11. AI Robots Endpoints
  app.get('/api/ai-robots', (req, res) => {
    res.json(DB.getAIRobots());
  });

  app.get('/api/ai-robots/pipeline/collaborations', (req, res) => {
    res.json(DB.getAgentCollaborations());
  });

  app.post('/api/ai-robots/pipeline/trigger', (req, res) => {
    const force = req.query.force === 'true' || req.body?.force === true;
    const targetLeadId = req.body?.lead_id ? Number(req.body.lead_id) : undefined;
    const result = DB.triggerInterAgentPipeline(currentUserId, force, targetLeadId);
    res.json(result);
  });

  app.post('/api/ai-robots/pipeline/clear', (req, res) => {
    const result = DB.clearAgentCollaborations(currentUserId);
    res.json({ success: true, collaborations: result });
  });

  app.put('/api/ai-robots/:id', (req, res) => {
    const entry = DB.updateAIRobot(currentUserId, req.params.id, req.body);
    if (entry) res.json(entry);
    else res.status(404).json({ error: 'Robot not found' });
  });

  app.post('/api/ai-robots/:id/trigger', (req, res) => {
    const force = req.query.force === 'true' || req.body?.force === true;
    const result = DB.triggerAIRobot(currentUserId, req.params.id, force);
    if (result) res.json(result);
    else res.status(404).json({ error: 'Robot not found' });
  });

  app.post('/api/ai-robots/kill-switch', (req, res) => {
    const list = DB.emergencyKillSwitch(currentUserId);
    res.json({ success: true, robots: list });
  });

  // 12. Smart CRM Chat Query Endpoint
  app.post('/api/chat-query', async (req, res) => {
    try {
      const { prompt, language = 'ar' } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Check if GEMINI_API_KEY is configured
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ 
          answer: language === 'ar' 
            ? '⚠️ عذراً، مفتاح واجهة برمجة تطبيقات Gemini (GEMINI_API_KEY) غير مكوّن في الإعدادات. يرجى إضافته في لوحة الإعدادات لتفعيل المساعد الذكي.' 
            : '⚠️ Apologies, the Gemini API Key (GEMINI_API_KEY) is not configured in the environment settings. Please specify it in the Secrets panel to activate the AI Chat Assistant.' 
        });
      }

      const db = DB.getFullData();

      // Formulate a clean context object containing relevant CRM data.
      const clientsContext = db.clients.filter(c => !c.archived_at).map(c => ({
        id: c.id,
        name: c.name,
        email: c.email || 'N/A',
        phone: c.phone,
        company_name: c.company_name || 'Individual',
        status: c.status,
        notes: c.notes || ''
      }));

      const contractsContext = db.contracts.map(c => {
        const comp = db.companies.find(co => co.id === c.company_id);
        return {
          id: c.id,
          title: c.title,
          value_sar: c.value,
          company: comp ? comp.name : 'Unknown Company',
          start_date: c.start_date,
          end_date: c.end_date,
          status: c.status
        };
      });

      const leadsContext = db.leads.map(l => {
        const client = db.clients.find(c => c.id === l.client_id);
        return {
          id: l.id,
          client_name: client ? client.name : 'Unknown Client',
          source: l.source || 'Direct',
          expected_revenue_sar: l.expected_revenue,
          score: l.score,
          priority: l.priority,
          status: l.status
        };
      });

      const tasksContext = db.tasks.map(t => {
        const client = db.clients.find(c => c.id === t.client_id);
        return {
          id: t.id,
          title: t.title,
          priority: t.priority,
          status: t.status,
          due_date: t.due_date,
          description: t.description || '',
          client_name: client ? client.name : 'None'
        };
      });

      const invoicesContext = db.invoices.map(i => {
        const client = db.clients.find(c => c.id === i.client_id);
        return {
          id: i.id,
          client_name: client ? client.name : 'N/A',
          company: client ? (client.company_name || 'Individual') : 'N/A',
          total_amount_sar: i.total_amount,
          status: i.status,
          due_date: i.due_date
        };
      });

      const stats = {
        company_ar: db.settings.company_name_ar,
        company_en: db.settings.company_name_en,
        tax_rate: db.settings.tax_rate,
        currency_ar: db.settings.currency_ar,
        currency_en: db.settings.currency_en,
        active_clients_count: clientsContext.length,
        active_contracts_count: contractsContext.filter(c => c.status === 'active').length,
        total_contracts_value_sar: contractsContext.reduce((sum, c) => sum + c.value_sar, 0),
        total_invoices_paid_sar: invoicesContext.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount_sar, 0),
        pending_invoices_value_sar: invoicesContext.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.total_amount_sar, 0)
      };

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are a professional, friendly, and highly intelligent CRM AI Assistant for the Hyper Software Solutions Bilingual CRM System.
You speak both Arabic and English fluently.
Your user is an administrator or manager of the CRM. Use formatting (markdown, bolding, simple lists) to answer the user query in a very readable, beautiful manner. Always match the language in which user queries you: if they write in Arabic, respond in clear, polished Arabic. If they write in English, respond in English.
Your answer MUST be derived strictly from the current real-time database context provided below. Be precise and do not mention "database context" or "database files" or "the provided JSON" directly; present the answers naturally as the CRM's built-in intelligent companion.

CRM CURRENT SCHEMA & DATA:
- STATS SUMMARY: ${JSON.stringify(stats)}
- CLIENTS LIST: ${JSON.stringify(clientsContext)}
- COMPANIES & CONTRACTS: ${JSON.stringify(contractsContext)}
- LEADS PIPELINE: ${JSON.stringify(leadsContext)}
- TASK BOARDS: ${JSON.stringify(tasksContext)}
- INVOICES & PAYMENTS: ${JSON.stringify(invoicesContext)}

Examples of high paying calculations:
- "من هو العميل الأعلى دفعاً؟" / "Who is my highest paying client?" -> "مجموعة الراجحي الاستثمارية" has a contract worth 450,000 SAR. (Or check paid invoices total).
- "ما هي المهام العاجلة؟" / "What are the most urgent tasks?" -> List tasks under priority 'urgent' or status 'pending'/'in_progress' with short details.

Respond naturally, politely, and cleanly with specific metrics, names, and guidelines.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.15
        }
      });

      res.json({ answer: response.text });
    } catch (err: any) {
      console.error('Error in chat-query endpoint:', err);
      res.status(500).json({ error: err.message || 'Failed to analyze CRM request' });
    }
  });

  // Serve generated assets dynamically referenced in both dev and production
  app.use('/src/assets/images', express.static(path.join(process.cwd(), 'src/assets/images')));


  // --- VITE MIDDLEWARE MODE FOR DEVELOPMENT OR STATIC BINDINGS FOR PRODUCTION ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start the background automated reminder checks
  try {
    DB.processTaskReminders();
    console.log('[CRM Server] Automated Task Reminder System initialized successfully.');
    // Run the reminder scanner every 30 minutes
    setInterval(() => {
      try {
        DB.processTaskReminders();
      } catch (err) {
        console.error('[CRM Server] Error during automated task reminder background scan:', err);
      }
    }, 30 * 60 * 1000);
  } catch (err) {
    console.error('[CRM Server] Failed to initialize automated reminder system:', err);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CRM Server] Web Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CRM Server] Failed to initiate server:', err);
});
