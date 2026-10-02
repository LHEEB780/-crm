/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Play, ToggleLeft, ToggleRight, CheckCircle, AlertTriangle, 
  ShieldCheck, Activity, Cpu, Clock, Calendar, ChevronDown, ChevronUp, 
  Save, AlertCircle, Bell, TrendingUp, Users, Workflow, ArrowRight, 
  ArrowLeft, Send, Check, Layers, Bot, Zap, Share2, RefreshCw, 
  FileText, DollarSign, CheckCircle2, MessageSquare, Trash2, Shield, Eye
} from 'lucide-react';
import { AIRobot, AgentCollaboration } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface AIRobotsViewProps {
  language: 'ar' | 'en';
  onRefreshData?: () => void;
}

export default function AIRobotsView({ language, onRefreshData }: AIRobotsViewProps) {
  const [robots, setRobots] = useState<AIRobot[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [collaborations, setCollaborations] = useState<AgentCollaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [showForceBtnId, setShowForceBtnId] = useState<string | null>(null);

  // Tab state: 'swarm' (Autonomous Team) | 'robots' (Individual) | 'telemetry' (Analytics & Logs)
  const [activeTab, setActiveTab] = useState<'swarm' | 'robots' | 'telemetry'>('swarm');

  // Multi-agent Pipeline States
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [activePipelineStep, setActivePipelineStep] = useState(0);
  const [pipelineSummary, setPipelineSummary] = useState<any | null>(null);

  // Scheduling states
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleStart, setScheduleStart] = useState('09:00');
  const [scheduleEnd, setScheduleEnd] = useState('17:00');
  const [scheduleDays, setScheduleDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [savingScheduleId, setSavingScheduleId] = useState<string | null>(null);

  const isRtl = language === 'ar';

  const fetchRobots = async () => {
    try {
      const res = await fetch('/api/ai-robots');
      if (res.ok) {
        const data = await res.json();
        setRobots(data);
      }
      const logsRes = await fetch('/api/logs');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
    } catch (e) {
      console.error('Failed to load AI Robots or logs', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborations = async () => {
    try {
      const res = await fetch('/api/ai-robots/pipeline/collaborations');
      if (res.ok) {
        const data = await res.json();
        setCollaborations(data);
      }
    } catch (e) {
      console.error('Failed to load collaborations', e);
    }
  };

  useEffect(() => {
    fetchRobots();
    fetchCollaborations();
  }, []);

  const handleToggle = async (robotId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/ai-robots/${robotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setRobots(prev => prev.map(r => r.id === robotId ? updated : r));
        
        const successText = isRtl 
          ? `تم تحديث حالة الروبوت: ${updated.name_ar}` 
          : `Robot state toggled for ${updated.name_en}`;
        setMessage({ text: successText, isError: false });
        setTimeout(() => setMessage(null), 3000);

        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      console.error('Failed to toggle robot state', e);
    }
  };

  const handleOpenSchedule = (robot: AIRobot) => {
    if (editingScheduleId === robot.id) {
      setEditingScheduleId(null);
    } else {
      setEditingScheduleId(robot.id);
      setScheduleEnabled(robot.schedule_enabled ?? false);
      setScheduleStart(robot.schedule_start ?? '09:00');
      setScheduleEnd(robot.schedule_end ?? '17:00');
      setScheduleDays(robot.schedule_days ?? [1, 2, 3, 4, 5]);
    }
  };

  const handleSaveSchedule = async (robotId: string) => {
    setSavingScheduleId(robotId);
    try {
      const res = await fetch(`/api/ai-robots/${robotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_enabled: scheduleEnabled,
          schedule_start: scheduleStart,
          schedule_end: scheduleEnd,
          schedule_days: scheduleDays
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setRobots(prev => prev.map(r => r.id === robotId ? updated : r));
        setEditingScheduleId(null);
        
        const successText = isRtl 
          ? 'تم حفظ تفضيلات الجدولة الزمنية للروبوت بنجاح!' 
          : 'AI Robot scheduling parameters updated successfully!';
        setMessage({ text: successText, isError: false });
        setTimeout(() => setMessage(null), 4000);
        
        if (onRefreshData) onRefreshData();
      } else {
        setMessage({
          text: isRtl ? 'فشل تعديل تفضيلات الجدولة.' : 'Failed to update schedule preferences.',
          isError: true
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingScheduleId(null);
    }
  };

  const handleTriggerRun = async (robotId: string, force = false) => {
    setRunningId(robotId);
    setMessage(null);
    if (!force) {
      setShowForceBtnId(null);
    }
    try {
      const res = await fetch(`/api/ai-robots/${robotId}/trigger${force ? '?force=true' : ''}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.error_ar || data.error_en) {
        setMessage({
          text: isRtl ? data.error_ar : data.error_en,
          isError: true
        });
        if (data.isScheduledOut) {
          setShowForceBtnId(robotId);
        }
      } else {
        setShowForceBtnId(null);
        await fetchRobots();
        
        const finalRobots = data.ai_robots || [];
        const targetRobot = finalRobots.find((r: any) => r.id === robotId);
        const msgText = targetRobot 
          ? (isRtl ? targetRobot.last_action_ar : targetRobot.last_action_en)
          : (isRtl ? 'تم تشغيل الروبوت بنجاح.' : 'Robot executed successfully.');
          
        setMessage({
          text: `🤖 ${msgText}`,
          isError: false
        });

        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      console.error('Failed to execute robot triggering', e);
      setMessage({
        text: isRtl ? 'حدث خطأ أثناء محاولة إطلاق الروبوت.' : 'An error occurred during robot dispatch.',
        isError: true
      });
    } finally {
      setRunningId(null);
    }
  };

  // Run the full autonomous multi-agent pipeline
  const handleRunSwarmPipeline = async () => {
    setIsPipelineRunning(true);
    setActivePipelineStep(1);
    setPipelineSummary(null);

    // Progressive step simulation for visual feedback
    const stepTimer = setInterval(() => {
      setActivePipelineStep(prev => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 650);

    try {
      const res = await fetch('/api/ai-robots/pipeline/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true })
      });
      const data = await res.json();

      clearInterval(stepTimer);
      setActivePipelineStep(5);

      if (data.success) {
        await fetchRobots();
        await fetchCollaborations();
        setPipelineSummary(data);

        setMessage({
          text: isRtl 
            ? `🚀 اكتملت دورة فريق العمل الذاتي بنجاح تام للعميل "${data.target_client}"! تم تأهيل العميل، صياغة المقترح، جدولة المهمة، والتدقيق المالي.` 
            : `🚀 Autonomous Swarm pipeline successfully finalized for client "${data.target_client}"!`,
          isError: false
        });

        if (onRefreshData) onRefreshData();
      } else {
        setMessage({
          text: isRtl ? 'تعذر تشغيل دورة العمل التفاعلية.' : 'Failed to execute autonomous swarm pipeline.',
          isError: true
        });
      }
    } catch (e) {
      clearInterval(stepTimer);
      console.error(e);
      setMessage({
        text: isRtl ? 'حدث خطأ أثناء تشغيل دورة العمل التفاعلية.' : 'Error executing swarm pipeline.',
        isError: true
      });
    } finally {
      setTimeout(() => {
        setIsPipelineRunning(false);
        setActivePipelineStep(0);
      }, 1000);
    }
  };

  const handleClearCollaborations = async () => {
    try {
      const res = await fetch('/api/ai-robots/pipeline/clear', { method: 'POST' });
      if (res.ok) {
        setCollaborations([]);
        setMessage({
          text: isRtl ? 'تم تفريغ سجل تخاطب الروبوتات بنجاح.' : 'Agent collaboration logs cleared.',
          isError: false
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const t = (key: string) => {
    const translations: Record<string, { ar: string; en: string }> = {
      title: { ar: 'مكتبة ومستودع روبوتات الذكاء الاصطناعي', en: 'AI Autonomous Robots Registry' },
      intro: { ar: 'منظومة وكلاء مستقلين وأوتوماتونات ذكية تعمل كفريق عمل متكامل لإدارة الـ CRM: تأهيل المبيعات، صياغة المراسلات، تصعيد المهام، التدقيق المالي، واستبقاء العملاء.', en: 'Autonomous multi-agent system operating as an integrated professional workforce to manage the CRM: sales qualification, contract drafting, task escalation, financial audits, and client retention.' },
      tabSwarm: { ar: 'فريق العمل الذاتي المتكامل (Swarm)', en: 'Autonomous Team Swarm' },
      tabRobots: { ar: 'مستودع الروبوتات الفردية', en: 'Individual Agents Registry' },
      tabTelemetry: { ar: 'سجل الرقابة والتحليلات', en: 'Telemetry & Analytics' },
      status: { ar: 'حالة التشغيل الآلي', en: 'Automation Status' },
      cycles: { ar: 'دورات التشغيل الكلية', en: 'Workflow Cycles Executed' },
      lastAction: { ar: 'تأثير أو نتيجة آخر تشغيل:', en: 'Last execution result/impact:' },
      manualTrigger: { ar: 'تشغيل يدوي فوري', en: 'Trigger Manual Run' },
      robotEnabled: { ar: 'نشط ويعمل بانتظام', en: 'Running on schedule' },
      robotDisabled: { ar: 'معطل / موقوف حالياً', en: 'Dormant (Deactivated)' },
      toggleBtn: { ar: 'تغيير حالة التشغيل', en: 'Toggle Operation State' },
      simulationNotice: { ar: '💡 عند تشغيل أي دورة، يتواصل الوكلاء تلقائياً عبر إشارات @mention لتبادل المهام، ويقومون بتعديل قاعدة البيانات الحقيقية (تأهيل الصفقات، إنشاء المهام على التقويم، وصياغة المسودات).', en: '💡 When triggering a swarm cycle, agents communicate autonomously via @mentions to hand off tasks, mutating the real CRM database (qualifying leads, scheduling calendar tasks, drafting SLA agreements).' }
    };
    return translations[key]?.[language] || key;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <div className="w-10 h-10 border-4 border-[#FF6500] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-500 font-mono">Loading System Robot Core...</span>
      </div>
    );
  }

  // Filter logs completed by AI Robots
  const robotLogs = logs.filter(log => {
    return log.ip_address === '127.0.0.1 (Robot Core)' || log.user_id >= 100;
  });

  const robotLogsLast24h = robotLogs.filter(log => {
    if (!log.created_at) return false;
    const createdAt = new Date(log.created_at);
    const past24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return createdAt >= past24Hours;
  });

  const totalRobotRunsLast24h = robotLogsLast24h.length;

  const chartData = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - index));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const dateLabel = d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });

    const runsCount = robotLogs.filter(log => {
      if (!log.created_at) return false;
      return log.created_at.startsWith(dateKey);
    }).length;

    return {
      dateStr: dateKey,
      name: dateLabel,
      [isRtl ? 'العمليات' : 'Runs']: runsCount,
    };
  });

  const pipelineStages = [
    {
      num: 1,
      name_ar: 'تأهيل الصفقات',
      name_en: 'Lead Qualifier',
      bot_ar: 'مساعد التأهيل',
      bot_en: 'AI Qualifier',
      icon: Users,
      desc_ar: 'فحص جاهزية العميل وحساب النقاط من 100',
      desc_en: 'Scans lead readiness & calculates score /100'
    },
    {
      num: 2,
      name_ar: 'صياغة المراسلات',
      name_en: 'Email & SLA Drafting',
      bot_ar: 'منشئ المراسلات',
      bot_en: 'AI Copywriter',
      icon: FileText,
      desc_ar: 'إنشاء مسودة عرض تقني رسمي ووثيقة SLA',
      desc_en: 'Drafts commercial technical SLA proposal'
    },
    {
      num: 3,
      name_ar: 'تصعيد وجدولة المهمة',
      name_en: 'Task Escalation',
      bot_ar: 'مدير المتابعة',
      bot_en: 'AI Task Escalator',
      icon: Calendar,
      desc_ar: 'حجز موعد الاتصال وتعيين المهمة بالتقويم',
      desc_en: 'Schedules urgent calendar task & alerts team'
    },
    {
      num: 4,
      name_ar: 'التدقيق المالي والضرائب',
      name_en: 'Financial Audit',
      bot_ar: 'المستشار المالي',
      bot_en: 'AI Treasurer',
      icon: DollarSign,
      desc_ar: 'فحص التدفق النقدي، الضريبة، وهوامش الربح',
      desc_en: 'Audits cashflow, 15% tax, and margins'
    },
    {
      num: 5,
      name_ar: 'استبقاء وتوسعة العقود',
      name_en: 'Retention & Expansion',
      bot_ar: 'محرك الاستبقاء',
      bot_en: 'AI Retention',
      icon: TrendingUp,
      desc_ar: 'تفعيل رادار التوسع وإدراج فرصة مبيعات إضافية',
      desc_en: 'Arms expansion radar & logs upsell opportunity'
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Card */}
      <div 
        className="text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden"
        style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cpu className="w-36 h-36" style={{ color: 'var(--brand-secondary, #FF6500)' }} />
        </div>
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-extrabold uppercase tracking-wider"
            style={{ color: 'var(--brand-secondary, #FF6500)' }}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{isRtl ? 'إدارة الـ CRM عبر وكلاء ذكاء اصطناعي مترابطين' : 'Autonomous Multi-Agent CRM Workforce'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{t('title')}</h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{t('intro')}</p>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('swarm')}
          style={activeTab === 'swarm' ? { backgroundColor: 'var(--brand-primary, #0B192C)', color: '#ffffff' } : undefined}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'swarm'
              ? 'text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Workflow className="w-4 h-4" style={{ color: 'var(--brand-secondary, #FF6500)' }} />
          <span>{t('tabSwarm')}</span>
          <span 
            style={activeTab === 'swarm' ? { backgroundColor: 'var(--brand-secondary, #FF6500)', color: '#ffffff' } : undefined}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'swarm' ? 'text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isRtl ? '5 وكلاء مترابطين' : '5 Agents'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('robots')}
          style={activeTab === 'robots' ? { backgroundColor: 'var(--brand-primary, #0B192C)', color: '#ffffff' } : undefined}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'robots'
              ? 'text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bot className="w-4 h-4 text-emerald-400" />
          <span>{t('tabRobots')}</span>
          <span 
            style={activeTab === 'robots' ? { backgroundColor: 'var(--brand-secondary, #FF6500)', color: '#ffffff' } : undefined}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'robots' ? 'text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {robots.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('telemetry')}
          style={activeTab === 'telemetry' ? { backgroundColor: 'var(--brand-primary, #0B192C)', color: '#ffffff' } : undefined}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'telemetry'
              ? 'text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4 text-blue-400" />
          <span>{t('tabTelemetry')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'telemetry' ? 'bg-[#FF6500] text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            24h
          </span>
        </button>
      </div>

      {/* Top Banner Message */}
      {message && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-3 transition-all ${
          message.isError 
            ? 'bg-rose-50 text-rose-800 border-rose-200' 
            : 'bg-emerald-50 text-emerald-850 border-emerald-200'
        }`}>
          <span>{message.isError ? '⚠️' : '🔔'}</span>
          <p className="flex-1 leading-relaxed">{message.text}</p>
          <button 
            onClick={() => setMessage(null)} 
            className="text-[10px] underline cursor-pointer hover:font-bold"
          >
            {isRtl ? 'إغلاق' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: AUTONOMOUS TEAM SWARM (حلقة العمل الذاتي المتكامل والتخاطب بين الوكلاء) */}
      {/* ========================================================================= */}
      {activeTab === 'swarm' && (
        <div className="space-y-6">
          {/* Swarm Pipeline Interactive Control Hub */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {isRtl ? 'دورة العمل الذاتي لفريق الروبوتات (Autonomous Swarm Pipeline)' : 'Autonomous Multi-Agent Swarm Pipeline'}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                  {isRtl 
                    ? 'تعمل الروبوتات بتسلسل ذكي متناغم: عند تأهيل العميل، يُستدعى كاتب المراسلات تلقائياً لصياغة المقترح، ثم يتولى مدير المهام جدولته بالتقويم، يليه المستشار المالي لحساب الأرباح والضرائب، وأخيراً محرك الاستبقاء.' 
                    : 'The agents collaborate autonomously in a chain: qualification triggers contract drafting, followed by calendar scheduling, financial margin auditing, and retention radar activation.'}
                </p>
              </div>

              {/* Master Run Swarm Button */}
              <button
                type="button"
                disabled={isPipelineRunning}
                onClick={handleRunSwarmPipeline}
                style={!isPipelineRunning ? { backgroundColor: 'var(--brand-secondary, #FF6500)' } : undefined}
                className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 cursor-pointer shadow-md select-none shrink-0 ${
                  isPipelineRunning
                    ? 'bg-slate-100 text-slate-800 border border-slate-300'
                    : 'hover:opacity-90 text-white hover:scale-102 active:scale-98'
                }`}
              >
                {isPipelineRunning ? (
                  <>
                    <div 
                      className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: 'var(--brand-secondary, #FF6500)', borderTopColor: 'transparent' }}
                    ></div>
                    <span>{isRtl ? `جاري تشغيل المرحلة ${activePipelineStep} من 5...` : `Running Step ${activePipelineStep} of 5...`}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-white animate-bounce" style={{ animationDuration: '2s' }} />
                    <span>{isRtl ? '🚀 إطلاق دورة العمل الشاملة للفريق الافتراضي' : '🚀 Run Autonomous Swarm Pipeline'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Visual Pipeline Flowchart with Connecting Arrows */}
            <div className="py-2 overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 min-w-[700px]">
                {pipelineStages.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isActive = isPipelineRunning && activePipelineStep === stage.num;
                  const isCompleted = isPipelineRunning && activePipelineStep > stage.num;

                  return (
                    <div 
                      key={stage.num}
                      className={`relative p-4 rounded-xl border transition-all duration-300 ${
                        isActive
                          ? 'bg-orange-50 border-[#FF6500] ring-3 ring-[#FF6500]/20 shadow-md scale-102'
                          : isCompleted
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isActive
                            ? 'bg-[#FF6500] text-white shadow-sm'
                            : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700'
                        }`}>
                          {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isActive ? 'bg-[#FF6500]/15 text-[#FF6500]' : 'bg-slate-200/70 text-slate-600'
                        }`}>
                          {isRtl ? `مرحلة ${stage.num}` : `Step ${stage.num}`}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                        {isRtl ? stage.name_ar : stage.name_en}
                      </h4>
                      <p className="text-[10px] font-bold text-[#FF6500] mt-0.5">
                        {isRtl ? stage.bot_ar : stage.bot_en}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                        {isRtl ? stage.desc_ar : stage.desc_en}
                      </p>

                      {/* Connecting Arrow for LTR/RTL */}
                      {idx < pipelineStages.length - 1 && (
                        <div className={`hidden sm:flex absolute top-1/2 -translate-y-1/2 z-10 ${
                          isRtl ? '-left-3' : '-right-3'
                        } w-5 h-5 rounded-full bg-white border border-slate-200 items-center justify-center shadow-2xs text-slate-400`}>
                          {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pipeline Execution Live Result Card */}
            {pipelineSummary && (
              <div className="mt-5 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-850 font-black text-xs sm:text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    {isRtl 
                      ? `تمت الدورة بنجاح: العميل "${pipelineSummary.target_client}" تم إنجاز معاملاته بالكامل عبر 5 وكلاء ذكاء اصطناعي!` 
                      : `Swarm Completed: Client "${pipelineSummary.target_client}" successfully managed across 5 AI agents!`}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-2 border-t border-emerald-200/60 font-sans">
                  <div className="bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-slate-400 text-[10px] block">{isRtl ? 'درجة الجاهزية' : 'Readiness Score'}</span>
                    <span className="font-bold text-emerald-700 font-mono">94% (Qualified)</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-slate-400 text-[10px] block">{isRtl ? 'مسودة العرض' : 'Draft Proposal'}</span>
                    <span className="font-bold text-slate-800">{isRtl ? 'محفوظة في البريد' : 'Saved in drafts'}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-slate-400 text-[10px] block">{isRtl ? 'مهمة التقويم' : 'Calendar Task'}</span>
                    <span className="font-bold text-slate-800">{isRtl ? 'عاجلة (متابعة العقد)' : 'Urgent follow-up'}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-slate-400 text-[10px] block">{isRtl ? 'فرصة المبيعات الإضافية' : 'Upsell Opportunity'}</span>
                    <span className="font-bold text-[#FF6500] font-mono">+36,000 ر.س</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inter-Agent Collaboration Feed (غرفة التخاطب والتنسيق الحي بين البوتات) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100/70 border border-orange-200 flex items-center justify-center text-[#FF6500]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900">
                    {isRtl ? 'سجل تخاطب الروبوتات المباشر (Inter-Agent Communication Stream)' : 'Inter-Agent Real-time Collaboration Feed'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isRtl ? 'شاهد كيف تستدعي الروبوتات بعضها عبر إشارات @mention لتبادل الصفقات والمهام في الوقت الفعلي' : 'Live multi-agent coordination messages with @mentions and task handoffs'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchCollaborations}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isRtl ? 'تحديث' : 'Refresh'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearCollaborations}
                  className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'مسح السجل' : 'Clear Feed'}</span>
                </button>
              </div>
            </div>

            {/* Collaboration Stream List */}
            {collaborations.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Workflow className="w-10 h-10 mx-auto text-slate-300 opacity-60" />
                <p className="text-xs font-bold">
                  {isRtl ? 'لا توجد رسائل تخاطب حالياً. اضغط على "إطلاق دورة العمل الشاملة" لتشغيل الفريق!' : 'No collaboration logs yet. Click "Run Swarm Pipeline" to initiate agent teamwork!'}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                {collaborations.map((collab) => {
                  const messageText = isRtl ? collab.message_ar : collab.message_en;
                  const actionText = isRtl ? collab.action_taken_ar : collab.action_taken_en;

                  return (
                    <div 
                      key={collab.id}
                      className="p-4 rounded-xl border border-slate-150 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2.5"
                    >
                      {/* Top Meta Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-[#FF6500] font-black text-[10px] flex items-center justify-center shrink-0">
                            🤖
                          </span>
                          <span className="font-black text-slate-900">
                            {isRtl ? collab.from_robot_name_ar : collab.from_robot_name_en}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {isRtl ? 'خاطب' : 'addressed'}
                          </span>
                          <span className="font-bold text-[#FF6500] bg-orange-100/70 border border-orange-200 px-2 py-0.5 rounded-full text-[10px] font-mono">
                            @{isRtl ? collab.to_robot_name_ar : collab.to_robot_name_en}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          {collab.target_entity && (
                            <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-bold">
                              {isRtl ? `الهدف: ${collab.target_entity}` : `Target: ${collab.target_entity}`}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(collab.created_at).toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Message Content Bubble */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans shadow-2xs">
                        <p>{messageText}</p>
                      </div>

                      {/* Action Tag Pill */}
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          {isRtl ? 'الإجراء المنفذ:' : 'ACTION COMMITTED:'}
                        </span>
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{actionText}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INDIVIDUAL ROBOT CONTROLS & SCHEDULES (مستودع الروبوتات الفردية والجدولة) */}
      {/* ========================================================================= */}
      {activeTab === 'robots' && (
        <div className="space-y-6">
          <div className="p-4 bg-orange-50/75 border border-orange-200/65 rounded-xl text-xs text-slate-700 leading-relaxed font-sans shadow-2xs">
            {t('simulationNotice')}
          </div>

          {/* Alert System Status ribbon */}
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans shadow-3xs">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-orange-100/70 border border-orange-200/50 flex items-center justify-center text-[#FF6500] shrink-0">
                <Bell className="w-5 h-5 text-[#FF6500] animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <div className="space-y-0.75">
                <h4 className="font-extrabold text-slate-800">
                  {isRtl ? 'منظومة تنبيهات الأتمتة والعمليات النشطة (CRM Intelligent Guards)' : 'Automated Robotic Alert System is Active'}
                </h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {isRtl 
                    ? 'تقوم الروبوتات حالياً برصد كافة الدورات والعمليات المستقلة بذكاء. في حال إكمال مهمة حرجة أو إطلاق إخطار فشل، يتم تلقائياً ترحيل تنبيه مركزي إلى مركز إشعارات الـ CRM.' 
                    : 'Each autonomous agent is monitored. Whenever a robot completes a high-priority task successfully OR encounters processing errors, instant alerts are published to the CRM notification center.'}
                </p>
              </div>
            </div>
          </div>

          {/* Robots Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {robots.map((robot) => {
              const isEnabled = robot.enabled;
              const isRunning = runningId === robot.id;
              return (
                <div 
                  key={robot.id} 
                  className={`bg-white rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between gap-5 relative hover:shadow-md ${
                    isEnabled 
                      ? 'border-slate-200 ring-2 ring-emerald-500/10' 
                      : 'border-slate-200 opacity-80'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Avatar, Name, Status Badge */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center">
                          {robot.avatar ? (
                            <img src={robot.avatar} alt={robot.name_en} className="w-full h-full object-cover" />
                          ) : (
                            <Bot className="w-6 h-6 text-[#FF6500]" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-slate-900 leading-tight">
                            {isRtl ? robot.name_ar : robot.name_en}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: {robot.id}
                          </span>
                        </div>
                      </div>

                      {/* Status pill */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                        isEnabled 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span>{isEnabled ? t('robotEnabled') : t('robotDisabled')}</span>
                      </span>
                    </div>

                    {/* Role Description */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isRtl ? robot.role_description_ar : robot.role_description_en}
                    </p>

                    {/* Statistics Row */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">{t('cycles')}</span>
                        <span className="font-black text-slate-900 font-mono text-sm">{robot.run_count}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">{isRtl ? 'آخر تشغيل' : 'Last Active'}</span>
                        <span className="font-bold text-slate-700 text-[10px] font-mono">
                          {robot.last_action_at 
                            ? new Date(robot.last_action_at).toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Last Action result banner */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-[11px] text-slate-600 space-y-1">
                      <span className="font-bold text-slate-800 block text-[10px] text-[#FF6500]">
                        {t('lastAction')}
                      </span>
                      <p className="leading-snug">
                        {isRtl ? (robot.last_action_ar || 'بانتظار دورة التشغيل الأولى.') : (robot.last_action_en || 'Standing by for initial workflow cycle.')}
                      </p>
                    </div>

                    {/* Scheduling Accordion Panel */}
                    {editingScheduleId === robot.id && (
                      <div className="p-4 bg-orange-50/50 border border-orange-200/80 rounded-xl space-y-3 text-xs font-sans">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-800 text-[11px] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#FF6500]" />
                            {isRtl ? 'تخصيص نافذة ساعات العمل الآلي' : 'Autonomous Schedule Window'}
                          </span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold">
                            <input 
                              type="checkbox" 
                              checked={scheduleEnabled} 
                              onChange={(e) => setScheduleEnabled(e.target.checked)}
                              className="accent-[#FF6500] w-3.5 h-3.5 rounded"
                            />
                            <span>{isRtl ? 'تفعيل تقييد التوقيت' : 'Enforce window'}</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">{isRtl ? 'ساعة البدء' : 'Start Time'}</label>
                            <input 
                              type="time" 
                              value={scheduleStart} 
                              onChange={(e) => setScheduleStart(e.target.value)}
                              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">{isRtl ? 'ساعة الانتهاء' : 'End Time'}</label>
                            <input 
                              type="time" 
                              value={scheduleEnd} 
                              onChange={(e) => setScheduleEnd(e.target.value)}
                              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white"
                            />
                          </div>
                        </div>

                        {/* Days of week */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold block">{isRtl ? 'أيام التشغيل' : 'Active Days'}</span>
                          <div className="flex flex-wrap gap-1">
                            {[
                              { value: 0, label_ar: 'الأحد', label_en: 'Sun' },
                              { value: 1, label_ar: 'الاثنين', label_en: 'Mon' },
                              { value: 2, label_ar: 'الثلاثاء', label_en: 'Tue' },
                              { value: 3, label_ar: 'الأربعاء', label_en: 'Wed' },
                              { value: 4, label_ar: 'الخميس', label_en: 'Thu' },
                              { value: 5, label_ar: 'الجمعة', label_en: 'Fri' },
                              { value: 6, label_ar: 'السبت', label_en: 'Sat' },
                            ].map((dayObj) => {
                              const isSelected = scheduleDays.includes(dayObj.value);
                              return (
                                <button
                                  type="button"
                                  key={dayObj.value}
                                  onClick={() => {
                                    if (isSelected) {
                                      setScheduleDays(prev => prev.filter(d => d !== dayObj.value));
                                    } else {
                                      setScheduleDays(prev => [...prev, dayObj.value].sort());
                                    }
                                  }}
                                  className={`px-2 py-1 text-[9px] font-bold rounded-md border transition-all cursor-pointer ${
                                    isSelected 
                                      ? 'bg-[#FF6500]/10 text-[#FF6500] border-[#FF6500]/35' 
                                      : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {isRtl ? dayObj.label_ar : dayObj.label_en}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => setEditingScheduleId(null)}
                            className="px-2.5 py-1 text-[10px] text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-md cursor-pointer font-bold"
                          >
                            {isRtl ? 'إلغاء' : 'Cancel'}
                          </button>
                          <button
                            type="button"
                            disabled={savingScheduleId === robot.id || (scheduleEnabled && scheduleDays.length === 0)}
                            onClick={() => handleSaveSchedule(robot.id)}
                            className="px-3 py-1 text-[10px] bg-[#FF6500] hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-md flex items-center gap-1 cursor-pointer font-bold transition-all shadow-3xs"
                          >
                            {savingScheduleId === robot.id ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                            <span>{isRtl ? 'حفظ الجدولة' : 'Save'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Forced manual run warning trigger for active calendar locks */}
                    {showForceBtnId === robot.id && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 text-xs font-sans">
                        <div className="flex items-start gap-1.5 text-red-800 font-extrabold text-[10px]">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <span>{isRtl ? 'تنبيه: قفل الجدول مفعل حالياً' : 'Automated Schedule Lockout Active'}</span>
                        </div>
                        <p className="text-[10px] text-red-600 leading-normal">
                          {isRtl 
                            ? 'هذا الروبوت مبرمج على ألا يعمل خارج ساعات جدوله الزمني. هل تود استخدام صلاحية التخطي لفرض تشغيله الآن؟' 
                            : 'This robot is configured to execute only during its specified calendar windows. Would you like to force override?'}
                        </p>
                        <button
                          type="button"
                          disabled={isRunning}
                          onClick={() => handleTriggerRun(robot.id, true)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-extrabold flex items-center gap-1 cursor-pointer select-none transition-all shadow-2xs"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{isRtl ? 'تجاوز التشغيل القسري' : 'Force Execute Override'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Controls Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggle(robot.id, isEnabled)}
                      className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#FF6500] transition-colors cursor-pointer"
                      title={t('toggleBtn')}
                    >
                      {isEnabled ? (
                        <ToggleRight className="w-7 h-7 text-emerald-500 transition-all" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-400 transition-all" />
                      )}
                      <span className="text-[10px]">{isRtl ? (isEnabled ? 'إيقاف مؤقت' : 'تفعيل') : (isEnabled ? 'Pause' : 'Activate')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenSchedule(robot)}
                      className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
                        editingScheduleId === robot.id 
                          ? 'bg-slate-800 text-white border-slate-800' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-[#FF6500]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'الجدولة' : 'Schedule'}</span>
                      {editingScheduleId === robot.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      disabled={!isEnabled || isRunning}
                      onClick={() => handleTriggerRun(robot.id, false)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all flex items-center gap-1.5 shrink-0 shadow-3xs border cursor-pointer ${
                        isRunning 
                          ? 'bg-orange-100 text-[#FF6500] border-orange-200'
                          : !isEnabled
                            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-55'
                            : 'bg-[#FF6500] text-white hover:bg-orange-600 border-orange-600 hover:scale-102 active:scale-98'
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <div className="w-3 h-3 border-2 border-orange-700 border-t-transparent rounded-full animate-spin"></div>
                          <span>{isRtl ? 'جاري...' : 'Running...'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>{t('manualTrigger')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TELEMETRY & AUDIT (التحليلات ومؤشر النشاط) */}
      {/* ========================================================================= */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Summary Card showing completed automated tasks in the last 24 hours */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden font-sans">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6500] shrink-0">
                  <Activity className="w-7 h-7 text-[#FF6500] animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    {isRtl ? 'الأتمتة والمهام خلال الـ 24 ساعة الماضية' : '24-HOUR AUTOMATION EFFICIENCY'}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-slate-900 tracking-tight font-mono">
                      {totalRobotRunsLast24h}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {isRtl ? 'مهمة مستكملة بنجاح' : 'completed automated runs'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-xl">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-600 leading-normal">
                  <p>
                    {isRtl 
                      ? 'تحتوي هذه اللوحة على ملخص مباشر للنشاط الذاتي المؤتمت لمنظومة الروبوتات الذكية. يتم رصد كافة الأنشطة ودورات المعالجة وحفظها تلقائياً لضمان الشفافية ومراقبة وتأهيل المعاملات.'
                      : 'Live telemetry summarizing current agentic task completions. The system audit logs register every transaction, email dispatch, or client scoring event executed autonomously.'}
                  </p>
                </div>
              </div>

              <div className="border-t lg:border-t-0 lg:border-s border-slate-100 pt-4 lg:pt-0 lg:ps-6 flex flex-col justify-center min-w-[245px]">
                <span className="text-[10px] font-bold text-[#FF6500] uppercase tracking-widest block mb-2.5">
                  {isRtl ? 'المهام حسب الأداة المستقلة' : 'OPERATIONAL DISPATCH COUNT'}
                </span>
                <div className="space-y-2">
                  {robots.map((robot, idx) => {
                    const rLogs = robotLogsLast24h.filter(
                      log => log.user_name === robot.name_en || log.user_id === (100 + idx)
                    );
                    return (
                      <div key={robot.id} className="flex items-center justify-between text-[11px] font-sans">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full ${robot.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          <span className="text-slate-600 font-bold truncate max-w-[150px]">
                            {isRtl ? robot.name_ar : robot.name_en}
                          </span>
                        </div>
                        <span className="font-mono font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px] shrink-0 border border-slate-200">
                          {rLogs.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Trend Chart Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6500]">
                  <TrendingUp className="w-4 h-4 text-[#FF6500]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 leading-tight">
                    {isRtl ? 'مؤشر أداء وسرعة الأتمتة (خلال 7 أيام)' : '7-Day Automation Activity Trend'}
                  </h3>
                  <p className="text-[10px] font-medium text-slate-400">
                    {isRtl ? 'معدل دورات العمل الفردية والمجمعة للنظام' : 'Daily completed automated tasks execution telemetry'}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-48 sm:h-56 w-full -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 15, right: 15, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                    axisLine={{ stroke: '#f1f5f9' }}
                    tickLine={{ stroke: '#f1f5f9' }}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                    axisLine={{ stroke: '#f1f5f9' }}
                    tickLine={{ stroke: '#f1f5f9' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                      fontSize: '11px',
                      fontFamily: 'sans-serif'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={isRtl ? 'العمليات' : 'Runs'}
                    stroke="#FF6500"
                    strokeWidth={2.5}
                    activeDot={{ r: 5, fill: '#FF6500', stroke: '#ffffff', strokeWidth: 1.5 }}
                    dot={{ r: 3.5, strokeWidth: 1.5, fill: '#ffffff', stroke: '#FF6500' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
