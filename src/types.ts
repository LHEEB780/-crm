/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'super_admin' | 'sales_manager' | 'sales_employee' | 'supervisor' | 'regular_user';

export interface Role {
  id: number;
  name: UserRole;
  display_name_ar: string;
  display_name_en: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role: UserRole;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone: string;
  company_name?: string;
  company_id?: number;
  status: 'new' | 'lead' | 'negotiating' | 'active_client' | 'inactive';
  type: 'individual' | 'corporate';
  address?: string;
  notes?: string;
  manager_id?: number;
  archived_at?: string | null;
  created_at: string;
  avatar?: string;
  emails?: Array<{ id: string; subject: string; body: string; date: string; from: string; folder: string }>;
}

export interface Company {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  logo?: string;
  address?: string;
  created_at: string;
}

export interface CompanyBranch {
  id: number;
  company_id: number;
  name: string;
  city: string;
  address?: string;
  manager_name?: string;
  phone?: string;
  created_at: string;
}

export interface CompanyContact {
  id: number;
  company_id: number;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface Contract {
  id: number;
  company_id: number;
  title: string;
  value: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'under_review' | 'terminated';
  file_path?: string;
  created_at: string;
}

export interface Lead {
  id: number;
  client_id: number;
  source?: string;
  score: number; // 1-100
  status: 'new' | 'contacted' | 'qualified' | 'unqualified';
  expected_revenue: number;
  priority?: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface Opportunity {
  id: number;
  lead_id: number;
  title: string;
  stage: 'discovery' | 'proposal' | 'negociation' | 'win_pending' | 'closed_won' | 'closed_lost';
  probability: number; // 0-100%
  estimated_value: number;
  close_date?: string;
  created_at: string;
}

export interface Deal {
  id: number;
  opportunity_id: number;
  title: string;
  value: number;
  status: 'active' | 'won' | 'lost' | 'paused';
  contract_signed: boolean;
  closed_at?: string;
  created_at: string;
}

export interface Quotation {
  id: number;
  client_id: number;
  subject: string;
  total_amount: number;
  discount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until?: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  client_id: number;
  invoice_number: string;
  total_amount: number;
  tax: number;
  status: 'draft' | 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  due_date: string;
  paid_at?: string;
  created_at: string;
}

export interface TaskComment {
  id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  created_at?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';
  due_date: string;
  assigned_to_id?: number;
  client_id?: number;
  tags?: string[];
  comments?: TaskComment[];
  subtasks?: SubTask[];
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  type: 'task_alert' | 'lead_update' | 'invoice_paid' | 'system_event';
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  user_name?: string;
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'archive' | 'unarchive' | 'export' | 'import';
  target_type?: 'Client' | 'Invoice' | 'Deal' | 'Task' | 'Company' | 'Contract' | 'Quotation' | 'User';
  target_id?: number;
  description_ar: string;
  description_en: string;
  ip_address?: string;
  created_at: string;
}

export interface SystemSettings {
  company_name_ar: string;
  company_name_en: string;
  address_ar: string;
  address_en: string;
  email: string;
  phone: string;
  tax_rate: number;
  currency_ar: string;
  currency_en: string;
  primary_color: string;
  secondary_color: string;
  mail_driver: string;
  mail_host: string;
  mail_port: number;
  mail_username: string;
  mail_encryption: string;
  backup_interval: string;
  logo_url?: string;
}

export interface BilingualTranslation {
  [key: string]: {
    ar: string;
    en: string;
  };
}

export interface AgentCollaboration {
  id: string;
  workflow_id: string;
  step_number: number;
  from_robot_id: string;
  from_robot_name_ar: string;
  from_robot_name_en: string;
  to_robot_id: string;
  to_robot_name_ar: string;
  to_robot_name_en: string;
  message_ar: string;
  message_en: string;
  action_taken_ar: string;
  action_taken_en: string;
  target_entity?: string;
  created_at: string;
}

export interface AIRobot {
  id: string;
  name_ar: string;
  name_en: string;
  role_description_ar: string;
  role_description_en: string;
  avatar: string;
  enabled: boolean;
  type: 'leads_qualifier' | 'task_escalator' | 'email_writer' | 'financial_analyst' | 'sentiment_analyzer' | 'retention_predictor';
  last_action_ar?: string;
  last_action_en?: string;
  last_action_at?: string;
  run_count: number;
  schedule_enabled?: boolean;
  schedule_start?: string;
  schedule_end?: string;
  schedule_days?: number[];
  auto_handoff_enabled?: boolean;
}
