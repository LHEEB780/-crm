/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BilingualTranslation } from './types';

export const translations: BilingualTranslation = {
  // Navigation
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  clients: { ar: 'إدارة العملاء', en: 'Clients Management' },
  companies: { ar: 'الشركات والشركاء', en: 'Companies & Partners' },
  sales: { ar: 'إدارة المبيعات', en: 'Sales & Deals' },
  tasks: { ar: 'المهام والتكليفات', en: 'Tasks Manager' },
  calendar: { ar: 'التقويم والأجندة', en: 'Calendar & Agenda' },
  rbac: { ar: 'الصلاحيات والمستخدمين', en: 'RBAC Roles' },
  reports: { ar: 'التقارير والإحصاءات', en: 'Reports & Analytics' },
  settings: { ar: 'إعدادات النظام', en: 'System Settings' },
  activityLogs: { ar: 'سجل سجل العمليات', en: 'Activity Logs' },

  // Header / Session
  activeUser: { ar: 'المستخدم النشط:', en: 'Active Session:' },
  switchRole: { ar: 'تبديل الصلاحية للمحاكاة:', en: 'Simulation Role Toggle:' },
  notifications: { ar: 'الإشعارات والتنبيهات', en: 'Notifications & Alerts' },
  markRead: { ar: 'تحديد كمقروء', en: 'Mark read' },
  noNotifications: { ar: 'لا توجد تنبيهات جديدة حالياً', en: 'No new notifications' },
  backupDownload: { ar: 'تحميل SQL Backup المباشر', en: 'Download MySQL script' },

  // Dashboard Page
  statsClients: { ar: 'إجمالي العملاء', en: 'Total Clients' },
  statsLeads: { ar: 'العملاء المحتملين', en: 'Active Leads' },
  statsPaid: { ar: 'المبيعات المحصلة', en: 'Paid Revenue' },
  statsPending: { ar: 'المستحقات المعلقة', en: 'Pending Collection' },
  statsTasks: { ar: 'المهام النشطة', en: 'Active Tasks' },
  statsUrgent: { ar: 'المهام العاجلة', en: 'Urgent Tasks' },
  salesFunnel: { ar: 'مراحل قمع المبيعات', en: 'Sales Funnel Stages' },
  recentAdded: { ar: 'العملاء المضافين حديثاً', en: 'Recently Registered Clients' },
  recentLogs: { ar: 'آخر العمليات في النظام', en: 'Recent Activities' },
  goalProgress: { ar: 'نسبة تحقيق مبيعات الربع الحالي', en: 'Q2 Sales Target Accomplishment' },
  quickActions: { ar: 'إجراءات سريعة ومختصرة', en: 'Quick Utility Actions' },

  // Clients Page
  addClient: { ar: 'إضافة عميل جديد', en: 'Add New Client' },
  editClient: { ar: 'تعديل بيانات العميل', en: 'Edit Client Parameters' },
  searchClients: { ar: 'بحث عميق في العملاء بالاسم، الإيميل أو الجوال...', en: 'Deep search by name, email or phone...' },
  clientName: { ar: 'اسم العميل', en: 'Client Name' },
  clientEmail: { ar: 'البريد الإلكتروني', en: 'Email Address' },
  clientPhone: { ar: 'رقم الجوال', en: 'Mobile Number' },
  companyName: { ar: 'اسم المنشأة/الشركة', en: 'Company Name' },
  status: { ar: 'حالة العميل', en: 'Client Status' },
  type: { ar: 'نوع العميل', en: 'Client Type' },
  individual: { ar: 'فرد', en: 'Individual' },
  corporate: { ar: 'منشأة/شركة', en: 'Corporate' },
  address: { ar: 'العنوان الجغرافي', en: 'Location Address' },
  notes: { ar: 'ملاحظات إضافية', en: 'Operational Notes' },
  actions: { ar: 'خيارات التحكم', en: 'Action controls' },
  archive: { ar: 'أرشفة العميل', en: 'Archive' },
  unarchive: { ar: 'إلغاء الأرشفة', en: 'Restore' },
  importExcel: { ar: 'استيراد من إكسل', en: 'Import Excel Sheet' },
  exportExcel: { ar: 'تصدير إكسل / CSV', en: 'Export Sheet' },
  uploadAttachments: { ar: 'المرفقات والسجلات', en: 'Attachments logs' },
  dragDrop: { ar: 'اسحب وأفلت الملفات هنا أو اضغط للاختيار', en: 'Drag & Drop sheet files here, or click to upload' },

  // Statuses
  status_new: { ar: 'عميل جديد', en: 'New Lead' },
  status_lead: { ar: 'مهتم/مستهدف', en: 'Qualified Lead' },
  status_negotiating: { ar: 'قيد التفاوض', en: 'Negotiating' },
  status_active_client: { ar: 'عميل نشط', en: 'Active Partner' },
  status_inactive: { ar: 'غير نشط', en: 'Inactive' },

  // Tasks Page
  addTask: { ar: 'إنشاء مهمة جديدة', en: 'Create New Task' },
  searchTasks: { ar: 'البحث عن مهمة بالعنوان أو اسم المكلف...', en: 'Search tasks by title or assignee...' },
  taskTitle: { ar: 'عنوان المهمة', en: 'Task Title' },
  assignee: { ar: 'الموظف المسؤول', en: 'Assigned Officer' },
  priority: { ar: 'مستوى الأهمية', en: 'Task Priority' },
  dueDate: { ar: 'تاريخ ووقت الاستحقاق', en: 'Target Due Date' },
  pri_low: { ar: 'منخفض', en: 'Low priority' },
  pri_medium: { ar: 'متوسط', en: 'Medium priority' },
  pri_high: { ar: 'مرتفع', en: 'High priority' },
  pri_urgent: { ar: 'عاجل جداً', en: 'Urgent priority' },
  state_pending: { ar: 'بانتظار البدء', en: 'Pending' },
  state_in_progress: { ar: 'قيد التنفيذ', en: 'In progress' },
  state_completed: { ar: 'مكتملة', en: 'Completed' },
  state_canceled: { ar: 'ملغاة', en: 'Canceled' },
  taskDistribution: { ar: 'توزيع المهام ومؤشرات الأداء', en: 'Task Distribution & Performance' },
  chartByPriority: { ar: 'توزيع حسب الأولوية', en: 'By Priority' },
  chartByStatus: { ar: 'توزيع حسب الحالة', en: 'By Status' },
  stackedView: { ar: 'مدمج (تراكمي)', en: 'Stacked' },
  groupedView: { ar: 'متجاور (منفصل)', en: 'Grouped' },
  toggleChart: { ar: 'المخطط البياني للمهام', en: 'Tasks Chart' },
  completionRate: { ar: 'نسبة الإنجاز', en: 'Completion Rate' },
  activeTasks: { ar: 'المهام الجارية', en: 'Active Tasks' },
  urgentTasks: { ar: 'مهام عاجلة', en: 'Urgent Tasks' },
  boardGroupBy: { ar: 'طريقة تنظيم الأعمدة:', en: 'Columns Organization:' },
  byStatusColumns: { ar: 'أعمدة الحالات (To Do / In Progress / Done)', en: 'Status Columns (To Do / In Progress / Done)' },
  byPriorityColumns: { ar: 'أعمدة الأولوية', en: 'Priority Columns' },
  dragStatusHint: { ar: 'اسحب المهمة وأفلتها في العمود المطلوب لنقلها فورياً (مثلاً: من To Do إلى In Progress أو Done)', en: 'Drag and drop tasks between columns to update status instantly (e.g. To Do → In Progress → Done)' },
  col_todo: { ar: 'قيد الانتظار (To Do)', en: 'To Do' },
  col_in_progress: { ar: 'قيد التنفيذ (In Progress)', en: 'In Progress' },
  col_completed: { ar: 'مكتملة (Done)', en: 'Done' },
  col_canceled: { ar: 'ملغاة (Canceled)', en: 'Canceled' },
  subtasks: { ar: 'المهام الفرعية', en: 'Subtasks' },
  checklist: { ar: 'قائمة التدقيق', en: 'Checklist' },
  addSubtask: { ar: 'إضافة مهمة فرعية', en: 'Add subtask' },
  subtaskPlaceholder: { ar: 'اكتب مهمة فرعية واضغط Enter...', en: 'Add subtask and press Enter...' },
  noSubtasks: { ar: 'لا توجد مهام فرعية مضافة بعد', en: 'No subtasks added yet' },
  subtasksCompleted: { ar: 'تم إنجاز', en: 'Completed' },
  allSubtasksCompleted: { ar: 'اكتملت جميع المهام الفرعية ✨', en: 'All subtasks completed ✨' },
  deleteSubtask: { ar: 'حذف المهمة الفرعية', en: 'Delete subtask' },
  subtaskProgress: { ar: 'نسبة تقدم المهام الفرعية', en: 'Subtasks progress' },

  // Sales View
  pipeline: { ar: 'قمع مراحل المبيعات الفائقة', en: 'Hyper CRM Sales Pipeline' },
  leadsList: { ar: 'قائمة العملاء المحتملين والمهتمين', en: 'Leads List' },
  opportunities: { ar: 'الفرص المبيعية والمفاوضات', en: 'Sales Opportunities' },
  dealsList: { ar: 'الصفقات الجارية وعقود الشراء', en: 'Deals & Agreements' },
  quotations: { ar: 'عروض الأسعار الصادرة', en: 'Quotations Center' },
  invoices: { ar: 'الفواتير وإشعار السداد', en: 'Invoices & Ledger' },
  invNumber: { ar: 'رقم الفاتورة', en: 'Invoice Number' },
  dueDatetime: { ar: 'تاريخ الاستحقاق', en: 'Payment Due Date' },
  totalAmt: { ar: 'المبلغ الإجمالي', en: 'Statement Amount' },
  paidState: { ar: 'الحالة', en: 'Ledger Status' },

  // RBAC View
  rbacTitle: { ar: 'صلاحيات وممثلي أدوار النظام CRM', en: 'Matrix of system rules and roles' },
  rolePower: { ar: 'صلاحيات الدور المختار', en: 'Current Role Capability Matrix' },
  role_super_admin: { ar: 'مدير النظام الفائق', en: 'Super Administrator' },
  role_sales_manager: { ar: 'مدير المبيعات', en: 'Sales Director' },
  role_sales_employee: { ar: 'موظف مبيعات', en: 'Sales Clerk / Rep' },
  role_supervisor: { ar: 'المشرف العام', en: 'Coordinator / Supervisor' },
  role_regular_user: { ar: 'مستخدم اعتيادي', en: 'Regular System Guest' },

  // Companies & Branches
  branchesList: { ar: 'الفروع التشغيلية التابعة', en: 'Operating Subsidiaries' },
  contactsList: { ar: 'جهات الاتصال والمشتريات', en: 'Procurement Contacts' },
  contractsTitle: { ar: 'العقود والاتفاقيات المبرمة', en: 'Contracts & Executed Deals' },
  addContract: { ar: 'تسجيل عقد توريد جديد', en: 'Register Supplied Contract' },
  addCompany: { ar: 'إضافة شركة أو شريك', en: 'Register Partner Company' },

  // Settings
  compInfo: { ar: 'بيانات الشركة واللوجو والهوية', en: 'Corporate Metadata & Branding' },
  logoSettings: { ar: 'شعار وهوية النظام', en: 'Branding Logo Settings' },
  smtpConfig: { ar: 'إعدادات خادم البريد وتحتوي المذكور SMTP', en: 'SMPT Notification Server Credentials' },
  sqlCenter: { ar: 'مركز النسخ الاحتياطي وحفظ البيانات', en: 'Data Disaster Recovery & Script Backups' },
  backupBtn: { ar: 'تنزيل نسخة احتياطية SQL كاملة', en: 'Download Production SQL Database Seed' },

  // AI Robots
  ai_robots: { ar: 'مكتبة الروبوتات الذكية', en: 'AI Robots Library' },
  ai_robots_desc: { ar: 'إدارة وتفعيل روبوتات المساعدة الذكية البرمجية لتسريع المهام اليومية وأتمتة عمليات المبيعات، المهام والتحصيلات في الخلفية.', en: 'Manage, activate and execute automated software agents to run sales triage, task escalation, copy drafts, and invoices ledger analysis.' },
  ai_robots_status: { ar: 'حالة الروبوت التلقائية', en: 'Agent Active State' },
  ai_robots_toggle: { ar: 'إيقاف/تفعيل الروبوت', en: 'Toggle Agent Operation' },
  ai_robots_run_manual: { ar: 'إطلاق تشغيل يدوي فوري', en: 'Trigger Manual Action' },
  ai_robots_runs_log: { ar: 'القرار أو الأثر الأخير للروبوت:', en: 'Last Automated Agent Action:' },
  ai_robots_run_count: { ar: 'إجمالي دورات العمل', en: 'Total Cycles Run' },
  ai_robots_enabled: { ar: 'نشط (يعمل بالخلفية)', en: 'On (Listening)' },
  ai_robots_disabled: { ar: 'مبند (موقوف مؤقتاً)', en: 'Off (Dormant)' }
};
