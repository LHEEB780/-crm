/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { 
  Client, Company, CompanyBranch, CompanyContact, Contract, 
  Lead, Opportunity, Deal, Quotation, Invoice, Task, 
  Notification, ActivityLog, SystemSettings, UserRole, User, AIRobot,
  AgentCollaboration, SubTask
} from '../src/types';

const DB_FILE_PATH = path.join(process.cwd(), 'server_db.json');

interface DatabaseSchema {
  users: User[];
  clients: Client[];
  companies: Company[];
  branches: CompanyBranch[];
  contacts: CompanyContact[];
  contracts: Contract[];
  leads: Lead[];
  opportunities: Opportunity[];
  deals: Deal[];
  quotations: Quotation[];
  invoices: Invoice[];
  tasks: Task[];
  notifications: Notification[];
  activity_logs: ActivityLog[];
  settings: SystemSettings;
  ai_robots: AIRobot[];
  agent_collaborations?: AgentCollaboration[];
}

// Helper to get raw date strings
const getNowISO = () => new Date().toISOString();

// Initial Seeding matching database.sql
const defaultSettings: SystemSettings = {
  company_name_ar: 'شركة الحلول البرمجية الفائقة',
  company_name_en: 'Hyper Software Solutions Corp',
  address_ar: 'الرياض، المملكة العربية السعودية',
  address_en: 'Riyadh, Kingdom of Saudi Arabia',
  email: 'info@hypersolutions.com',
  phone: '+966112223333',
  tax_rate: 15,
  currency_ar: 'ر.س',
  currency_en: 'SAR',
  primary_color: '#0B192C',
  secondary_color: '#FF6500',
  mail_driver: 'smtp',
  mail_host: 'smtp.mailtrap.io',
  mail_port: 2525,
  mail_username: 'crm-notify',
  mail_encryption: 'tls',
  backup_interval: 'daily',
  logo_url: ''
};

const defaultUsers: User[] = [
  { id: 1, name: 'أحمد المدير', email: 'admin@crm.com', role_id: 1, role: 'super_admin', phone: '+966501234567', status: 'active', created_at: getNowISO() },
  { id: 2, name: 'سارة الحميد', email: 'sara.sales@crm.com', role_id: 2, role: 'sales_manager', phone: '+966507654321', status: 'active', created_at: getNowISO() },
  { id: 3, name: 'خالد السليمان', email: 'khaled.emp@crm.com', role_id: 3, role: 'sales_employee', phone: '+966504567890', status: 'active', created_at: getNowISO() }
];

const defaultCompanies: Company[] = [
  { id: 1, name: 'مجموعة الراجحي الاستثمارية', email: 'info@alrajhigroup.com', phone: '920011122', website: 'www.alrajhigroup.com', industry: 'الاستثمار والمقاولات', address: 'الرياض، العليا', created_at: getNowISO() },
  { id: 2, name: 'شركة الاتصالات السعودية (STC)', email: 'corporate@stc.com.sa', phone: '900', website: 'www.stc.com.sa', industry: 'الاتصالات والتقنية', address: 'الرياض، مجمع الملك عبدالعزيز للاتصالات', created_at: getNowISO() }
];

const defaultBranches: CompanyBranch[] = [
  { id: 1, company_id: 1, name: 'الفرع الرئيسي', city: 'الرياض', address: 'طريق الملك فهد', manager_name: 'عبدالرحمن الراجحي', phone: '+966500000001', created_at: getNowISO() },
  { id: 2, company_id: 1, name: 'فرع المنطقة الغربية', city: 'جدة', address: 'شارع التحلية', manager_name: 'سعيد الغامدي', phone: '+966500000002', created_at: getNowISO() }
];

const defaultContacts: CompanyContact[] = [
  { id: 1, company_id: 1, name: 'مروان العتيبي', position: 'مدير المشتريات', email: 'm.otaibi@alrajhigroup.com', phone: '+966551234511', created_at: getNowISO() },
  { id: 2, company_id: 2, name: 'م. فهد القرني', position: 'مدير البنية التحتية والشبكات', email: 'f.qarni@stc.com.sa', phone: '+966551234522', created_at: getNowISO() }
];

const defaultContracts: Contract[] = [
  { id: 1, company_id: 1, title: 'عقد توريد برمجيات سحابية وإدارة شبكات', value: 450000.00, start_date: '2026-01-01', end_date: '2026-12-31', status: 'active', created_at: getNowISO() },
  { id: 2, company_id: 2, title: 'عقد استشارات فنية وتحليل أمان سيرفرات', value: 120000.00, start_date: '2026-03-01', end_date: '2026-09-01', status: 'active', created_at: getNowISO() }
];

const defaultClients: Client[] = [
  { id: 1, name: 'عبدالرحمن الشهري', email: 'shahri@gmail.com', phone: '+966501112223', company_name: 'مجموعة الراجحي الاستثمارية', company_id: 1, status: 'active_client', type: 'corporate', address: 'الرياض، العليا', notes: 'عميل ممتاز ومتجاوب دائماً', manager_id: 2, archived_at: null, created_at: getNowISO() },
  { id: 2, name: 'خليل اليافعي', email: 'yafei@hotmail.com', phone: '+966502223334', company_name: 'شركة الاتصالات السعودية (STC)', company_id: 2, status: 'negotiating', type: 'corporate', address: 'الرياض، المرسلات', notes: 'مهتم بعقود ترقية السيرفرات السنوية', manager_id: 3, archived_at: null, created_at: getNowISO() },
  { id: 3, name: 'فيصل المطيري', email: 'faisal.m@stc.com.sa', phone: '+966503334445', company_name: 'شركة الاتصالات السعودية (STC)', company_id: 2, status: 'lead', type: 'corporate', address: 'الرياض القدس', notes: 'مستهدف لتطبيق مبيعات التجزئة للشركة', manager_id: 3, archived_at: null, created_at: getNowISO() },
  { id: 4, name: 'نواف العبدالله', email: 'nawaf@example.com', phone: '+966504445556', company_name: 'مؤسسة الابتكارات المتجددة', company_id: undefined, status: 'new', type: 'individual', address: 'جدة، الحمراء', notes: 'مهتم بالحصول على استشارة تهيئة البنية التحتية', manager_id: 2, archived_at: null, created_at: getNowISO() }
];

const defaultLeads: Lead[] = [
  { id: 1, client_id: 2, source: 'الموقع الإلكتروني', score: 85, status: 'qualified', expected_revenue: 75000.00, priority: 'high', created_at: getNowISO() },
  { id: 2, client_id: 3, source: 'وسائل التواصل الاجتماعي', score: 60, status: 'qualified', expected_revenue: 50000.00, priority: 'medium', created_at: getNowISO() },
  { id: 3, client_id: 4, source: 'توصية مباشرة', score: 40, status: 'new', expected_revenue: 20000.00, priority: 'low', created_at: getNowISO() }
];

const defaultOpportunities: Opportunity[] = [
  { id: 1, lead_id: 1, title: 'ترقية تراخيص سيرفر STC', stage: 'proposal', probability: 60, estimated_value: 75000.00, close_date: '2026-07-15', created_at: getNowISO() },
  { id: 2, lead_id: 2, title: 'تطبيق الهاتف لخدمات العملاء STC', stage: 'discovery', probability: 30, estimated_value: 50000.00, close_date: '2026-09-30', created_at: getNowISO() }
];

const defaultDeals: Deal[] = [
  { id: 1, opportunity_id: 1, title: 'صفقة تراخص اس تي سي المرحلة الأولى', value: 75000.00, status: 'active', contract_signed: false, created_at: getNowISO() }
];

const defaultQuotations: Quotation[] = [
  { id: 1, client_id: 2, subject: 'عرض السعر المتكامل لتطوير البرامج والمقاسم', total_amount: 80000.00, discount: 5000.00, status: 'sent', valid_until: '2026-08-01', created_at: getNowISO() }
];

const defaultInvoices: Invoice[] = [
  { id: 1, client_id: 1, invoice_number: 'INV-2026-0001', total_amount: 517500.00, tax: 67500.00, status: 'paid', due_date: '2026-04-30', paid_at: getNowISO(), created_at: getNowISO() },
  { id: 2, client_id: 2, invoice_number: 'INV-2026-0002', total_amount: 23000.00, tax: 3000.00, status: 'unpaid', due_date: '2026-06-30', created_at: getNowISO() }
];

const defaultAIRobots: AIRobot[] = [
  {
    id: 'robot-leads-qualifier',
    name_ar: 'مساعد تأهيل صفقات المبيعات (AI Qualifier)',
    name_en: 'AI Leads Qualifier Agent',
    role_description_ar: 'مسؤول عن تصفية وفلترة بيانات العملاء المحتملين تلقائياً وتقييم ملائمة وموثوقية الصفقة من 100 لتوجيه طاقم المبيعات.',
    role_description_en: 'Scans and qualifies incoming client leads automatically, calculating deal readiness and score out of 100 to guide sales agents.',
    avatar: '/src/assets/images/leads_qualifier_avatar_1780951817987.png',
    enabled: true,
    type: 'leads_qualifier',
    last_action_ar: 'جاهز لتصفية وتأهيل الصفقة التالية فور دخولها.',
    last_action_en: 'Standing ready for incoming lead processing and qualification.',
    last_action_at: getNowISO(),
    run_count: 5,
    schedule_enabled: false,
    schedule_start: '09:00',
    schedule_end: '17:00',
    schedule_days: [1, 2, 3, 4, 5]
  },
  {
    id: 'robot-task-escalator',
    name_ar: 'مدير المتابعة والتنبيهات المجدولة',
    name_en: 'AI Task Escalator & Auto-Reminder',
    role_description_ar: 'يقوم بقراءة تواريخ المهام المعلقة والمتأخرة وإرسال إشعارات تلقائية وإنشاء تعليقات تحذيرية لتسريع عجلة الإنتاج.',
    role_description_en: 'Monitors upcoming or overdue tasks, sending push warnings and posting automatic reminder comments on tasks to increase speed.',
    avatar: '/src/assets/images/task_escalator_avatar_1780951833947.png',
    enabled: true,
    type: 'task_escalator',
    last_action_ar: 'تم تنبيه الموظفين بخصوص 3 مهام حرجة قريبة الاستحقاق.',
    last_action_en: 'Identified and flagged 3 near-overdue task targets.',
    last_action_at: getNowISO(),
    run_count: 12,
    schedule_enabled: false,
    schedule_start: '09:00',
    schedule_end: '17:00',
    schedule_days: [1, 2, 3, 4, 5]
  },
  {
    id: 'robot-email-writer',
    name_ar: 'منشئ المراسلات وصياغة المعاملات',
    name_en: 'AI Copywriter & SLA Dispatcher',
    role_description_ar: 'صياغة وتعديل مسودات المراسلات الرسمية للشركاء وعقود الاندماج ووثائق NDA تلقائياً وإلحاقها ببريد العميل.',
    role_description_en: 'Drafts hyper-personalized reply templates, legal NDA terms, and professional formal follow-up emails for company leads.',
    avatar: '/src/assets/images/email_writer_avatar_1780951847210.png',
    enabled: false,
    type: 'email_writer',
    last_action_ar: 'تم إيقاف الروبوت بانتظار تحسين معايير الـ SLA.',
    last_action_en: 'No recent actions. Ready for prompt instructions.',
    last_action_at: getNowISO(),
    run_count: 8,
    schedule_enabled: false,
    schedule_start: '09:00',
    schedule_end: '17:00',
    schedule_days: [1, 2, 3, 4, 5]
  },
  {
    id: 'robot-financial-analyst',
    name_ar: 'مركز الذكاء الاصطناعي للتدريب والاستشارات المالية',
    name_en: 'AI Training & Financial Consulting Center',
    role_description_ar: 'يقوم بتحليل فواتير ومصروفات الـ CRM وتدريب النظام على خوارزميات الاسترداد وتوفير استشارات التدفق المالي والضريبي الذكي.',
    role_description_en: 'Audits pending balances, trains systems on recovery models, and provides financial cashflow consulting and tax planning.',
    avatar: '/src/assets/images/ai_hub_avatar_1780951859398.png',
    enabled: true,
    type: 'financial_analyst',
    last_action_ar: 'تمت مراجعة الفواتير واحتساب الضرائب ومذكرة التدفق المالي بنجاح.',
    last_action_en: 'Audited non-paid invoice ratios and compiled tax projection.',
    last_action_at: getNowISO(),
    run_count: 19,
    schedule_enabled: false,
    schedule_start: '09:00',
    schedule_end: '17:00',
    schedule_days: [1, 2, 3, 4, 5]
  },
  {
    id: 'robot-sentiment-analyzer',
    name_ar: 'روبوت تحليل المشاعر ورضا العملاء (AI Sentiment Guardian)',
    name_en: 'AI Sentiment & Customer Support Guardian',
    role_description_ar: 'يقوم بمراقبة تفاعلات وصوت العميل في التذاكر والمهام، واحتساب نقاط السعادة والولاء CSAT، وتنبيه الإدارة فور رصد بوادر تراجع المشاعر.',
    role_description_en: 'Monitors client communications and ticket sentiment, calculating Customer Satisfaction (CSAT) scores and warning supervisors if satisfaction drops.',
    avatar: '/src/assets/images/writer_bot_avatar_1780951339747.png',
    enabled: true,
    type: 'sentiment_analyzer',
    last_action_ar: 'جاهز لتحليل مشاعر وقنوات التواصل مع العملاء.',
    last_action_en: 'Ready to analyze customer interactions and feedback sentiment.',
    last_action_at: getNowISO(),
    run_count: 3,
    schedule_enabled: false,
    schedule_start: '09:00',
    schedule_end: '17:00',
    schedule_days: [1, 2, 3, 4, 5]
  },
  {
    id: 'robot-retention-predictor',
    name_ar: 'روبوت استبقاء المشتركين وترقيات العقود (AI Retention Engine)',
    name_en: 'AI Retention & Contract Expansion Engine',
    role_description_ar: 'مسؤول عن فحص وتوقع احتمالات تجديد واكتشاف فرص البيع العكسي للعملاء كترقية السيرفرات أو الباقات وصياغة عروض مرشحة.',
    role_description_en: 'Predicts client churn & subscription renewal likelihoods, uncovering hyper-targeted cross-sell opportunities to capture contract expansions.',
    avatar: '/src/assets/images/finance_bot_avatar_1780951352361.png',
    enabled: true,
    type: 'retention_predictor',
    last_action_ar: 'جاهز لمسح العقود وتوقع نسب تجديد واستبقاء العملاء.',
    last_action_en: 'Ready to audit active contract cycles and predict retention performance.',
    last_action_at: getNowISO(),
    run_count: 2,
    schedule_enabled: false,
    schedule_start: '09:00',
    schedule_end: '17:00',
    schedule_days: [1, 2, 3, 4, 5]
  }
];

const defaultTasks: Task[] = [
  { 
    id: 1, 
    title: 'سلسلة مقابلات STC الفنية لتحديد المتطلبات الأساسية', 
    description: 'عقد اجتماع مراجعة عبر Zoom لمناقشة التفاصيل وتنزيل التراخيص واحتياجات السيرفرات', 
    priority: 'high', 
    status: 'in_progress', 
    due_date: '2026-06-10T14:00:00Z', 
    assigned_to_id: 3, 
    client_id: 2, 
    comments: [
      { id: 'c1', user_name: 'سارة الحميد', content: 'تم حجز موعد الزووم وإرسال رابط اللقاء لجميع الأطراف المعنية.', created_at: new Date(Date.now() - 7200000).toISOString() },
      { id: 'c2', user_name: 'أحمد المدير', content: 'ممتاز، يرجى التجهيز بملف العرض الفني المحدث قبل ساعة من اللقاء.', created_at: new Date(Date.now() - 3600000).toISOString() }
    ],
    subtasks: [
      { id: 'st-1-1', title: 'إعداد ومراجعة العرض التقديمي الفني', completed: true, created_at: getNowISO() },
      { id: 'st-1-2', title: 'حصر تراخيص السيرفرات وقواعد البيانات المطلوبة', completed: false, created_at: getNowISO() },
      { id: 'st-1-3', title: 'مشاركة رابط الاجتماع وجدول الأعمال مع مهندسي STC', completed: true, created_at: getNowISO() }
    ],
    created_at: getNowISO() 
  },
  { 
    id: 2, 
    title: 'استكمال توقيع عقد مجموعة الراجحي الاستثمارية وتنزيل الدفعة الأولى', 
    description: 'إحضار العقد المصدق من الغرفة التجارية وتسليمه لمدير الحسابات', 
    priority: 'urgent', 
    status: 'pending', 
    due_date: '2026-06-08T09:00:00Z', 
    assigned_to_id: 2, 
    client_id: 1, 
    comments: [
      { id: 'c3', user_name: 'سارة الحميد', content: 'أفاد العميل بأن التوقيع جاهز وبانتظار مندوبنا غداً صباحاً للتسليم.', created_at: new Date(Date.now() - 10800000).toISOString() }
    ],
    subtasks: [
      { id: 'st-2-1', title: 'طباعة نسخ العقد الرسمية ومراجعة البنود القانونية', completed: true, created_at: getNowISO() },
      { id: 'st-2-2', title: 'تصديق العقد من الغرفة التجارية بالرياض', completed: false, created_at: getNowISO() },
      { id: 'st-2-3', title: 'إيداع سند القبض للدفعة الأولى وتأكيد مدير الحسابات', completed: false, created_at: getNowISO() }
    ],
    created_at: getNowISO() 
  },
  { 
    id: 3, 
    title: 'الاتصال بالعميل الجديد نواف العبدالله للترحيب وشرح الميزات', 
    description: 'مكالمة ترحيبية قصيرة لمعرفة نوع الأعمال والخدمات المطلوبة لشركته الناشئة', 
    priority: 'low', 
    status: 'completed', 
    due_date: '2026-06-05T11:30:00Z', 
    assigned_to_id: 3, 
    client_id: 4, 
    comments: [
      { id: 'c4', user_name: 'خالد مبيعات', content: 'تم الاتصال بالعميل وأبدى ترحيباً كبيراً، يفضل التواصل الأسبوع المقبل لاستلام كراسة الشروط المعيارية.', created_at: new Date(Date.now() - 14400000).toISOString() }
    ],
    subtasks: [
      { id: 'st-3-1', title: 'مراجعة بيانات تسجيل الشركة ونشاطها التجاري', completed: true, created_at: getNowISO() },
      { id: 'st-3-2', title: 'إجراء المكالمة الترحيبية وتحديد المتطلبات الأساسية', completed: true, created_at: getNowISO() }
    ],
    created_at: getNowISO() 
  }
];

const defaultNotifications: Notification[] = [
  { id: 1, user_id: 2, title_ar: 'مهمة عاجلة مستحقة قريباً', title_en: 'Urgent task due soon', content_ar: 'استكمال توقيع عقد مجموعة الراجحي الاستثمارية مستحق في 08 يونيو', content_en: 'Completing the contract of Al Rajhi group is due on June 08', type: 'task_alert', is_read: false, created_at: getNowISO() },
  { id: 2, user_id: 3, title_ar: 'صفقة جديدة مرشحة للتأهيل', title_en: 'New qualified lead', content_ar: 'تم تصنيف العميل خليل اليافعي كعميل مؤهل من قبل نظام الفرز الإلكتروني بمعدل 85 نقطة', content_en: 'Client Khalil Al-Yafei qualified via sorting logic with score 85', type: 'lead_update', is_read: false, created_at: getNowISO() }
];

const defaultActivityLogs: ActivityLog[] = [
  { id: 1, user_id: 1, user_name: 'أحمد المدير', action: 'login', target_type: undefined, target_id: undefined, description_ar: 'تسجيل دخول ناجح لمدير النظام أحمد المدير', description_en: 'Successful login of System Admin Ahmed Al-Mudeer', ip_address: '127.0.0.1', created_at: getNowISO() },
  { id: 2, user_id: 1, user_name: 'أحمد المدير', action: 'create', target_type: 'Client', target_id: 4, description_ar: 'إضافة عميل جديد نواف العبدالله في قاعدة البيانات', description_en: 'Added new client Nawaf Al-Abdullah to database', ip_address: '127.0.0.1', created_at: getNowISO() },
  { id: 3, user_id: 2, user_name: 'سارة الحميد', action: 'update', target_type: 'Task', target_id: 2, description_ar: 'تعديل حالة مهمة عقد الراجحي وتعيين الأولوية إلى عاجلة', description_en: 'Modified contract task state to urgent', ip_address: '127.0.0.1', created_at: getNowISO() }
];

const defaultCollaborations: AgentCollaboration[] = [
  {
    id: 'collab-init-1',
    workflow_id: 'wf-swarm-initial',
    step_number: 1,
    from_robot_id: 'robot-leads-qualifier',
    from_robot_name_ar: 'مساعد تأهيل صفقات المبيعات',
    from_robot_name_en: 'AI Leads Qualifier Agent',
    to_robot_id: 'robot-email-writer',
    to_robot_name_ar: 'منشئ المراسلات وصياغة المعاملات',
    to_robot_name_en: 'AI Copywriter & SLA Dispatcher',
    message_ar: '@منشئ_المراسلات تم فحص وتأهيل سجل العميل "خليل اليافعي" (شركة الاتصالات السعودية STC) بنجاح بمعدل جاهزية 85% وقيمة مقدرة 75,000 ر.س. يرجى إعداد مسودة عرض الأسعار والمواصفات الفنية فوراً.',
    message_en: '@AI_Copywriter Verified and qualified client "Khalil Al-Yafei" (STC) with 85% readiness score. Please compile technical proposal draft.',
    action_taken_ar: 'تأهيل العميل وترقية درجته إلى 85 نقطة في قائمة صفقات المبيعات',
    action_taken_en: 'Qualified lead and updated readiness index to 85/100',
    target_entity: 'خليل اليافعي',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'collab-init-2',
    workflow_id: 'wf-swarm-initial',
    step_number: 2,
    from_robot_id: 'robot-email-writer',
    from_robot_name_ar: 'منشئ المراسلات وصياغة المعاملات',
    from_robot_name_en: 'AI Copywriter & SLA Dispatcher',
    to_robot_id: 'robot-task-escalator',
    to_robot_name_ar: 'مدير المتابعة والتنبيهات المجدولة',
    to_robot_name_en: 'AI Task Escalator & Auto-Reminder',
    message_ar: '@مدير_المتابعة تم صياغة مسودة العرض التقني والـ SLA وإيداعها في مسودات بريد العميل "خليل اليافعي". أرجو جدولة مهمة تواصل ومتابعة عاجلة.',
    message_en: '@AI_Escalator Proposal and SLA drafted into client drafts folder. Please schedule an urgent follow-up task on the CRM calendar.',
    action_taken_ar: 'صياغة وثيقة العرض التقني وإيداعها في مسودات العميل',
    action_taken_en: 'Drafted technical proposal and committed to client email drafts',
    target_entity: 'خليل اليافعي',
    created_at: new Date(Date.now() - 3600000 * 2.8).toISOString()
  },
  {
    id: 'collab-init-3',
    workflow_id: 'wf-swarm-initial',
    step_number: 3,
    from_robot_id: 'robot-task-escalator',
    from_robot_name_ar: 'مدير المتابعة والتنبيهات المجدولة',
    from_robot_name_en: 'AI Task Escalator & Auto-Reminder',
    to_robot_id: 'robot-financial-analyst',
    to_robot_name_ar: 'مركز الذكاء الاصطناعي للاستشارات المالية',
    to_robot_name_en: 'AI Financial Consulting Center',
    message_ar: '@المستشار_المالي تم إنشاء مهمة المتابعة وحجز موعد الاتصال بالعميل "خليل اليافعي". يرجى تدقيق الشروط المالية وتقدير التدفق المالي وهامش الربحية.',
    message_en: '@AI_Treasurer Urgent follow-up task registered on CRM calendar. Please audit financial terms and forecast margin profitability.',
    action_taken_ar: 'إنشاء وتعيين مهمة متابعة عاجلة للمشروع',
    action_taken_en: 'Created and assigned urgent calendar follow-up task',
    target_entity: 'خليل اليافعي',
    created_at: new Date(Date.now() - 3600000 * 2.5).toISOString()
  },
  {
    id: 'collab-init-4',
    workflow_id: 'wf-swarm-initial',
    step_number: 4,
    from_robot_id: 'robot-financial-analyst',
    from_robot_name_ar: 'مركز الذكاء الاصطناعي للاستشارات المالية',
    from_robot_name_en: 'AI Financial Consulting Center',
    to_robot_id: 'robot-retention-predictor',
    to_robot_name_ar: 'روبوت استبقاء المشتركين وترقيات العقود',
    to_robot_name_en: 'AI Retention & Contract Expansion Engine',
    message_ar: '@حارس_الاستبقاء_والتوسع تم التدقيق المالي للصفقة بنجاح: التدفق النقدي إيجابي بمبلغ 86,250 ر.س (شامل الضريبة) بهامش ربح 35%. يرجى إدراج الحساب تحت رادار المراقبة.',
    message_en: '@AI_Retention Financial check complete: positive net cashflow 86,250 SAR with 35% margin. Please arm expansion radar.',
    action_taken_ar: 'تدقيق الجدارة الائتمانية والتدفق المالي وحساب الضريبة',
    action_taken_en: 'Audited cashflow and validated profitability margins',
    target_entity: 'خليل اليافعي',
    created_at: new Date(Date.now() - 3600000 * 2.2).toISOString()
  },
  {
    id: 'collab-init-5',
    workflow_id: 'wf-swarm-initial',
    step_number: 5,
    from_robot_id: 'robot-retention-predictor',
    from_robot_name_ar: 'روبوت استبقاء المشتركين وترقيات العقود',
    from_robot_name_en: 'AI Retention & Contract Expansion Engine',
    to_robot_id: 'robot-leads-qualifier',
    to_robot_name_ar: 'مساعد تأهيل صفقات المبيعات',
    to_robot_name_en: 'AI Leads Qualifier Agent',
    message_ar: '🏁 تم اكتمال دورة الفريق الافتراضي بنجاح! تم تأمين العقد وجدولة المتابعة مع تجهيز فرصة ترقية توسعية مستقبلية بقيمة 22,500 ر.س.',
    message_en: '🏁 Swarm cycle completed successfully! Follow-up locked and 22,500 SAR expansion opportunity queued.',
    action_taken_ar: 'تسجيل فرصة بيع استباقية وتأكيد اكتمال الدورة الشاملة',
    action_taken_en: 'Queued expansion opportunity and confirmed full cycle completion',
    target_entity: 'خليل اليافعي',
    created_at: new Date(Date.now() - 3600000 * 2.0).toISOString()
  }
];

export class DB {
  private static loadDB(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initialDB: DatabaseSchema = {
        users: defaultUsers,
        clients: defaultClients,
        companies: defaultCompanies,
        branches: defaultBranches,
        contacts: defaultContacts,
        contracts: defaultContracts,
        leads: defaultLeads,
        opportunities: defaultOpportunities,
        deals: defaultDeals,
        quotations: defaultQuotations,
        invoices: defaultInvoices,
        tasks: defaultTasks,
        notifications: defaultNotifications,
        activity_logs: defaultActivityLogs,
        settings: defaultSettings,
        ai_robots: defaultAIRobots,
        agent_collaborations: defaultCollaborations
      };
      this.saveDB(initialDB);
      return initialDB;
    }
    try {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const db = JSON.parse(data) as DatabaseSchema;
      let dbModified = false;

      if (!db.ai_robots) {
        db.ai_robots = [...defaultAIRobots];
        dbModified = true;
      } else {
        defaultAIRobots.forEach(defBot => {
          if (!db.ai_robots.some(r => r.id === defBot.id)) {
            db.ai_robots.push(defBot);
            dbModified = true;
          }
        });
      }

      if (!db.agent_collaborations || db.agent_collaborations.length === 0) {
        db.agent_collaborations = [...defaultCollaborations];
        dbModified = true;
      }

      if (dbModified) {
        this.saveDB(db);
      }
      return db;
    } catch (e) {
      console.error("Error reading db file, regenerating default data", e);
      const replacementDB: DatabaseSchema = {
        users: defaultUsers,
        clients: defaultClients,
        companies: defaultCompanies,
        branches: defaultBranches,
        contacts: defaultContacts,
        contracts: defaultContracts,
        leads: defaultLeads,
        opportunities: defaultOpportunities,
        deals: defaultDeals,
        quotations: defaultQuotations,
        invoices: defaultInvoices,
        tasks: defaultTasks,
        notifications: defaultNotifications,
        activity_logs: defaultActivityLogs,
        settings: defaultSettings,
        ai_robots: defaultAIRobots,
        agent_collaborations: defaultCollaborations
      };
      this.saveDB(replacementDB);
      return replacementDB;
    }
  }

  private static saveDB(db: DatabaseSchema) {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  }

  static getFullData() {
    return this.loadDB();
  }

  // Activity Logs Logger
  static logActivity(userId: number, action: any, targetType: any, targetId: number | undefined, descAr: string, descEn: string) {
    const db = this.loadDB();
    const user = db.users.find(u => u.id === userId);
    const newLog: ActivityLog = {
      id: db.activity_logs.length > 0 ? Math.max(...db.activity_logs.map(l => l.id)) + 1 : 1,
      user_id: userId,
      user_name: user ? user.name : 'Unknown User',
      action,
      target_type: targetType,
      target_id: targetId,
      description_ar: descAr,
      description_en: descEn,
      ip_address: '127.0.0.1',
      created_at: getNowISO()
    };
    db.activity_logs.unshift(newLog);
    this.saveDB(db);
  }

  // Clients CRUD
  static getClients() {
    return this.loadDB().clients;
  }

  static getClientById(id: number) {
    return this.loadDB().clients.find(c => c.id === id);
  }

  static addClient(userId: number, clientData: Omit<Client, 'id' | 'created_at'>) {
    const db = this.loadDB();
    const newId = db.clients.length > 0 ? Math.max(...db.clients.map(c => c.id)) + 1 : 1;
    const newClient: Client = {
      ...clientData,
      id: newId,
      created_at: getNowISO()
    };
    db.clients.push(newClient);
    this.saveDB(db);
    this.logActivity(userId, 'create', 'Client', newId, `إضافة العميل الجديد "${newClient.name}"`, `Created new Client "${newClient.name}"`);
    return newClient;
  }

  static updateClient(userId: number, id: number, clientData: Partial<Client>) {
    const db = this.loadDB();
    const idx = db.clients.findIndex(c => c.id === id);
    if (idx !== -1) {
      db.clients[idx] = { ...db.clients[idx], ...clientData };
      const updatedClient = db.clients[idx];
      this.saveDB(db);
      this.logActivity(userId, 'update', 'Client', id, `تعديل معلومات العميل "${updatedClient.name}"`, `Updated client layout for "${updatedClient.name}"`);
      return updatedClient;
    }
    return null;
  }

  static deleteClient(userId: number, id: number) {
    const db = this.loadDB();
    const idx = db.clients.findIndex(c => c.id === id);
    if (idx !== -1) {
      const client = db.clients[idx];
      db.clients.splice(idx, 1);
      // Clean relationships
      db.leads = db.leads.filter(l => l.client_id !== id);
      db.invoices = db.invoices.filter(i => i.client_id !== id);
      db.quotations = db.quotations.filter(q => q.client_id !== id);
      db.tasks = db.tasks.filter(t => t.client_id !== id);
      
      this.saveDB(db);
      this.logActivity(userId, 'delete', 'Client', id, `حذف العميل "${client.name}" نهائياً من النظام`, `Permanently deleted client "${client.name}"`);
      return true;
    }
    return false;
  }

  static archiveClient(userId: number, id: number) {
    const db = this.loadDB();
    const idx = db.clients.findIndex(c => c.id === id);
    if (idx !== -1) {
      const client = db.clients[idx];
      const isArchiving = client.archived_at == null;
      db.clients[idx].archived_at = isArchiving ? getNowISO() : null;
      this.saveDB(db);
      
      const act = isArchiving ? 'archive' : 'unarchive';
      const labelAr = isArchiving ? `أرشفة العميل "${client.name}"` : `إلغاء أرشفة العميل "${client.name}"`;
      const labelEn = isArchiving ? `Archived client "${client.name}"` : `Restored customer "${client.name}" from archive`;
      
      this.logActivity(userId, act, 'Client', id, labelAr, labelEn);
      return db.clients[idx];
    }
    return null;
  }

  // Companies CRUD
  static getCompanies() {
    return this.loadDB().companies;
  }

  static addCompany(userId: number, companyData: Omit<Company, 'id' | 'created_at'>) {
    const db = this.loadDB();
    const newId = db.companies.length > 0 ? Math.max(...db.companies.map(c => c.id)) + 1 : 1;
    const newCompany: Company = { ...companyData, id: newId, created_at: getNowISO() };
    db.companies.push(newCompany);
    this.saveDB(db);
    this.logActivity(userId, 'create', 'Company', newId, `إضافة شركة جديدة "${newCompany.name}"`, `Created company "${newCompany.name}"`);
    return newCompany;
  }

  static updateCompany(userId: number, id: number, companyData: Partial<Company>) {
    const db = this.loadDB();
    const idx = db.companies.findIndex(c => c.id === id);
    if (idx !== -1) {
      db.companies[idx] = { ...db.companies[idx], ...companyData };
      const company = db.companies[idx];
      this.saveDB(db);
      this.logActivity(userId, 'update', 'Company', id, `تعديل معلومات شركة "${company.name}"`, `Updated company parameters for "${company.name}"`);
      return company;
    }
    return null;
  }

  static deleteCompany(userId: number, id: number) {
    const db = this.loadDB();
    const idx = db.companies.findIndex(c => c.id === id);
    if (idx !== -1) {
      const company = db.companies[idx];
      db.companies.splice(idx, 1);
      db.branches = db.branches.filter(b => b.company_id !== id);
      db.contacts = db.contacts.filter(c => c.company_id !== id);
      db.contracts = db.contracts.filter(c => c.company_id !== id);
      // update clients reference
      db.clients = db.clients.map(c => c.company_id === id ? { ...c, company_id: undefined } : c);
      
      this.saveDB(db);
      this.logActivity(userId, 'delete', 'Company', id, `حذف شركة "${company.name}" وكل متعلقاتها`, `Deleted company "${company.name}" and sub-entities`);
      return true;
    }
    return false;
  }

  // Branches & Contacts & Contracts
  static getBranches() { return this.loadDB().branches; }
  static addBranch(userId: number, branch: Omit<CompanyBranch, 'id' | 'created_at'>) {
    const db = this.loadDB();
    const newId = db.branches.length > 0 ? Math.max(...db.branches.map(b => b.id)) + 1 : 1;
    const entry: CompanyBranch = { ...branch, id: newId, created_at: getNowISO() };
    db.branches.push(entry);
    this.saveDB(db);
    this.logActivity(userId, 'create', 'Company', branch.company_id, `إضافة فرع جديد "${branch.name}"`, `Added branch "${branch.name}"`);
    return entry;
  }

  static getContacts() { return this.loadDB().contacts; }
  static addContact(userId: number, contact: Omit<CompanyContact, 'id' | 'created_at'>) {
    const db = this.loadDB();
    const newId = db.contacts.length > 0 ? Math.max(...db.contacts.map(c => c.id)) + 1 : 1;
    const entry: CompanyContact = { ...contact, id: newId, created_at: getNowISO() };
    db.contacts.push(entry);
    this.saveDB(db);
    this.logActivity(userId, 'create', 'Company', contact.company_id, `إضافة جهة اتصال "${contact.name}"`, `Added company contact "${contact.name}"`);
    return entry;
  }

  static getContracts() { return this.loadDB().contracts; }
  static addContract(userId: number, contract: Omit<Contract, 'id' | 'created_at'>) {
    const db = this.loadDB();
    const newId = db.contracts.length > 0 ? Math.max(...db.contracts.map(c => c.id)) + 1 : 1;
    const entry: Contract = { ...contract, id: newId, created_at: getNowISO() };
    db.contracts.push(entry);
    this.saveDB(db);
    this.logActivity(userId, 'create', 'Contract', newId, `إنشاء عقد توريد جديد بقيمة $${contract.value}`, `Created new contract valued $${contract.value}`);
    return entry;
  }

  // Sales (Leads, Opportunities, Deals, Quotations, Invoices)
  static getLeads() { return this.loadDB().leads; }
  static getOpportunities() { return this.loadDB().opportunities; }
  static getDeals() { return this.loadDB().deals; }
  static getQuotations() { return this.loadDB().quotations; }
  static getInvoices() { return this.loadDB().invoices; }

  static updateLeadStatus(userId: number, leadId: number, status: any) {
    const db = this.loadDB();
    const idx = db.leads.findIndex(l => l.id === leadId);
    if (idx !== -1) {
      db.leads[idx].status = status;
      this.saveDB(db);
      this.logActivity(userId, 'update', 'Client', db.leads[idx].client_id, `تعديل حالة الفرع المحتمل إلى "${status}"`, `Updated lead status to "${status}"`);
      return db.leads[idx];
    }
    return null;
  }

  static updateLeadPriority(userId: number, leadId: number, priority: 'low' | 'medium' | 'high') {
    const db = this.loadDB();
    const idx = db.leads.findIndex(l => l.id === leadId);
    if (idx !== -1) {
      db.leads[idx].priority = priority;
      this.saveDB(db);
      this.logActivity(userId, 'update', 'Client', db.leads[idx].client_id, `تعديل أولوية الفرصة إلى "${priority}"`, `Updated lead priority to "${priority}"`);
      return db.leads[idx];
    }
    return null;
  }

  static addLead(userId: number, lead: Omit<Lead, 'id' | 'created_at'>) {
    const db = this.loadDB();
    const newId = db.leads.length > 0 ? Math.max(...db.leads.map(l => l.id)) + 1 : 1;
    const entry: Lead = { ...lead, id: newId, created_at: getNowISO() };
    db.leads.push(entry);
    this.saveDB(db);
    return entry;
  }

  static addOpportunity(userId: number, opp: Omit<Opportunity, 'id' | 'created_at'>) {
    const db = this.loadDB();
    const newId = db.opportunities.length > 0 ? Math.max(...db.opportunities.map(o => o.id)) + 1 : 1;
    const entry: Opportunity = { ...opp, id: newId, created_at: getNowISO() };
    db.opportunities.push(entry);
    this.saveDB(db);
    return entry;
  }

  static addInvoice(userId: number, inv: Omit<Invoice, 'id' | 'created_at'>) {
    const db = this.loadDB();
    const newId = db.invoices.length > 0 ? Math.max(...db.invoices.map(i => i.id)) + 1 : 1;
    const entry: Invoice = { ...inv, id: newId, created_at: getNowISO() };
    db.invoices.push(entry);
    this.saveDB(db);
    this.logActivity(userId, 'create', 'Invoice', newId, `إصدار فاتورة جديدة رقم "${inv.invoice_number}"`, `Generated invoice "${inv.invoice_number}"`);
    return entry;
  }

  static addQuotation(userId: number, quota: Omit<Quotation, 'id' | 'created_at'>) {
    const db = this.loadDB();
    const newId = db.quotations.length > 0 ? Math.max(...db.quotations.map(q => q.id)) + 1 : 1;
    const entry: Quotation = { ...quota, id: newId, created_at: getNowISO() };
    db.quotations.push(entry);
    this.saveDB(db);
    return entry;
  }

  static updateInvoiceStatus(userId: number, id: number, status: any) {
    const db = this.loadDB();
    const idx = db.invoices.findIndex(i => i.id === id);
    if (idx !== -1) {
      db.invoices[idx].status = status;
      if (status === 'paid') {
        db.invoices[idx].paid_at = getNowISO();
        
        // system notification
        const alertId = db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1;
        db.notifications.unshift({
          id: alertId,
          user_id: userId,
          title_ar: 'تم سداد فاتورة بنجاح',
          title_en: 'Invoice settled successfully',
          content_ar: `الفاتورة رقم ${db.invoices[idx].invoice_number} تم سدادها بالكامل بمبلغ ${db.invoices[idx].total_amount} ر.س`,
          content_en: `Invoice ${db.invoices[idx].invoice_number} has been fully settled for ${db.invoices[idx].total_amount} SAR`,
          type: 'invoice_paid',
          is_read: false,
          created_at: getNowISO()
        });
      }
      this.saveDB(db);
      this.logActivity(userId, 'update', 'Invoice', id, `تعديل حالة الفاتورة رقم ${db.invoices[idx].invoice_number} إلى "${status}"`, `Updated Invoice ${db.invoices[idx].invoice_number} status to "${status}"`);
      return db.invoices[idx];
    }
    return null;
  }

  // Tasks CRUD
  static getTasks() {
    this.processTaskReminders();
    return this.loadDB().tasks;
  }
  
  static addTask(userId: number, taskData: Omit<Task, 'id' | 'created_at'>) {
    const db = this.loadDB();
    const newId = db.tasks.length > 0 ? Math.max(...db.tasks.map(t => t.id)) + 1 : 1;
    const newTask: Task = { ...taskData, id: newId, created_at: getNowISO() };
    db.tasks.push(newTask);
    
    // Auto-create task reminder in Notifications if urgent
    if (taskData.priority === 'urgent' && taskData.assigned_to_id) {
      const alertId = db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1;
      db.notifications.unshift({
        id: alertId,
        user_id: taskData.assigned_to_id,
        title_ar: 'تنبيه: مهمة عاجلة جديدة',
        title_en: 'Urgent Task Assigned',
        content_ar: `تم إسناد مهمة عاجلة جديدة إليك: "${taskData.title}" ميعاد التسليم: ${taskData.due_date}`,
        content_en: `An urgent task was assigned to you: "${taskData.title}" due at: ${taskData.due_date}`,
        type: 'task_alert',
        is_read: false,
        created_at: getNowISO()
      });
    }

    this.saveDB(db);
    this.logActivity(userId, 'create', 'Task', newId, `إنشاء مهمة جديدة: "${newTask.title}"`, `Created task "${newTask.title}"`);
    this.processTaskReminders();
    return newTask;
  }

  static updateTask(userId: number, id: number, taskData: Partial<Task>) {
    const db = this.loadDB();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.tasks[idx] = { ...db.tasks[idx], ...taskData };
      const updated = db.tasks[idx];
      this.saveDB(db);
      this.logActivity(userId, 'update', 'Task', id, `تحديث حالة المهمة "${updated.title}" إلى "${updated.status}"`, `Updated task "${updated.title}" status to "${updated.status}"`);
      this.processTaskReminders();
      return updated;
    }
    return null;
  }

  static addTaskComment(userId: number, id: number, commentData: { user_name: string; content: string }) {
    const db = this.loadDB();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const task = db.tasks[idx];
      const comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_name: commentData.user_name,
        content: commentData.content,
        created_at: getNowISO()
      };
      task.comments = task.comments || [];
      task.comments.push(comment);
      this.saveDB(db);
      this.logActivity(
        userId, 
        'update', 
        'Task', 
        id, 
        `أضاف تعليقاً على المهمة: ${task.title}`, 
        `Added comment to task: ${task.title}`
      );
      return task;
    }
    return null;
  }

  static addSubtask(userId: number, id: number, title: string) {
    const db = this.loadDB();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const task = db.tasks[idx];
      const subtask: SubTask = {
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim(),
        completed: false,
        created_at: getNowISO()
      };
      task.subtasks = task.subtasks || [];
      task.subtasks.push(subtask);
      this.saveDB(db);
      this.logActivity(
        userId,
        'update',
        'Task',
        id,
        `إضافة مهمة فرعية جديدة: "${subtask.title}" إلى المهمة "${task.title}"`,
        `Added subtask: "${subtask.title}" to task "${task.title}"`
      );
      return task;
    }
    return null;
  }

  static toggleSubtask(userId: number, id: number, subtaskId: string, completed?: boolean) {
    const db = this.loadDB();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const task = db.tasks[idx];
      if (task.subtasks) {
        const sIdx = task.subtasks.findIndex(s => s.id === subtaskId);
        if (sIdx !== -1) {
          const newCompleted = completed !== undefined ? completed : !task.subtasks[sIdx].completed;
          task.subtasks[sIdx].completed = newCompleted;
          this.saveDB(db);
          this.logActivity(
            userId,
            'update',
            'Task',
            id,
            `تحديث إنجاز المهمة الفرعية: "${task.subtasks[sIdx].title}" (${newCompleted ? 'مكتملة' : 'غير مكتملة'})`,
            `Updated subtask status: "${task.subtasks[sIdx].title}" (${newCompleted ? 'Completed' : 'Pending'})`
          );
          return task;
        }
      }
    }
    return null;
  }

  static deleteSubtask(userId: number, id: number, subtaskId: string) {
    const db = this.loadDB();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const task = db.tasks[idx];
      if (task.subtasks) {
        task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
        this.saveDB(db);
        this.logActivity(
          userId,
          'update',
          'Task',
          id,
          `حذف مهمة فرعية من المهمة: ${task.title}`,
          `Deleted a subtask from task: ${task.title}`
        );
        return task;
      }
    }
    return null;
  }

  static deleteTask(userId: number, id: number) {
    const db = this.loadDB();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const task = db.tasks[idx];
      db.tasks.splice(idx, 1);
      this.saveDB(db);
      this.logActivity(userId, 'delete', 'Task', id, `حذف المهمة "${task.title}"`, `Deleted task "${task.title}"`);
      return true;
    }
    return false;
  }

  // Automated reminder system for tasks marked as 'Urgent' or 'High' priority, triggered by due_date
  static processTaskReminders() {
    const db = this.loadDB();
    const now = new Date();
    let updated = false;

    // Filter tasks with 'urgent' or 'high' priority and not completed/canceled
    const targetTasks = db.tasks.filter(t => 
      (t.priority === 'urgent' || t.priority === 'high') && 
      t.status !== 'completed' && 
      t.status !== 'canceled' &&
      t.assigned_to_id
    );

    for (const task of targetTasks) {
      const dueDate = new Date(task.due_date);
      const timeDiffMs = dueDate.getTime() - now.getTime();
      const hoursRemaining = timeDiffMs / (1000 * 60 * 60);

      const isOverdue = hoursRemaining < 0;
      const isDueSoon = hoursRemaining >= 0 && hoursRemaining <= (task.priority === 'urgent' ? 48 : 24);

      if (isOverdue) {
        // Check if an overdue notification already exists for this task
        const overdueSignature = `[Overdue Alert][Task #${task.id}]`;
        const exists = db.notifications.some(n => 
          n.user_id === task.assigned_to_id && 
          n.content_en.includes(overdueSignature)
        );

        if (!exists) {
          const alertId = db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1;
          const priorityLabelAr = task.priority === 'urgent' ? 'عاجلة جداً' : 'عالية الأهمية';

          db.notifications.unshift({
            id: alertId,
            user_id: task.assigned_to_id!,
            title_ar: `⚠️ مهمة ${priorityLabelAr} متأخرة!`,
            title_en: `⚠️ ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Task Overdue!`,
            content_ar: `تنبيه تلقائي: المهمة "${task.title}" قد تجاوزت تاريخ الاستحقاق المحدد (${new Date(task.due_date).toLocaleString('ar-SA', { hour12: false })}). يرجى تلبيتها فوراً. ${overdueSignature}`,
            content_en: `Automated Reminder: The ${task.priority} task "${task.title}" has passed its scheduled due date (${new Date(task.due_date).toLocaleString()}). Please act on it immediately. ${overdueSignature}`,
            type: 'task_alert',
            is_read: false,
            created_at: getNowISO()
          });
          updated = true;
        }
      } else if (isDueSoon) {
        // Check if a due soon notification already exists for this task
        const dueSoonSignature = `[Due Soon Alert][Task #${task.id}]`;
        const exists = db.notifications.some(n => 
          n.user_id === task.assigned_to_id && 
          n.content_en.includes(dueSoonSignature)
        );

        if (!exists) {
          const alertId = db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1;
          const priorityLabelAr = task.priority === 'urgent' ? 'عاجلة جداً' : 'عالية الأهمية';
          const remainingTextAr = hoursRemaining < 1 
            ? 'خلال أقل من ساعة' 
            : `خلال غضون ${Math.round(hoursRemaining)} ساعة`;
          const remainingTextEn = hoursRemaining < 1
            ? 'in less than an hour'
            : `within ${Math.round(hoursRemaining)} hours`;

          db.notifications.unshift({
            id: alertId,
            user_id: task.assigned_to_id!,
            title_ar: `⏱️ اقترب موعد مهمة ${priorityLabelAr}`,
            title_en: `⏱️ ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Task Due Soon`,
            content_ar: `تنبيه تلقائي: ميعاد تسليم المهمة "${task.title}" يحلّ ${remainingTextAr} (الموافق ${new Date(task.due_date).toLocaleString('ar-SA', { hour12: false })}). ${dueSoonSignature}`,
            content_en: `Automated Reminder: The ${task.priority} task "${task.title}" is due ${remainingTextEn} (scheduled on ${new Date(task.due_date).toLocaleString()}). ${dueSoonSignature}`,
            type: 'task_alert',
            is_read: false,
            created_at: getNowISO()
          });
          updated = true;
        }
      }
    }

    if (updated) {
      this.saveDB(db);
    }
  }

  // System Notifications
  static getNotifications(userId: number) {
    this.processTaskReminders();
    return this.loadDB().notifications.filter(n => n.user_id === userId);
  }

  static markNotificationRead(userId: number, id: number) {
    const db = this.loadDB();
    const idx = db.notifications.findIndex(n => n.id === id && n.user_id === userId);
    if (idx !== -1) {
      db.notifications[idx].is_read = true;
      this.saveDB(db);
      return true;
    }
    return false;
  }

  // Logs
  static getLogs() {
    return this.loadDB().activity_logs;
  }

  // Users
  static getUsers() {
    return this.loadDB().users;
  }

  // Settings CRUD
  static getSettings() {
    return this.loadDB().settings;
  }

  static updateSettings(userId: number, settings: Partial<SystemSettings>) {
    const db = this.loadDB();
    db.settings = { ...db.settings, ...settings };
    this.saveDB(db);
    this.logActivity(userId, 'update', undefined, undefined, 'تعديل الإعدادات العامة للنظام', 'Updated general system configuration');
    return db.settings;
  }

  // AI Robots API
  static getAIRobots() {
    return this.loadDB().ai_robots;
  }

  static toggleAIRobot(userId: number, id: string, enabled: boolean) {
    const db = this.loadDB();
    const idx = db.ai_robots.findIndex(r => r.id === id);
    if (idx !== -1) {
      db.ai_robots[idx].enabled = enabled;
      const robot = db.ai_robots[idx];
      const name = robot.name_ar;
      robot.last_action_ar = enabled ? 'تم تفعيل الروبوت وبدأ مسح السجلات بنجاح.' : 'تم تعطيل الروبوت وإيقاف العمليات المجدولة.';
      robot.last_action_en = enabled ? 'Robot enabled. Active scan initialized successfully.' : 'Robot disabled. Scheduled automated sweeps halted.';
      robot.last_action_at = getNowISO();
      
      this.saveDB(db);
      this.logActivity(
        userId,
        'update',
        undefined,
        undefined,
        `${enabled ? 'تفعيل' : 'إيقاف'} روبوت الذكاء الاصطناعي: "${name}"`,
        `${enabled ? 'Enabled' : 'Disabled'} AI Robot: "${robot.name_en}"`
      );
      return robot;
    }
    return null;
  }

  static updateAIRobot(userId: number, id: string, updates: Partial<AIRobot>) {
    const db = this.loadDB();
    const idx = db.ai_robots.findIndex(r => r.id === id);
    if (idx !== -1) {
      const robot = db.ai_robots[idx];
      const isStatusToggle = updates.enabled !== undefined && updates.enabled !== robot.enabled;
      
      // Merge updates
      db.ai_robots[idx] = { ...robot, ...updates };
      const updatedRobot = db.ai_robots[idx];
      
      if (isStatusToggle) {
        const enabled = updates.enabled;
        updatedRobot.last_action_ar = enabled ? 'تم تفعيل الروبوت وبدأ مسح السجلات بنجاح.' : 'تم تعطيل الروبوت وإيقاف العمليات المجدولة.';
        updatedRobot.last_action_en = enabled ? 'Robot enabled. Active scan initialized successfully.' : 'Robot disabled. Scheduled automated sweeps halted.';
        updatedRobot.last_action_at = getNowISO();
      }

      this.saveDB(db);
      
      let actionAr = `تحديث إعدادات وجدولة روبوت الذكاء الاصطناعي: "${updatedRobot.name_ar}"`;
      let actionEn = `Updated settings & scheduling configuration for AI Robot: "${updatedRobot.name_en}"`;
      if (isStatusToggle) {
        actionAr = `${updates.enabled ? 'تفعيل' : 'إيقاف'} روبوت الذكاء الاصطناعي: "${updatedRobot.name_ar}"`;
        actionEn = `${updates.enabled ? 'Enabled' : 'Disabled'} AI Robot: "${updatedRobot.name_en}"`;
      }
      
      this.logActivity(
        userId,
        'update',
        undefined,
        undefined,
        actionAr,
        actionEn
      );
      return updatedRobot;
    }
    return null;
  }

  static emergencyKillSwitch(userId: number) {
    const db = this.loadDB();
    let deactivatedCount = 0;
    
    db.ai_robots.forEach(robot => {
      if (robot.enabled) {
        robot.enabled = false;
        deactivatedCount++;
        robot.last_action_ar = '🆘 تم إيقاف الروبوت فوراً بواسطة المفتاح العاجل للطوارئ (Master Kill Switch).';
        robot.last_action_en = '🆘 Robot halted immediately by Master Emergency Kill Switch.';
        robot.last_action_at = getNowISO();
      }
    });

    this.saveDB(db);

    this.logActivity(
      userId,
      'delete',
      undefined,
      undefined,
      `🚨 تفعيل مفتاح الطوارئ العاجل: تم إيقاف جميع عمليات الروبوتات النشطة عدد (${deactivatedCount}).`,
      `🚨 Master Emergency Kill Switch activated: instantly halted all (${deactivatedCount}) running AI robots.`
    );

    return db.ai_robots;
  }

  static isRobotInSchedule(robot: AIRobot): boolean {
    if (!robot.schedule_enabled) return true;
    
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
    
    const allowedDays = robot.schedule_days || [1, 2, 3, 4, 5];
    if (!allowedDays.includes(day)) {
      return false;
    }
    
    const startStr = robot.schedule_start || "09:00";
    const endStr = robot.schedule_end || "17:00";
    
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);
    
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    
    if (startMin <= endMin) {
      return currentMin >= startMin && currentMin <= endMin;
    } else {
      return currentMin >= startMin || currentMin <= endMin;
    }
  }

  static triggerAIRobot(userId: number, id: string, force = false) {
    const db = this.loadDB();
    const idx = db.ai_robots.findIndex(r => r.id === id);
    if (idx === -1) return null;

    const robot = db.ai_robots[idx];
    if (!robot.enabled) {
      return { error_ar: 'يرجى تفعيل الروبوت أولاً قبل إطلاق عمله تلقائياً.', error_en: 'Please enable the robot first before executing manual run.' };
    }

    if (!force && robot.schedule_enabled) {
      if (!this.isRobotInSchedule(robot)) {
        const start = robot.schedule_start || '09:00';
        const end = robot.schedule_end || '17:00';
        const daysMapAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const daysMapEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const scheduleDaysStrAr = (robot.schedule_days || [1,2,3,4,5]).map(d => daysMapAr[d]).join('، ');
        const scheduleDaysStrEn = (robot.schedule_days || [1,2,3,4,5]).map(d => daysMapEn[d]).join(', ');

        return {
          error_ar: `⚠️ هذا الروبوت مجدول حالياً للتشغيل فقط خلال النافذة المحددة (${scheduleDaysStrAr}، من ${start} إلى ${end}). الوقت الحالي خارج هذه النافذة.`,
          error_en: `⚠️ This robot is scheduled to run only during specific intervals (${scheduleDaysStrEn}, from ${start} to ${end}). Current time is outside this window.`,
          isScheduledOut: true
        };
      }
    }

    robot.run_count += 1;
    robot.last_action_at = getNowISO();

    let detailAr = '';
    let detailEn = '';

    if (robot.type === 'leads_qualifier') {
      const newLeads = db.leads.filter(l => l.status === 'new');
      if (newLeads.length > 0) {
        const targetLead = newLeads[0];
        targetLead.status = 'qualified';
        const randScore = Math.floor(Math.random() * 25) + 70; // 70-95
        targetLead.score = randScore;
        const client = db.clients.find(c => c.id === targetLead.client_id);
        const name = client ? client.name : 'عميل غير محدد';

        detailAr = `قام الروبوت بفحص وتأهيل عميل مبيعات جديد: "${name}" بمعدل جدارية ${randScore} نقطة.`;
        detailEn = `AI Robot categorized and qualified new sales lead for client "${name}" with high readiness score: ${randScore}/100`;

        db.notifications.unshift({
          id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
          user_id: userId,
          title_ar: '🤖 روبوت التأهيل: تم ترقية عميل لـ "مؤهل"',
          title_en: '🤖 AI Qualifier: Lead upgraded to Qualified',
          content_ar: `تم تأهيل العميل "${name}" وحصل على درجة تقييم ملاءمة مبيعات ${randScore}/100 تلقائياً.`,
          content_en: `Client "${name}" has been successfully qualified with scoring index: ${randScore}/100.`,
          type: 'lead_update',
          is_read: false,
          created_at: getNowISO()
        });

        // 🚨 High Priority Completed Alert Channel
        if (randScore >= 85) {
          db.notifications.unshift({
            id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
            user_id: userId,
            title_ar: '🚨 أولوية قصوى: أكمل الروبوت مهمة تأهيل بصفقة قيّمة جداً',
            title_en: '🚨 Critical Alert: High-Priority Robot Lead Qualified',
            content_ar: `إتمام فائق الأهمية! قام الروبوت بتأهيل قيادي عميل مبيعات ذي طراز خاص ("${name}") واحتساب ملاءمة عالية جداً: ${randScore}/100 وتحويله لقسم كبار العملاء المتميزين.`,
            content_en: `High-value milestone! AI Robot completed qualifying a critical user lead ("${name}") with superior qualification score of ${randScore}/100.`,
            type: 'system_event',
            is_read: false,
            created_at: getNowISO()
          });
        }
      } else {
        detailAr = 'تم فحص قاعدة السجلات ولم يتم العثور على صفقات مبيعات جديدة بانتظار التأهيل.';
        detailEn = 'Lead sweep completed. No pending new inquiries found awaiting classification.';

        // ⚠️ Error Log Alert Channel
        db.notifications.unshift({
          id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
          user_id: userId,
          title_ar: '⚠️ خطأ تقرير الذكاء الاصطناعي: نقص مدخلات الروبوت',
          title_en: '⚠️ Robot Error Log: Target Leads Empty',
          content_ar: `فشل مسح روبوت التأهيل (AI Qualifier). تعذر كشف أي عميل مبيعات جديد بانتظار التقييم والتحليل المبرمج في قاعدة المعطيات الحالية.`,
          content_en: `Operational alert: AI Leads Qualifier sweep completed with warnings. Zero new inquiries found in the pipeline.`,
          type: 'system_event',
          is_read: false,
          created_at: getNowISO()
        });
      }
    } 
    else if (robot.type === 'task_escalator') {
      const activeTasks = db.tasks.filter(t => t.status !== 'completed' && t.status !== 'canceled');
      if (activeTasks.length > 0) {
        const task = activeTasks[0];
        task.comments = task.comments || [];
        const commentId = `comment-bot-${Date.now()}`;
        task.comments.push({
          id: commentId,
          user_name: 'روبوت المتابعة الذكي (AI Agent)',
          content: `⚠️ تنبيه ذكي: هذه المهمة تقترب من تاريخ الاستحقاق (${new Date(task.due_date).toLocaleDateString()})، ولم يقم أي موظف بإضافة تحديثات كافية مؤخراً. الرجاء الرد والمتابعة وتحريك المشروع.`,
          created_at: getNowISO()
        });

        detailAr = `أضاف الروبوت تعليق تذكير يدوياً على المهمة: "${task.title}".`;
        detailEn = `Robot automatically posted an urgency warning remark on the task: "${task.title}".`;

        db.notifications.unshift({
          id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
          user_id: userId,
          title_ar: '🤖 روبوت المتابعة: تصعيد مهمة متأخرة',
          title_en: '🤖 AI Escalator: Warning comment drafted',
          content_ar: `تم نشر تعليق متابعة صارم على المهمة: "${task.title}" لحث المسؤول على الإنجاز والعمل.`,
          content_en: `System issued warning log comment on overdue task: "${task.title}".`,
          type: 'task_alert',
          is_read: false,
          created_at: getNowISO()
        });

        // 🚨 High Priority Completed Alert Channel
        if (task.priority === 'high' || task.priority === 'urgent') {
          db.notifications.unshift({
            id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
            user_id: userId,
            title_ar: '🚨 أولوية قصوى: أكمل الروبوت تصعيد مهمة حرجة عاجلة',
            title_en: '🚨 Critical Alert: High-Priority Robot Task Escalated',
            content_ar: `تنبيه حرج! قام الروبوت بتصعيد ومعالجة تكليف معلق ذو أهمية قصوى: "${task.title}" ومطالبة فريق العمل بالتحرك الفوري وإتمام التشغيل.`,
            content_en: `Overdue checkpoint! AI Escalator has executed critical follow-ups on high-priority task: "${task.title}". Immediate action requested from team members.`,
            type: 'task_alert',
            is_read: false,
            created_at: getNowISO()
          });
        }
      } else {
        detailAr = 'تم فحص جميع التكليفات؛ جميع المهام نشطة بالكامل ولا توجد أي مؤشرات لتأخيرات حتى الآن.';
        detailEn = 'All tasks look green. Sweep completed with no outstanding overdue risks calculated.';

        // ⚠️ Error Log Alert Channel
        db.notifications.unshift({
          id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
          user_id: userId,
          title_ar: '⚠️ خطأ تقرير الذكاء الاصطناعي: نقص المهام للفرز والتصعيد',
          title_en: '⚠️ Robot Error Log: Target Tasks Empty',
          content_ar: `فشل مراجعة روبوت تصعيد المهام (AI Escalator). تعذر كشف أي تكاليف أو مشاريع عالقة أو قريبة الاستحقاق للفرز والتنبيه والتحصين المجدول.`,
          content_en: `Operational alert: AI Escalator sweep completed with warnings. All tasks appear to be fully synchronized and completed; zero candidates found.`,
          type: 'system_event',
          is_read: false,
          created_at: getNowISO()
        });
      }
    }
    else if (robot.type === 'email_writer') {
      const client = db.clients.find(c => c.email);
      if (client) {
        client.emails = client.emails || [];
        client.emails.push({
          id: `email-bot-${Date.now()}`,
          subject: 'مقترح ترقية الحلول الرقمية (AI Draft Proposal)',
          body: `عزيزنا ${client.name}،\n\nبناءً على طلبكم ومعايير الحوسبة السحابية لديكم، يقترح نظامنا ترقية البنية التحتية لديكم وزيادة عدد تراخيص الخوادم بمعدل 20% لتحقيق مرونة تشغيل تصل إلى 99.99%.\n\nيسعدنا مناقشة التفاصيل في مكالمتنا القادمة.\n\nمع التحية،\nروبوت المبيعات الآلي`,
          date: getNowISO(),
          from: 'sales-assistant@hypersolutions.com',
          folder: 'Drafts'
        });

        detailAr = `صاغ الروبوت مسودة مقترح بريد احترافي وأرسله لقسم المسودات للعميل: "${client.name}".`;
        detailEn = `Successfully generated a draft follow-up proposal email for client "${client.name}".`;

        db.notifications.unshift({
          id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
          user_id: userId,
          title_ar: '🤖 روبوت المراسلات: بريد ذكي مجهز',
          title_en: '🤖 AI Copywriter: Custom email compiled',
          content_ar: `تمت صياغة مقترح مبيعات وأرشفته كمسودة في سجلات العميل: "${client.name}" للتوقيع.`,
          content_en: `Drafted technical customer proposal template for client: "${client.name}".`,
          type: 'system_event',
          is_read: false,
          created_at: getNowISO()
        });

        // 🚨 High Priority Completed Alert Channel
        db.notifications.unshift({
          id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
          user_id: userId,
          title_ar: '🚨 أولوية قصوى: صياغة مسودة مبيعات وعروض استراتيجية لعميل مميز',
          title_en: '🚨 Critical Alert: High-Priority Robot Email Compiled',
          content_ar: `أكمل الروبوت إنتاج مستند العرض التقني المتقدم، وصيغت شروط الالتزام بالـ SLA الخاصة بالعميل المميز "${client.name}" بنجاح فائق وإيداعه في المسودات.`,
          content_en: `Success milestone! AI Copywriter completed high-priority proposal drafting for core account: "${client.name}". Document cataloged under active pipeline drafts.`,
          type: 'system_event',
          is_read: false,
          created_at: getNowISO()
        });
      } else {
        detailAr = 'فشلت العملية لعدم وجود عملاء مسجلين يمتلكون بريداً إلكترونياً صحيحاً بانتظار المراسلة.';
        detailEn = 'Failed to run. No registered clients exist with active emails configured.';

        // ⚠️ Error Log Alert Channel
        db.notifications.unshift({
          id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
          user_id: userId,
          title_ar: '⚠️ خطأ تقرير الذكاء الاصطناعي: نقص بيانات البريد المستهدفة',
          title_en: '⚠️ Robot Error Log: Target Clients Empty',
          content_ar: `فشل صياغة المراسلات الآلية (AI Copywriter). تسبب نقص وجود أي عميل يملك بريداً صحيحاً مسجلاً في إحباط مسار كتابة عروض الترقية المؤتمتة.`,
          content_en: `Operational alert: AI Copywriter failed to identify any viable clients associated with active email channels within the regional CRM.`,
          type: 'system_event',
          is_read: false,
          created_at: getNowISO()
        });
      }
    }
    else if (robot.type === 'financial_analyst') {
      const unpaid = db.invoices.find(inv => inv.status === 'unpaid');
      if (unpaid) {
        const client = db.clients.find(c => c.id === unpaid.client_id);
        const name = client ? client.name : 'العميل';
        
        detailAr = `أنجز الروبوت تحليل التدفق المالي للفاتورة #${unpaid.invoice_number} المستحقة على "${name}" وعمل توقعات تحصيل دقيقة.`;
        detailEn = `Compiled ledger audit and cashflow forecasting metrics for outstanding invoice #${unpaid.invoice_number}.`;

        db.notifications.unshift({
          id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
          user_id: userId,
          title_ar: '🤖 روبوت المحاسبة: تقرير احتساب الذمم',
          title_en: '🤖 AI Treasurer: Net cashflow forecast calculated',
          content_ar: `تم إصدار مذكرة تحليل التدفق المالي للفترة القادمة وتوقع سداد بنسبة 85% للفاتورة #${unpaid.invoice_number}.`,
          content_en: `Issued custom audit predictions for upcoming unpaid bill #${unpaid.invoice_number}.`,
          type: 'invoice_paid',
          is_read: false,
          created_at: getNowISO()
        });

        // 🚨 High Priority Completed Alert Channel
        if (unpaid.total_amount >= 5000) {
          db.notifications.unshift({
            id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
            user_id: userId,
            title_ar: '🚨 أولوية قصوى: تقرير التحصيل المالي للفواتير الكبرى المستحقة',
            title_en: '🚨 Critical Alert: High-Priority Robot Invoice Audited',
            content_ar: `تقرير تحسين سيولة! أكمل الروبوت بنجاح مراجعة وتدقيق الذمم المالية والضرائب المترتبة للفاتورة الكبرى رقم #${unpaid.invoice_number} بقيمة إجمالية ${unpaid.total_amount} دولار للعميل "${name}".`,
            content_en: `Atypical transaction milestone! AI Treasurer compiled net ledger and tax forecasting models for substantial pending invoice #${unpaid.invoice_number} ($${unpaid.total_amount}) owned by client "${name}".`,
            type: 'invoice_paid',
            is_read: false,
            created_at: getNowISO()
          });
        }
      } else {
        detailAr = 'تم مسح الفواتير؛ جميع الفواتير ومتحصلات الصفقات تم تحصيلها بالكامل وصفر متأخرات.';
        detailEn = 'All invoices are fully paid! Run completed with zero pending collections.';

        // ⚠️ Error Log Alert Channel
        db.notifications.unshift({
          id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
          user_id: userId,
          title_ar: '⚠️ خطأ تقرير الذكاء الاصطناعي: نقص المعطيات المالية والفواتير المستحقة',
          title_en: '⚠️ Robot Error Log: Target Unpaid Ledger Empty',
          content_ar: `فشل التحليل المالي والمحاسبي المبرمج (AI Treasurer). تعذر الكشف عن أي فواتير ذمم مدينة غير مدفوعة أو عاجلة مسجلة في سجلات الشركة.`,
          content_en: `Operational alert: AI Treasurer finished auditing. All user ledgers are balanced and fully paid; zero pending invoices identified.`,
          type: 'system_event',
          is_read: false,
          created_at: getNowISO()
        });
      }
    }
    else if (robot.type === 'sentiment_analyzer') {
      const activeClient = db.clients.find(c => c.status === 'active_client');
      if (activeClient) {
        const randCSAT = Math.floor(Math.random() * 23) + 75; // 75-98
        activeClient.notes = (activeClient.notes || '') + `\n[تنبيه الرضا الذكي - CSAT ${randCSAT}%]: تم رصد تفاعل إيجابي وصوت عميل مستقر في تاريخ ${new Date().toLocaleDateString('ar-EG')}.`;

        detailAr = `أجرى الروبوت مسح المشاعر للعميل "${activeClient.name}" واحتسب مؤشر السعادة والرضا CSAT بمقدار ${randCSAT}%.`;
        detailEn = `Successfully ran AI Sentiment scan on client "${activeClient.name}", estimating relationship wellbeing index (CSAT) at ${randCSAT}%.`;

        db.notifications.unshift({
          id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
          user_id: userId,
          title_ar: '🤖 روبوت المشاعر: تحليل رضا العملاء',
          title_en: '🤖 AI Sentiment Guardian: CSAT Calculated',
          content_ar: `أكمل الروبوت تحليل تفاعلات العميل "${activeClient.name}" واحتساب نسبة السعادة CSAT بمقدار ${randCSAT}%.`,
          content_en: `Calculated happiness score index for "${activeClient.name}" at ${randCSAT}% based on customer logs.`,
          type: 'lead_update',
          is_read: false,
          created_at: getNowISO()
        });

        if (randCSAT >= 90) {
          db.notifications.unshift({
            id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
            user_id: userId,
            title_ar: '🚨 أولوية قصوى: رصد مؤشر سعادة وولاء مرتفع جداً',
            title_en: '🚨 Critical Alert: High Customer Loyalty Detected',
            content_ar: `إشادة مستحقة! سجل العميل المميز "${activeClient.name}" مؤشر سعادة مدهش بلغت قيمته ${randCSAT}%، يوصي الروبوت بتقديم هدية ولاء أو عرض حصري لتوطيد الشراكة.`,
            content_en: `High retention milestone! Client "${activeClient.name}" registered superior CSAT score of ${randCSAT}%. AI Sentiment Guardian recommends a celebratory loyalty perk.`,
            type: 'system_event',
            is_read: false,
            created_at: getNowISO()
          });
        }
      } else {
        detailAr = 'فشل المسح لعدم العثور على أي عملاء نشطين لتحليل مشاعره في قاعدة البيانات.';
        detailEn = 'Failed to execute. No active clients identified in the regional CRM database.';

        db.notifications.unshift({
          id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
          user_id: userId,
          title_ar: '⚠️ خطأ تقرير الذكاء الاصطناعي: نقص العملاء لتحليل التفاعل',
          title_en: '⚠️ Robot Error Log: Active Client Pipeline Empty',
          content_ar: `فشل تشغيل فاحص المشاعر (AI Sentiment Guardian). تعذر تشخيص أو حساب رضا العملاء بسبب شغور قائمة العملاء النشطين حالياً.`,
          content_en: `Operational alert: Sentiment Guardian sweep finished with warnings. Zero active candidate profiles discovered.`,
          type: 'system_event',
          is_read: false,
          created_at: getNowISO()
        });
      }
    }
    else if (robot.type === 'retention_predictor') {
      const activeContract = db.contracts.find(c => c.status === 'active');
      if (activeContract) {
        const randRenewProb = Math.floor(Math.random() * 20) + 75; // 75-95%
        const upsellVal = Math.floor(activeContract.value * 0.25); // 25% expand
        const company = db.companies.find(c => c.id === activeContract.company_id);
        const compName = company ? company.name : 'الشركة الشريكة';

        const newOppId = db.opportunities.length > 0 ? Math.max(...db.opportunities.map(o => o.id)) + 1 : 1;
        db.opportunities.unshift({
          id: newOppId,
          lead_id: activeContract.id,
          title: `ترقية سحابية ذكية: توسعة عقد ${compName}`,
          stage: 'proposal',
          probability: randRenewProb,
          estimated_value: upsellVal,
          close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          created_at: getNowISO()
        });

        detailAr = `توقع الروبوت فرصة توسعة لخدمات عقد "${compName}" بقيمة إضافية قدرها ${upsellVal.toLocaleString()} ر.س ونسبة نجاح ${randRenewProb}%.`;
        detailEn = `Successfully forecasted a 25% upsell value of ${upsellVal.toLocaleString()} SAR for "${compName}" active contract with ${randRenewProb}% renew probability.`;

        db.notifications.unshift({
          id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
          user_id: userId,
          title_ar: '🤖 روبوت الاستبقاء: ترحيل فرصة ترقية ذكية ومستهدفة',
          title_en: '🤖 AI Retention: Upgrade Opportunity Forecasted',
          content_ar: `قام الروبوت بمسح عقد "${compName}" وتوقع فرصة مبيعات إضافية بقيمة ${upsellVal.toLocaleString()} ر.س لتوسعة الشبكات السحابية بنظرة تفاؤلية.`,
          content_en: `Pushed new expansion proposal opportunity for "${compName}" with value ${upsellVal.toLocaleString()} SAR and win probability: ${randRenewProb}%.`,
          type: 'lead_update',
          is_read: false,
          created_at: getNowISO()
        });

        if (upsellVal >= 25000) {
          db.notifications.unshift({
            id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
            user_id: userId,
            title_ar: '🚨 فرصة كبرى: تحليل القيمة الإضافية وترويج العقد المستحق',
            title_en: '🚨 Critical Alert: Strategic Contract Expansion Logged',
            content_ar: `إنجاز كبير! اكتشف الروبوت مواءمة استثنائية لترقية وتثبيت الشراكة لعقد شركة "${compName}"، مقترحاً توسعة فورية بعائد ضخم متوقع ${upsellVal.toLocaleString()} ر.س وبمعدل ثقة ${randRenewProb}%.`,
            content_en: `Substantial profit potential! AI Retention engine uncovered highly viable cloud expansion target for "${compName}" calculated at $${upsellVal}.`,
            type: 'system_event',
            is_read: false,
            created_at: getNowISO()
          });
        }
      } else {
        detailAr = 'فشلت المراجعة لعدم العثور على أي عقود نشطة في النظام لاستنتاج احتمالات تجديدها.';
        detailEn = 'Failed to execute prediction. No active contract files found in the CRM repository.';

        db.notifications.unshift({
          id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
          user_id: userId,
          title_ar: '⚠️ خطأ تقرير الذكاء الاصطناعي: نقص العقود النشطة',
          title_en: '⚠️ Robot Error Log: Target Active Contracts Empty',
          content_ar: `فشل تشغيل محرك الاستبقاء (AI Retention Engine). تعذر احتساب أو فرز ترقيات العقود بسبب خلو المستندات النشطة حالياً.`,
          content_en: `Operational alert: Retention Engine finished with warnings. Zero active contracts identified.`,
          type: 'system_event',
          is_read: false,
          created_at: getNowISO()
        });
      }
    }

    robot.last_action_ar = detailAr;
    robot.last_action_en = detailEn;

    // Record the robot's action in the activity logs
    let robotAction: any = 'update';
    let robotTargetType: any = undefined;
    let robotTargetId: number | undefined = undefined;

    if (robot.type === 'leads_qualifier') {
      const newLeads = db.leads.filter(l => l.status === 'new');
      if (newLeads.length > 0) {
        robotTargetType = 'Client';
        robotTargetId = newLeads[0].client_id;
      }
    } else if (robot.type === 'task_escalator') {
      const activeTasks = db.tasks.filter(t => t.status !== 'completed' && t.status !== 'canceled');
      if (activeTasks.length > 0) {
        robotTargetType = 'Task';
        robotTargetId = activeTasks[0].id;
      }
    } else if (robot.type === 'email_writer') {
      const client = db.clients.find(c => c.email);
      if (client) {
        robotTargetType = 'Client';
        robotTargetId = client.id;
      }
    } else if (robot.type === 'financial_analyst') {
      const unpaid = db.invoices.find(inv => inv.status === 'unpaid');
      if (unpaid) {
        robotTargetType = 'Invoice';
        robotTargetId = unpaid.id;
      }
    } else if (robot.type === 'sentiment_analyzer') {
      const activeClient = db.clients.find(c => c.status === 'active_client');
      if (activeClient) {
        robotTargetType = 'Client';
        robotTargetId = activeClient.id;
      }
    } else if (robot.type === 'retention_predictor') {
      const activeContract = db.contracts.find(c => c.status === 'active');
      if (activeContract) {
        robotTargetType = 'Contract';
        robotTargetId = activeContract.id;
      }
    }

    const newRobotLogId = db.activity_logs.length > 0 ? Math.max(...db.activity_logs.map(l => l.id)) + 1 : 1;
    db.activity_logs.unshift({
      id: newRobotLogId,
      user_id: 100 + idx,
      user_name: robot.name_en,
      action: robotAction,
      target_type: robotTargetType,
      target_id: robotTargetId,
      description_ar: detailAr,
      description_en: detailEn,
      ip_address: '127.0.0.1 (Robot Core)',
      created_at: getNowISO()
    });
    
    this.saveDB(db);
    this.logActivity(
      userId,
      'update',
      undefined,
      undefined,
      `تشغيل روبوت الذكاء الاصطناعي يدوياً: "${robot.name_ar}"`,
      `Executed AI Robot run: "${robot.name_en}"`
    );

    return { success: true, ai_robots: db.ai_robots };
  }

  // Inter-Agent Autonomous Collaboration & Swarm Workflow API
  static getAgentCollaborations() {
    const db = this.loadDB();
    if (!db.agent_collaborations) {
      db.agent_collaborations = [...defaultCollaborations];
      this.saveDB(db);
    }
    return db.agent_collaborations;
  }

  static clearAgentCollaborations(userId: number) {
    const db = this.loadDB();
    db.agent_collaborations = [];
    this.saveDB(db);
    this.logActivity(userId, 'delete', undefined, undefined, 'مسح سجل التخاطب بين روبوتات الذكاء الاصطناعي', 'Cleared inter-agent collaboration communication log');
    return [];
  }

  static triggerInterAgentPipeline(userId: number, force = false, targetLeadId?: number) {
    const db = this.loadDB();
    if (!db.agent_collaborations) {
      db.agent_collaborations = [];
    }

    // 1. Identify or prepare candidate client and lead
    let targetLead = targetLeadId ? db.leads.find(l => l.id === targetLeadId) : db.leads.find(l => l.status === 'new');
    let targetClient: Client | undefined;

    if (!targetLead) {
      targetClient = db.clients.find(c => c.status === 'new' || c.status === 'lead') || db.clients[0];
      if (targetClient) {
        const newLeadId = db.leads.length > 0 ? Math.max(...db.leads.map(l => l.id)) + 1 : 1;
        targetLead = {
          id: newLeadId,
          client_id: targetClient.id,
          source: 'الأتمتة الذاتية للفريق الافتراضي (Swarm Pipeline)',
          score: 50,
          status: 'new',
          expected_revenue: 120000,
          priority: 'high',
          created_at: getNowISO()
        };
        db.leads.push(targetLead);
      }
    } else {
      targetClient = db.clients.find(c => c.id === targetLead!.client_id);
    }

    if (!targetClient) {
      targetClient = db.clients[0];
    }

    const clientName = targetClient ? targetClient.name : 'العميل المستهدف';
    const compName = targetClient?.company_name || 'المؤسسة الشريكة';
    const workflowId = `wf-swarm-${Date.now()}`;
    const timestamp = getNowISO();

    const newCollaborations: AgentCollaboration[] = [];

    // --- STEP 1: Leads Qualifier Agent ---
    const qualifierBot = db.ai_robots.find(r => r.type === 'leads_qualifier');
    const targetScore = Math.floor(Math.random() * 8) + 91; // 91 - 98
    if (targetLead) {
      targetLead.status = 'qualified';
      targetLead.score = targetScore;
      targetLead.expected_revenue = targetLead.expected_revenue || 120000;
      targetLead.priority = 'high';
    }
    if (targetClient && targetClient.status === 'new') {
      targetClient.status = 'negotiating';
    }

    if (qualifierBot) {
      qualifierBot.run_count += 1;
      qualifierBot.last_action_at = timestamp;
      qualifierBot.last_action_ar = `أكمل تأهيل العميل "${clientName}" بنتيجة ${targetScore}/100 واستدعى روبوت المراسلات.`;
      qualifierBot.last_action_en = `Qualified client "${clientName}" with score ${targetScore}/100 and dispatched AI Copywriter.`;
    }

    const collab1: AgentCollaboration = {
      id: `collab-${Date.now()}-1`,
      workflow_id: workflowId,
      step_number: 1,
      from_robot_id: 'robot-leads-qualifier',
      from_robot_name_ar: 'مساعد تأهيل صفقات المبيعات',
      from_robot_name_en: 'AI Leads Qualifier Agent',
      to_robot_id: 'robot-email-writer',
      to_robot_name_ar: 'منشئ المراسلات وصياغة المعاملات',
      to_robot_name_en: 'AI Copywriter & SLA Dispatcher',
      message_ar: `@منشئ_المراسلات تم فحص وتأهيل سجل العميل "${clientName}" (${compName}) بنجاح بمعدل ملاءمة فائق ${targetScore}/100 وقيمة مقدرة ${(targetLead?.expected_revenue || 120000).toLocaleString()} ر.س! يرجى إعداد مسودة العرض التجاري والمقترح التعاقدي ومواصفات الـ SLA فوراً.`,
      message_en: `@AI_Copywriter Verified and qualified client "${clientName}" (${compName}) with superior score ${targetScore}/100! Please compile the commercial SLA proposal immediately.`,
      action_taken_ar: `تأهيل العميل واعتماد جاهزيته بنتيجة ${targetScore}/100 وترقية الحالة في الـ CRM`,
      action_taken_en: `Qualified lead with score ${targetScore}/100 and updated pipeline status`,
      target_entity: clientName,
      created_at: timestamp
    };
    newCollaborations.push(collab1);

    // --- STEP 2: Email Writer Agent ---
    const writerBot = db.ai_robots.find(r => r.type === 'email_writer');
    if (targetClient) {
      targetClient.emails = targetClient.emails || [];
      targetClient.emails.unshift({
        id: `email-swarm-${Date.now()}`,
        subject: `مقترح اتفاقية الحوسبة والخدمات السحابية المتقدمة - ${compName}`,
        body: `سعادة الأستاذ ${clientName} المحترم،\nتحية طيبة وبعد،\n\nيسرنا في شركة الحلول البرمجية الفائقة تقديم هذا العرض التقني المخصص لترقية البنية الرقمية لشركتكم (${compName})، متضمناً اتفاقية مستوى الخدمة SLA بنسبة جاهزية 99.99% ودعماً فنياً على مدار الساعة مع ضمان أمان البيانات والنسخ الاحتياطي الدوري.\n\nيسعدنا تحديد موعد للاجتماع ومناقشة تفاصيل بنود الاتفاقية ومواعيد التدشين.\n\nمع فائق الاحترام والتقدير،\nطاقم الذكاء الاصطناعي لإدارة المبيعات`,
        date: timestamp,
        from: 'sales-automation@hypersolutions.com',
        folder: 'Drafts'
      });
    }

    if (writerBot) {
      writerBot.run_count += 1;
      writerBot.last_action_at = timestamp;
      writerBot.last_action_ar = `صاغ مسودة العرض التقني والـ SLA وأودعها في مسودات "${clientName}" واستدعى مدير المتابعة.`;
      writerBot.last_action_en = `Drafted proposal & SLA into "${clientName}" drafts and called AI Task Escalator.`;
    }

    const collab2: AgentCollaboration = {
      id: `collab-${Date.now()}-2`,
      workflow_id: workflowId,
      step_number: 2,
      from_robot_id: 'robot-email-writer',
      from_robot_name_ar: 'منشئ المراسلات وصياغة المعاملات',
      from_robot_name_en: 'AI Copywriter & SLA Dispatcher',
      to_robot_id: 'robot-task-escalator',
      to_robot_name_ar: 'مدير المتابعة والتنبيهات المجدولة',
      to_robot_name_en: 'AI Task Escalator & Auto-Reminder',
      message_ar: `@مدير_المتابعة تم صياغة مسودة العرض التقني ومذكرة الشراكة وإيداعها بمسودات بريد العميل "${clientName}". أرجو جدولة مهمة تواصل عاجلة وحجز موعد لمناقشة العرض مع فريق المبيعات.`,
      message_en: `@AI_Escalator Commercial proposal & SLA memorandum drafted into client "${clientName}" drafts folder. Please schedule an urgent follow-up task on the CRM calendar.`,
      action_taken_ar: `إنشاء مسودة عرض مخصص وإيداعها في صندوق مسودات العميل`,
      action_taken_en: `Drafted technical proposal and committed to client email drafts`,
      target_entity: clientName,
      created_at: timestamp
    };
    newCollaborations.push(collab2);

    // --- STEP 3: Task Escalator Agent ---
    const escalatorBot = db.ai_robots.find(r => r.type === 'task_escalator');
    const newTaskId = db.tasks.length > 0 ? Math.max(...db.tasks.map(t => t.id)) + 1 : 1;
    const taskDueDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    db.tasks.unshift({
      id: newTaskId,
      title: `متابعة مناقشة العرض الفني وتوقيع اتفاقية SLA مع: ${clientName}`,
      description: `مهمة مجدولة ذاتياً من فريق الروبوتات المشترك. تم إعداد مسودة العرض بواسطة روبوت المراسلات، والمطلوب الاتصال بالعميل وحجز موعد اللقاء الفني وإتمام التوقيع.`,
      priority: 'urgent',
      status: 'pending',
      due_date: taskDueDate,
      assigned_to_id: 2, // Sales manager
      client_id: targetClient.id,
      comments: [
        {
          id: `comment-swarm-${Date.now()}`,
          user_name: 'منظومة الروبوتات الذاتية (AI Swarm Core)',
          content: `⚡ إشعار الفريق الافتراضي: تم إنشاء وتعيين هذه المهمة تلقائياً كجزء من دورة المعالجة الشاملة للصفقة. مسودة العرض جاهزة في بريد العميل.`,
          created_at: timestamp
        }
      ],
      created_at: timestamp
    });

    if (escalatorBot) {
      escalatorBot.run_count += 1;
      escalatorBot.last_action_at = timestamp;
      escalatorBot.last_action_ar = `جدول مهمة عاجلة لمتابعة العرض مع "${clientName}" واستدعى المستشار المالي.`;
      escalatorBot.last_action_en = `Scheduled urgent follow-up task for "${clientName}" and notified AI Treasurer.`;
    }

    const collab3: AgentCollaboration = {
      id: `collab-${Date.now()}-3`,
      workflow_id: workflowId,
      step_number: 3,
      from_robot_id: 'robot-task-escalator',
      from_robot_name_ar: 'مدير المتابعة والتنبيهات المجدولة',
      from_robot_name_en: 'AI Task Escalator & Auto-Reminder',
      to_robot_id: 'robot-financial-analyst',
      to_robot_name_ar: 'مركز الذكاء الاصطناعي للاستشارات المالية',
      to_robot_name_en: 'AI Financial Consulting Center',
      message_ar: `@المستشار_المالي تم إدراج مهمة المتابعة العاجلة على التقويم وتعيينها لمدير المبيعات. يرجى تدقيق الشروط المالية والضريبية واحتساب هوامش الربحية للصفقة.`,
      message_en: `@AI_Treasurer High-priority follow-up task scheduled on CRM calendar. Please audit financial terms, tax deductions, and forecast margin profitability.`,
      action_taken_ar: `إنشاء مهمة عمل عاجلة وجدولتها على التقويم وإسنادها لمدير المبيعات`,
      action_taken_en: `Created and assigned urgent calendar follow-up task to sales rep`,
      target_entity: clientName,
      created_at: timestamp
    };
    newCollaborations.push(collab3);

    // --- STEP 4: Financial Analyst Agent ---
    const financialBot = db.ai_robots.find(r => r.type === 'financial_analyst');
    const estimatedValue = targetLead?.expected_revenue || 120000;
    const taxValue = Math.round(estimatedValue * 0.15);
    const netTotal = estimatedValue + taxValue;
    const marginPercent = 38;

    if (financialBot) {
      financialBot.run_count += 1;
      financialBot.last_action_at = timestamp;
      financialBot.last_action_ar = `دقق الشروط المالية للصفقة: صافي ${netTotal.toLocaleString()} ر.س مع هامش ربح ${marginPercent}% واستدعى روبوت الاستبقاء.`;
      financialBot.last_action_en = `Audited financials: net ${netTotal.toLocaleString()} SAR with ${marginPercent}% profit margin and signaled Retention Engine.`;
    }

    const collab4: AgentCollaboration = {
      id: `collab-${Date.now()}-4`,
      workflow_id: workflowId,
      step_number: 4,
      from_robot_id: 'robot-financial-analyst',
      from_robot_name_ar: 'مركز الذكاء الاصطناعي للاستشارات المالية',
      from_robot_name_en: 'AI Financial Consulting Center',
      to_robot_id: 'robot-retention-predictor',
      to_robot_name_ar: 'روبوت استبقاء المشتركين وترقيات العقود',
      to_robot_name_en: 'AI Retention & Contract Expansion Engine',
      message_ar: `@حارس_الاستبقاء_والتوسع تم التدقيق المالي بنجاح: القيمة الأساسية ${estimatedValue.toLocaleString()} ر.س + ضريبة (${taxValue.toLocaleString()} ر.س) بإجمالي ${netTotal.toLocaleString()} ر.س وهامش ربح ممتاز ${marginPercent}%. يرجى إدراج الحساب تحت رادار المراقبة وتوقع فرص التوسع.`,
      message_en: `@AI_Retention Financial validation approved: base ${estimatedValue.toLocaleString()} SAR + tax (${taxValue.toLocaleString()} SAR) totalling ${netTotal.toLocaleString()} SAR with ${marginPercent}% margin. Please arm account retention & expansion radar.`,
      action_taken_ar: `تدقيق الحسابات واحتساب ضريبة الـ 15% وتقدير هامش الربحية بنسبة ${marginPercent}%`,
      action_taken_en: `Audited margins, computed 15% tax and projected ${marginPercent}% profit return`,
      target_entity: clientName,
      created_at: timestamp
    };
    newCollaborations.push(collab4);

    // --- STEP 5: Retention & Expansion Engine ---
    const retentionBot = db.ai_robots.find(r => r.type === 'retention_predictor');
    const expansionUpsell = Math.floor(estimatedValue * 0.3); // 30% upsell
    const oppId = db.opportunities.length > 0 ? Math.max(...db.opportunities.map(o => o.id)) + 1 : 1;
    db.opportunities.unshift({
      id: oppId,
      lead_id: targetLead ? targetLead.id : 1,
      title: `صفقة توسعة استباقية وحزم دعم مميز - ${clientName}`,
      stage: 'proposal',
      probability: 85,
      estimated_value: expansionUpsell,
      close_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: timestamp
    });

    if (retentionBot) {
      retentionBot.run_count += 1;
      retentionBot.last_action_at = timestamp;
      retentionBot.last_action_ar = `أدرج صفقة توسعة استباقية بقيمة ${expansionUpsell.toLocaleString()} ر.س وأعلن اكتمال الدورة الشاملة بنجاح.`;
      retentionBot.last_action_en = `Logged future expansion deal valued ${expansionUpsell.toLocaleString()} SAR and finalized full swarm workflow.`;
    }

    const collab5: AgentCollaboration = {
      id: `collab-${Date.now()}-5`,
      workflow_id: workflowId,
      step_number: 5,
      from_robot_id: 'robot-retention-predictor',
      from_robot_name_ar: 'روبوت استبقاء المشتركين وترقيات العقود',
      from_robot_name_en: 'AI Retention & Contract Expansion Engine',
      to_robot_id: 'robot-leads-qualifier',
      to_robot_name_ar: 'مساعد تأهيل صفقات المبيعات',
      to_robot_name_en: 'AI Leads Qualifier Agent',
      message_ar: `🏁 تم اكتمال دورة فريق العمل الذاتي بنجاح فائق! العميل "${clientName}" أصبح مؤهلاً بالكامل، ومسودة العرض في بريده، والمهمة مجدولة على التقويم، والحسابات مدققة، مع تجهيز مسار مبيعات إضافية بقيمة ${expansionUpsell.toLocaleString()} ر.س!`,
      message_en: `🏁 Autonomous Swarm cycle successfully finalized! Client "${clientName}" fully qualified, proposal drafted, follow-up scheduled, financials audited, and ${expansionUpsell.toLocaleString()} SAR expansion opportunity queued!`,
      action_taken_ar: `إنشاء فرصة مبيعات إضافية وتوثيق نجاح دورة الفريق الافتراضي الكاملة`,
      action_taken_en: `Queued expansion deal and closed complete autonomous team pipeline`,
      target_entity: clientName,
      created_at: timestamp
    };
    newCollaborations.push(collab5);

    // Prepend collaborations to the beginning of the list
    db.agent_collaborations.unshift(...newCollaborations);

    // Add Central Notification in System
    const notifId = db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1;
    db.notifications.unshift({
      id: notifId,
      user_id: userId,
      title_ar: `🚀 نجاح دورة فريق الروبوتات المشتركة: ${clientName}`,
      title_en: `🚀 Autonomous AI Swarm Cycle Completed: ${clientName}`,
      content_ar: `أكملت منظومة الروبوتات الـ 5 دورة عمل متكاملة للعميل "${clientName}" شملت: التأهيل الذاتي، صياغة المقترح، جدولة المهمة، التدقيق المالي، وتوقع التوسع المستقبلي.`,
      content_en: `AI Agent Swarm finalized end-to-end management pipeline for "${clientName}": Lead Qualification, Proposal Drafting, Task Scheduling, Financial Audit, and Retention expansion.`,
      type: 'system_event',
      is_read: false,
      created_at: timestamp
    });

    // Activity Log
    this.logActivity(
      userId,
      'create',
      'Client',
      targetClient.id,
      `تشغيل دورة الأتمتة الشاملة لفريق الروبوتات الذاتي للعميل "${clientName}"`,
      `Executed complete autonomous multi-agent swarm workflow for client "${clientName}"`
    );

    this.saveDB(db);

    return {
      success: true,
      workflow_id: workflowId,
      collaborations: newCollaborations,
      all_collaborations: db.agent_collaborations,
      ai_robots: db.ai_robots,
      target_client: clientName
    };
  }
}
