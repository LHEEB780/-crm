/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, CheckSquare, Clock, UserCheck, AlertTriangle, 
  Trash2, Sparkles, Filter, CheckCircle, Mic, MicOff, Tag, GripVertical,
  Search, X, BarChart3, Layers, CheckCircle2, ChevronDown, ChevronUp,
  AlertCircle, Activity, Kanban, XCircle, ArrowRight, ArrowLeft,
  ListTodo, Check, Square
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { translations } from '../locales';
import { Task, User, Client, SubTask } from '../types';

interface TasksProps {
  tasks: Task[];
  users: User[];
  clients: Client[];
  activeUser: User | null;
  language: 'ar' | 'en';
  onAddTask: (data: any) => void;
  onUpdateTask: (id: number, data: any) => void;
  onDeleteTask: (id: number) => void;
}

export default function TasksView({
  tasks,
  users,
  clients,
  activeUser,
  language,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}: TasksProps) {
  const t = (key: string) => translations[key]?.[language] || key;
  const isRtl = language === 'ar';

  const [formOpen, setFormOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Analytics Chart State
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [chartDimension, setChartDimension] = useState<'priority' | 'status'>('priority');
  const [chartStacking, setChartStacking] = useState<'stacked' | 'grouped'>('stacked');

  // Subtasks State
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<number, boolean>>({});
  const [subtaskInput, setSubtaskInput] = useState<Record<number, string>>({});
  const [submittingSubtask, setSubmittingSubtask] = useState<Record<number, boolean>>({});

  const handleAddSubtask = async (taskId: number) => {
    const text = subtaskInput[taskId]?.trim();
    if (!text) return;

    setSubmittingSubtask(prev => ({ ...prev, [taskId]: true }));
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: text })
      });
      if (res.ok) {
        const updatedTask = await res.json();
        onUpdateTask(taskId, updatedTask);
        setSubtaskInput(prev => ({ ...prev, [taskId]: '' }));
        setExpandedSubtasks(prev => ({ ...prev, [taskId]: true }));
      } else {
        // Fallback to updating entire task object
        const targetTask = tasks.find(t => t.id === taskId);
        if (targetTask) {
          const newSubtask: SubTask = {
            id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: text,
            completed: false,
            created_at: new Date().toISOString()
          };
          const updatedSubtasks = [...(targetTask.subtasks || []), newSubtask];
          onUpdateTask(taskId, { ...targetTask, subtasks: updatedSubtasks });
          setSubtaskInput(prev => ({ ...prev, [taskId]: '' }));
          setExpandedSubtasks(prev => ({ ...prev, [taskId]: true }));
        }
      }
    } catch (err) {
      console.error('Failed to add subtask:', err);
    } finally {
      setSubmittingSubtask(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleToggleSubtask = async (taskId: number, subtaskId: string, currentCompleted: boolean) => {
    // Optimistic local update
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;
    const updatedSubtasks = (targetTask.subtasks || []).map(st => 
      st.id === subtaskId ? { ...st, completed: !currentCompleted } : st
    );
    onUpdateTask(taskId, { ...targetTask, subtasks: updatedSubtasks });

    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted })
      });
      if (res.ok) {
        const updatedTask = await res.json();
        onUpdateTask(taskId, updatedTask);
      }
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  const handleDeleteSubtask = async (taskId: number, subtaskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;
    const updatedSubtasks = (targetTask.subtasks || []).filter(st => st.id !== subtaskId);
    onUpdateTask(taskId, { ...targetTask, subtasks: updatedSubtasks });

    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const updatedTask = await res.json();
        onUpdateTask(taskId, updatedTask);
      }
    } catch (err) {
      console.error('Failed to delete subtask:', err);
    }
  };

  // Comments State
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [commentInput, setCommentInput] = useState<Record<number, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<number, boolean>>({});

  const handlePostComment = async (taskId: number) => {
    const text = commentInput[taskId] || '';
    if (!text.trim()) return;

    setSubmittingComment(prev => ({ ...prev, [taskId]: true }));
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: activeUser?.name || (isRtl ? 'عضو العمل' : 'Associate'),
          content: text.trim()
        })
      });
      if (res.ok) {
        const updatedTask = await res.json();
        onUpdateTask(taskId, updatedTask);
        setCommentInput(prev => ({ ...prev, [taskId]: '' }));
      }
    } catch (err) {
      console.error('Failed to post task comment:', err);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    assigned_to_id: '',
    client_id: '',
    tags: [] as string[],
    subtasks: [] as Array<{ id: string; title: string; completed: boolean }>
  });
  const [modalSubtaskInput, setModalSubtaskInput] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const handleVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isRtl ? 'المتصفح الحالي لا يدعم ميزة الإدخال الصوتي.' : 'Voice recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      if ((window as any)._activeSpeechRecognition) {
        ((window as any)._activeSpeechRecognition).stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setNewTask(prev => {
            const upToDateTags = prev.tags.includes('Note') ? prev.tags : [...prev.tags, 'Note'];
            return {
              ...prev,
              description: prev.description ? `${prev.description} ${transcript}` : transcript,
              tags: upToDateTags
            };
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setRecordingError(isRtl ? 'تم رفض إذن الوصول للميكروفون' : 'Microphone permission denied.');
        } else if (event.error === 'network') {
          setRecordingError(isRtl 
            ? 'خطأ اتصال بالشبكة: التعرف صوتياً يتطلب الوصول لخوادم اللغة بالمتصفح.' 
            : 'Speech recognition service (network) offline: Web browsers require connection to voice engines.'
          );
        } else {
          setRecordingError(isRtl ? `خطأ في جهاز الصوت: ${event.error}` : `Mic Error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      (window as any)._activeSpeechRecognition = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition exception:', err);
      setRecordingError(err.message || 'Error occurred');
      setIsRecording(false);
    }
  };

  const getAssigneeName = (id?: number) => {
    return users.find(u => u.id === id)?.name || (isRtl ? 'غير معين' : 'Unassigned');
  };

  const getClientName = (id?: number) => {
    return clients.find(c => c.id === id)?.name || '';
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({
      ...newTask,
      assigned_to_id: newTask.assigned_to_id ? Number(newTask.assigned_to_id) : undefined,
      client_id: newTask.client_id ? Number(newTask.client_id) : undefined,
      due_date: new Date(newTask.due_date).toISOString(),
      subtasks: newTask.subtasks
    });
    setNewTask({ title: '', description: '', priority: 'medium', status: 'pending', due_date: '', assigned_to_id: '', client_id: '', tags: [], subtasks: [] });
    setModalSubtaskInput('');
    setFormOpen(false);
  };

  const updateStatus = (id: number, status: any) => {
    onUpdateTask(id, { status });
  };

  // Board Organization State: 'status' (Kanban: To Do / In Progress / Done / Canceled) vs 'priority'
  const [boardGrouping, setBoardGrouping] = useState<'status' | 'priority'>('status');

  // Drag and drop states for tasks kanban columns
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverLane, setDragOverLane] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<number | null>(null);
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<number | null>(null);
  const [localTaskOrder, setLocalTaskOrder] = useState<number[]>([]);

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(id);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverLane(null);
    setDragOverTaskId(null);
  };

  const handleDropOnLane = (e: React.DragEvent, targetColKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedTaskId === null) return;

    const task = tasks.find(t => t.id === draggedTaskId);
    if (!task) return;

    // Update status or priority based on board grouping
    if (boardGrouping === 'status') {
      if (task.status !== targetColKey) {
        onUpdateTask(draggedTaskId, { status: targetColKey });
        setRecentlyMovedTaskId(draggedTaskId);
        setTimeout(() => setRecentlyMovedTaskId(null), 2500);
      }
    } else {
      if (task.priority !== targetColKey) {
        onUpdateTask(draggedTaskId, { priority: targetColKey });
        setRecentlyMovedTaskId(draggedTaskId);
        setTimeout(() => setRecentlyMovedTaskId(null), 2500);
      }
    }

    // Move to end of order in local order subset
    const allTaskIds = tasks.map(t => t.id);
    const orderSubset = [...localTaskOrder];
    allTaskIds.forEach(id => {
      if (!orderSubset.includes(id)) {
        orderSubset.push(id);
      }
    });

    const dragIdx = orderSubset.indexOf(draggedTaskId);
    if (dragIdx > -1) {
      orderSubset.splice(dragIdx, 1);
      orderSubset.push(draggedTaskId);
      setLocalTaskOrder(orderSubset);
    }

    handleDragEnd();
  };

  const handleDropOnTask = (e: React.DragEvent, targetTask: Task) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedTaskId === null || draggedTaskId === targetTask.id) return;

    const task = tasks.find(t => t.id === draggedTaskId);
    if (!task) return;

    // 1. Update status or priority if target is in a different column
    if (boardGrouping === 'status') {
      if (task.status !== targetTask.status) {
        onUpdateTask(draggedTaskId, { status: targetTask.status });
        setRecentlyMovedTaskId(draggedTaskId);
        setTimeout(() => setRecentlyMovedTaskId(null), 2500);
      }
    } else {
      if (task.priority !== targetTask.priority) {
        onUpdateTask(draggedTaskId, { priority: targetTask.priority });
        setRecentlyMovedTaskId(draggedTaskId);
        setTimeout(() => setRecentlyMovedTaskId(null), 2500);
      }
    }

    // 2. Compute new local order subset right next to targetTask
    const allTaskIds = tasks.map(t => t.id);
    const orderSubset = [...localTaskOrder];
    allTaskIds.forEach(id => {
      if (!orderSubset.includes(id)) {
        orderSubset.push(id);
      }
    });

    const dragIdx = orderSubset.indexOf(draggedTaskId);
    const targetIdx = orderSubset.indexOf(targetTask.id);

    if (dragIdx > -1 && targetIdx > -1) {
      const updatedOrder = [...orderSubset];
      updatedOrder.splice(dragIdx, 1);
      const newTargetIdx = updatedOrder.indexOf(targetTask.id);
      updatedOrder.splice(newTargetIdx, 0, draggedTaskId);
      setLocalTaskOrder(updatedOrder);
    }

    handleDragEnd();
  };

  const sortTasks = (a: Task, b: Task) => {
    const idxA = localTaskOrder.indexOf(a.id);
    const idxB = localTaskOrder.indexOf(b.id);
    if (idxA !== -1 && idxB !== -1) {
      return idxA - idxB;
    }
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.id - b.id;
  };

  // Status Columns Configuration (Kanban default: To Do, In Progress, Done, Canceled)
  const statusColumns = [
    {
      key: 'pending',
      title: isRtl ? 'قيد الانتظار (To Do)' : 'To Do',
      stageName: isRtl ? 'بانتظار البدء' : 'To Do',
      badgeColor: 'bg-amber-50 text-amber-800 border border-amber-200',
      laneBg: 'bg-amber-50/20 border-amber-200/70',
      activeRing: 'ring-2 ring-amber-400 border-amber-400 bg-amber-100/40 shadow-md',
      borderAccent: 'border-t-4 border-t-amber-500',
      headerIcon: Clock,
      headerIconColor: 'text-amber-500',
      emptyHint: isRtl ? 'لا توجد مهام بانتظار البدء. اسحب هنا للنقل إلى To Do.' : 'No tasks waiting to start. Drag here to set To Do.'
    },
    {
      key: 'in_progress',
      title: isRtl ? 'قيد التنفيذ (In Progress)' : 'In Progress',
      stageName: isRtl ? 'جاري التنفيذ' : 'In Progress',
      badgeColor: 'bg-blue-50 text-blue-800 border border-blue-200',
      laneBg: 'bg-blue-50/20 border-blue-200/70',
      activeRing: 'ring-2 ring-blue-400 border-blue-400 bg-blue-100/40 shadow-md',
      borderAccent: 'border-t-4 border-t-blue-500',
      headerIcon: Activity,
      headerIconColor: 'text-blue-500',
      emptyHint: isRtl ? 'لا توجد مهام جارية حالياً. اسحب هنا للنقل إلى In Progress.' : 'No tasks in progress. Drag here to mark In Progress.'
    },
    {
      key: 'completed',
      title: isRtl ? 'مكتملة (Done)' : 'Done',
      stageName: isRtl ? 'منجزة' : 'Done',
      badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      laneBg: 'bg-emerald-50/20 border-emerald-200/70',
      activeRing: 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-100/40 shadow-md',
      borderAccent: 'border-t-4 border-t-emerald-500',
      headerIcon: CheckCircle2,
      headerIconColor: 'text-emerald-500',
      emptyHint: isRtl ? 'لا توجد مهام مكتملة بعد. اسحب هنا لتعليم المهمة كـ Done.' : 'No completed tasks yet. Drag here to mark Done.'
    },
    {
      key: 'canceled',
      title: isRtl ? 'ملغاة (Canceled)' : 'Canceled',
      stageName: isRtl ? 'ملغاة' : 'Canceled',
      badgeColor: 'bg-slate-100 text-slate-700 border border-slate-200',
      laneBg: 'bg-slate-50/50 border-slate-200',
      activeRing: 'ring-2 ring-slate-400 border-slate-400 bg-slate-100/60 shadow-md',
      borderAccent: 'border-t-4 border-t-slate-400',
      headerIcon: XCircle,
      headerIconColor: 'text-slate-400',
      emptyHint: isRtl ? 'لا توجد مهام ملغاة. اسحب هنا للإلغاء.' : 'No canceled tasks.'
    }
  ];

  // Priority Columns Configuration
  const priorityColumns = [
    {
      key: 'urgent',
      title: t('pri_urgent'),
      stageName: t('pri_urgent'),
      badgeColor: 'bg-red-100 text-red-800 border border-red-300 font-extrabold',
      laneBg: 'bg-red-50/20 border-red-200/70',
      activeRing: 'ring-2 ring-red-400 border-red-400 bg-red-100/40 shadow-md',
      borderAccent: 'border-t-4 border-t-red-600',
      headerIcon: AlertTriangle,
      headerIconColor: 'text-red-600',
      emptyHint: isRtl ? 'لا توجد مهام عاجلة. اسحب هنا لرفع الأولوية.' : 'No urgent tasks. Drag here.'
    },
    {
      key: 'high',
      title: t('pri_high'),
      stageName: t('pri_high'),
      badgeColor: 'bg-red-50 text-red-700 border border-red-200 font-bold',
      laneBg: 'bg-red-50/20 border-red-200/70',
      activeRing: 'ring-2 ring-red-400 border-red-400 bg-red-100/40 shadow-md',
      borderAccent: 'border-t-4 border-t-red-500',
      headerIcon: AlertCircle,
      headerIconColor: 'text-red-500',
      emptyHint: isRtl ? 'لا توجد مهام ذات أولوية مرتفعة.' : 'No high priority tasks.'
    },
    {
      key: 'medium',
      title: t('pri_medium'),
      stageName: t('pri_medium'),
      badgeColor: 'bg-amber-50 text-amber-800 border border-amber-200 font-bold',
      laneBg: 'bg-amber-50/20 border-amber-200/70',
      activeRing: 'ring-2 ring-amber-400 border-amber-400 bg-amber-100/40 shadow-md',
      borderAccent: 'border-t-4 border-t-amber-500',
      headerIcon: Clock,
      headerIconColor: 'text-amber-500',
      emptyHint: isRtl ? 'لا توجد مهام متوسطة.' : 'No medium priority tasks.'
    },
    {
      key: 'low',
      title: t('pri_low'),
      stageName: t('pri_low'),
      badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200 font-bold',
      laneBg: 'bg-blue-50/20 border-blue-200/70',
      activeRing: 'ring-2 ring-blue-400 border-blue-400 bg-blue-100/40 shadow-md',
      borderAccent: 'border-t-4 border-t-blue-500',
      headerIcon: CheckSquare,
      headerIconColor: 'text-blue-500',
      emptyHint: isRtl ? 'لا توجد مهام منخفضة.' : 'No low priority tasks.'
    }
  ];

  const activeColumns = boardGrouping === 'status' ? statusColumns : priorityColumns;

  const getPriorityBorder = (pri: string) => {
    switch (pri) {
      case 'urgent': return 'border-t-4 border-t-red-600';
      case 'high': return 'border-t-4 border-t-red-500';
      case 'medium': return 'border-t-4 border-t-amber-500';
      case 'low': return 'border-t-4 border-t-blue-500';
      default: return 'border-t-4 border-t-slate-300';
    }
  };

  const getPriorityLabelBg = (pri: string) => {
    switch (pri) {
      case 'urgent': return 'bg-red-100 text-red-800 border border-red-300 font-extrabold';
      case 'high': return 'bg-red-50 text-red-700 border border-red-200 font-bold';
      case 'medium': return 'bg-amber-50 text-amber-800 border border-amber-200 font-bold';
      case 'low': return 'bg-blue-50 text-blue-700 border border-blue-200 font-bold';
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesPriority = priorityFilter === '' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === '' || task.status === statusFilter;
    
    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = task.title?.toLowerCase().includes(q) || false;
      const assigneeName = getAssigneeName(task.assigned_to_id).toLowerCase();
      const assigneeMatch = assigneeName.includes(q);
      const clientName = getClientName(task.client_id).toLowerCase();
      const clientMatch = clientName.includes(q);
      const descMatch = task.description?.toLowerCase().includes(q) || false;
      matchesSearch = titleMatch || assigneeMatch || clientMatch || descMatch;
    }

    return matchesPriority && matchesStatus && matchesSearch;
  });

  // Summary KPI Metrics
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const urgentCount = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Chart Dataset 1: Grouped/Stacked by Priority (with Status breakdown)
  const priorityChartData = [
    {
      key: 'urgent',
      name: t('pri_urgent'),
      pending: tasks.filter(t => t.priority === 'urgent' && t.status === 'pending').length,
      in_progress: tasks.filter(t => t.priority === 'urgent' && t.status === 'in_progress').length,
      completed: tasks.filter(t => t.priority === 'urgent' && t.status === 'completed').length,
      canceled: tasks.filter(t => t.priority === 'urgent' && t.status === 'canceled').length,
      total: tasks.filter(t => t.priority === 'urgent').length,
    },
    {
      key: 'high',
      name: t('pri_high'),
      pending: tasks.filter(t => t.priority === 'high' && t.status === 'pending').length,
      in_progress: tasks.filter(t => t.priority === 'high' && t.status === 'in_progress').length,
      completed: tasks.filter(t => t.priority === 'high' && t.status === 'completed').length,
      canceled: tasks.filter(t => t.priority === 'high' && t.status === 'canceled').length,
      total: tasks.filter(t => t.priority === 'high').length,
    },
    {
      key: 'medium',
      name: t('pri_medium'),
      pending: tasks.filter(t => t.priority === 'medium' && t.status === 'pending').length,
      in_progress: tasks.filter(t => t.priority === 'medium' && t.status === 'in_progress').length,
      completed: tasks.filter(t => t.priority === 'medium' && t.status === 'completed').length,
      canceled: tasks.filter(t => t.priority === 'medium' && t.status === 'canceled').length,
      total: tasks.filter(t => t.priority === 'medium').length,
    },
    {
      key: 'low',
      name: t('pri_low'),
      pending: tasks.filter(t => t.priority === 'low' && t.status === 'pending').length,
      in_progress: tasks.filter(t => t.priority === 'low' && t.status === 'in_progress').length,
      completed: tasks.filter(t => t.priority === 'low' && t.status === 'completed').length,
      canceled: tasks.filter(t => t.priority === 'low' && t.status === 'canceled').length,
      total: tasks.filter(t => t.priority === 'low').length,
    },
  ];

  // Chart Dataset 2: Grouped/Stacked by Status (with Priority breakdown)
  const statusChartData = [
    {
      key: 'pending',
      name: t('state_pending'),
      urgent: tasks.filter(t => t.status === 'pending' && t.priority === 'urgent').length,
      high: tasks.filter(t => t.status === 'pending' && t.priority === 'high').length,
      medium: tasks.filter(t => t.status === 'pending' && t.priority === 'medium').length,
      low: tasks.filter(t => t.status === 'pending' && t.priority === 'low').length,
      total: tasks.filter(t => t.status === 'pending').length,
    },
    {
      key: 'in_progress',
      name: t('state_in_progress'),
      urgent: tasks.filter(t => t.status === 'in_progress' && t.priority === 'urgent').length,
      high: tasks.filter(t => t.status === 'in_progress' && t.priority === 'high').length,
      medium: tasks.filter(t => t.status === 'in_progress' && t.priority === 'medium').length,
      low: tasks.filter(t => t.status === 'in_progress' && t.priority === 'low').length,
      total: tasks.filter(t => t.status === 'in_progress').length,
    },
    {
      key: 'completed',
      name: t('state_completed'),
      urgent: tasks.filter(t => t.status === 'completed' && t.priority === 'urgent').length,
      high: tasks.filter(t => t.status === 'completed' && t.priority === 'high').length,
      medium: tasks.filter(t => t.status === 'completed' && t.priority === 'medium').length,
      low: tasks.filter(t => t.status === 'completed' && t.priority === 'low').length,
      total: tasks.filter(t => t.status === 'completed').length,
    },
    {
      key: 'canceled',
      name: t('state_canceled'),
      urgent: tasks.filter(t => t.status === 'canceled' && t.priority === 'urgent').length,
      high: tasks.filter(t => t.status === 'canceled' && t.priority === 'high').length,
      medium: tasks.filter(t => t.status === 'canceled' && t.priority === 'medium').length,
      low: tasks.filter(t => t.status === 'canceled' && t.priority === 'low').length,
      total: tasks.filter(t => t.status === 'canceled').length,
    },
  ];

  // Colors dictionary
  const statusColors: Record<string, string> = {
    pending: '#F59E0B',      // Amber
    in_progress: '#3B82F6',  // Blue
    completed: '#10B981',    // Emerald
    canceled: '#94A3B8'      // Slate
  };

  const priorityColors: Record<string, string> = {
    urgent: '#DC2626',       // Crimson / Red
    high: '#EF4444',         // Red
    medium: '#F59E0B',       // Amber
    low: '#3B82F6'           // Blue
  };

  // Custom Chart Tooltip
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (Number(entry.value) || 0), 0);
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs font-sans border border-slate-700 backdrop-blur-md min-w-[170px]">
          <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1.5 mb-2 flex items-center justify-between gap-3">
            <span>{label}</span>
            <span className="font-mono text-slate-400 text-[10px]">{isRtl ? `المجموع: ${total}` : `Total: ${total}`}</span>
          </div>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => {
              if (entry.value === 0) return null;
              return (
                <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-300">{entry.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white">{entry.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs font-serif">
      
      {/* ACTION TOPBAR BOARD */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t('tasks')}</span>
            <CheckSquare className="w-5 h-5 text-[#FF6500]" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl ? 'تنظيم خطط العمل، إسناد المهام للمبيعات وتحديد مواعيد التسليم والأولوية التنافسية للعملاء.' : 'Plan operations, assign tickets to representatives, set emergency warnings and resolve constraints'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Chart Analytics Button */}
          <button
            type="button"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              showAnalytics
                ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#FF6500]" />
            <span>{t('toggleChart')}</span>
            {showAnalytics ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => setFormOpen(true)}
            style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:opacity-90 transition-all font-bold text-xs text-white shadow-sm self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" style={{ color: 'var(--brand-secondary, #FF6500)' }} />
            <span>{t('addTask')}</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE KPI STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Tasks */}
        <div 
          onClick={() => { setPriorityFilter(''); setStatusFilter(''); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white hover:border-slate-300 shadow-xs ${
            !priorityFilter && !statusFilter ? 'ring-2 ring-slate-400/40 border-slate-300' : 'border-slate-200'
          }`}
          title={isRtl ? 'عرض كافة المهام' : 'Show all tasks'}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-bold text-[10px] uppercase tracking-wider">{isRtl ? 'إجمالي المهام' : 'Total Tasks'}</span>
            <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">{totalTasks}</span>
            <span className="text-[10px] text-slate-400 font-sans">{isRtl ? 'الكل' : 'All'}</span>
          </div>
        </div>

        {/* Pending */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'pending' ? '' : 'pending')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white hover:border-amber-300 shadow-xs ${
            statusFilter === 'pending' ? 'ring-2 ring-amber-400 border-amber-300 bg-amber-50/20' : 'border-slate-200'
          }`}
          title={isRtl ? 'تصفية حسب: قيد الانتظار' : 'Filter by: Pending'}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-bold text-[10px] uppercase tracking-wider text-amber-600">{t('state_pending')}</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-600 font-mono">{pendingCount}</span>
            <span className="text-[10px] text-amber-500/80 font-mono">{totalTasks > 0 ? `${Math.round((pendingCount / totalTasks) * 100)}%` : '0%'}</span>
          </div>
        </div>

        {/* In Progress */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'in_progress' ? '' : 'in_progress')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white hover:border-blue-300 shadow-xs ${
            statusFilter === 'in_progress' ? 'ring-2 ring-blue-400 border-blue-300 bg-blue-50/20' : 'border-slate-200'
          }`}
          title={isRtl ? 'تصفية حسب: جاري التنفيذ' : 'Filter by: In progress'}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-bold text-[10px] uppercase tracking-wider text-blue-600">{t('state_in_progress')}</span>
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-blue-600 font-mono">{inProgressCount}</span>
            <span className="text-[10px] text-blue-500/80 font-mono">{totalTasks > 0 ? `${Math.round((inProgressCount / totalTasks) * 100)}%` : '0%'}</span>
          </div>
        </div>

        {/* Completed */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'completed' ? '' : 'completed')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white hover:border-emerald-300 shadow-xs ${
            statusFilter === 'completed' ? 'ring-2 ring-emerald-400 border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
          }`}
          title={isRtl ? 'تصفية حسب: المكتملة' : 'Filter by: Completed'}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-600">{t('state_completed')}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-600 font-mono">{completedCount}</span>
            <span className="text-[10px] text-emerald-600 font-mono font-bold">{completionRate}%</span>
          </div>
        </div>

        {/* Urgent Attention */}
        <div 
          onClick={() => setPriorityFilter(priorityFilter === 'urgent' ? '' : 'urgent')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white hover:border-rose-300 shadow-xs ${
            priorityFilter === 'urgent' ? 'ring-2 ring-rose-400 border-rose-300 bg-rose-50/20' : 'border-slate-200'
          }`}
          title={isRtl ? 'تصفية حسب: عاجل جداً' : 'Filter by: Urgent'}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-bold text-[10px] uppercase tracking-wider text-rose-600">{t('urgentTasks')}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-rose-600 font-mono">{urgentCount}</span>
            {urgentCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                {isRtl ? 'اهتمام فوري' : 'Action'}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">0</span>
            )}
          </div>
        </div>
      </div>

      {/* RECHARTS BAR CHART ANALYTICS CARD */}
      {showAnalytics && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FF6500]" />
                <h3 className="font-bold text-slate-800 text-sm">{t('taskDistribution')}</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {chartDimension === 'priority'
                  ? (isRtl ? 'تحليل توزيع المهام حسب مستويات الأهمية وتوزيع حالات الإنجاز لكل مستوى' : 'Visual breakdown of tasks across priority tiers and their execution stages')
                  : (isRtl ? 'تحليل توزيع المهام حسب مراحل التنفيذ مع توزيع الأهمية لكل مرحلة' : 'Visual breakdown of tasks across execution statuses and their priority levels')}
              </p>
            </div>

            {/* Chart View Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Dimension toggle */}
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setChartDimension('priority')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    chartDimension === 'priority'
                      ? 'bg-white text-slate-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('chartByPriority')}
                </button>
                <button
                  type="button"
                  onClick={() => setChartDimension('status')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    chartDimension === 'status'
                      ? 'bg-white text-slate-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('chartByStatus')}
                </button>
              </div>

              {/* Stacking toggle */}
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setChartStacking('stacked')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    chartStacking === 'stacked'
                      ? 'bg-white text-slate-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title={isRtl ? 'أعمدة مدمجة تراكمية' : 'Stacked bars'}
                >
                  <Layers className="w-3.5 h-3.5 inline mr-1" />
                  <span>{t('stackedView')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartStacking('grouped')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    chartStacking === 'grouped'
                      ? 'bg-white text-slate-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title={isRtl ? 'أعمدة متجاورة منفصلة' : 'Grouped bars'}
                >
                  <span>{t('groupedView')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Chart container */}
          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartDimension === 'priority' ? (
                <BarChart
                  data={priorityChartData}
                  margin={{ top: 12, right: 16, left: -20, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'Inter, Tajawal, sans-serif' }} 
                    axisLine={{ stroke: '#E2E8F0' }} 
                    tickLine={false} 
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontFamily: 'Inter, Tajawal, sans-serif' }} 
                  />
                  <Bar 
                    dataKey="pending" 
                    name={t('state_pending')} 
                    stackId={chartStacking === 'stacked' ? 'statusStack' : undefined} 
                    fill={statusColors.pending} 
                    radius={chartStacking === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                  <Bar 
                    dataKey="in_progress" 
                    name={t('state_in_progress')} 
                    stackId={chartStacking === 'stacked' ? 'statusStack' : undefined} 
                    fill={statusColors.in_progress} 
                    radius={chartStacking === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                  <Bar 
                    dataKey="completed" 
                    name={t('state_completed')} 
                    stackId={chartStacking === 'stacked' ? 'statusStack' : undefined} 
                    fill={statusColors.completed} 
                    radius={chartStacking === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                  <Bar 
                    dataKey="canceled" 
                    name={t('state_canceled')} 
                    stackId={chartStacking === 'stacked' ? 'statusStack' : undefined} 
                    fill={statusColors.canceled} 
                    radius={chartStacking === 'stacked' ? [4, 4, 0, 0] : [4, 4, 0, 0]}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                </BarChart>
              ) : (
                <BarChart
                  data={statusChartData}
                  margin={{ top: 12, right: 16, left: -20, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'Inter, Tajawal, sans-serif' }} 
                    axisLine={{ stroke: '#E2E8F0' }} 
                    tickLine={false} 
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontFamily: 'Inter, Tajawal, sans-serif' }} 
                  />
                  <Bar 
                    dataKey="urgent" 
                    name={t('pri_urgent')} 
                    stackId={chartStacking === 'stacked' ? 'priStack' : undefined} 
                    fill={priorityColors.urgent} 
                    radius={chartStacking === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                  <Bar 
                    dataKey="high" 
                    name={t('pri_high')} 
                    stackId={chartStacking === 'stacked' ? 'priStack' : undefined} 
                    fill={priorityColors.high} 
                    radius={chartStacking === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                  <Bar 
                    dataKey="medium" 
                    name={t('pri_medium')} 
                    stackId={chartStacking === 'stacked' ? 'priStack' : undefined} 
                    fill={priorityColors.medium} 
                    radius={chartStacking === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                  <Bar 
                    dataKey="low" 
                    name={t('pri_low')} 
                    stackId={chartStacking === 'stacked' ? 'priStack' : undefined} 
                    fill={priorityColors.low} 
                    radius={chartStacking === 'stacked' ? [4, 4, 0, 0] : [4, 4, 0, 0]}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* FILTER & REAL-TIME SEARCH CONTROLS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Real-time Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} pointer-events-none`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchTasks')}
            className={`w-full py-2.5 ${isRtl ? 'pr-9 pl-8 text-right' : 'pl-9 pr-8 text-left'} bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all font-sans`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-2.5' : 'right-2.5'} p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer`}
              title={isRtl ? 'مسح البحث' : 'Clear search'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority & Status Selectors & Board Layout Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Board Columns Layout Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setBoardGrouping('status')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                boardGrouping === 'status'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title={isRtl ? 'لوحة كانبان بحسب حالات التنفيذ (To Do, In Progress, Done)' : 'Kanban Status Columns (To Do, In Progress, Done)'}
            >
              <Kanban className="w-3.5 h-3.5 text-[#FF6500]" />
              <span>{isRtl ? 'أعمدة الحالات (To Do / Done)' : 'Status (Kanban)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setBoardGrouping('priority')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                boardGrouping === 'priority'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title={isRtl ? 'لوحة بحسب مستويات الأولوية' : 'Priority Columns Matrix'}
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>{isRtl ? 'أعمدة الأولوية' : 'Priority Matrix'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 font-bold shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px]">{isRtl ? 'تصفية:' : 'Filter:'}</span>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-2 px-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-xs font-serif focus:bg-white focus:outline-hidden cursor-pointer"
          >
            <option value="">{isRtl ? 'كل مستويات الأهمية' : 'All Priorities'}</option>
            <option value="urgent">{isRtl ? '🚨 عاجل جداً (أحمر داكن)' : '🚨 Urgent (Deep Red)'}</option>
            <option value="high">{isRtl ? '🔴 مرتفع (أحمر)' : '🔴 High (Red)'}</option>
            <option value="medium">{isRtl ? '🟡 متوسط (كهرماني)' : '🟡 Medium (Amber)'}</option>
            <option value="low">{isRtl ? '🔵 منخفض (أزرق)' : '🔵 Low (Blue)'}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-xs font-serif focus:bg-white focus:outline-hidden cursor-pointer"
          >
            <option value="">{isRtl ? 'كل حالات التنفيذ' : 'All execution statuses'}</option>
            <option value="pending">{t('state_pending')}</option>
            <option value="in_progress">{t('state_in_progress')}</option>
            <option value="completed">{t('state_completed')}</option>
            <option value="canceled">{t('state_canceled')}</option>
          </select>

          {/* Reset Button */}
          {(searchQuery || priorityFilter || statusFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setPriorityFilter('');
                setStatusFilter('');
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isRtl ? 'إلغاء التصفية' : 'Reset'}
            </button>
          )}

          {/* Task Match Badge */}
          <span className="text-[11px] font-bold text-slate-600 font-mono bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
            {isRtl ? `${filteredTasks.length} من ${tasks.length}` : `${filteredTasks.length} / ${tasks.length}`}
          </span>
        </div>
      </div>

      {/* INTERACTIVE DRAG-AND-DROP GUIDANCE BANNER */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-slate-50 rounded-xl border border-orange-100 text-[11px] text-slate-600 shadow-3xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#FF6500] animate-pulse shrink-0" />
          <span className="font-bold text-slate-800">{isRtl ? 'سحب وإفلات تفاعلي:' : 'Interactive Drag & Drop:'}</span>
          <span>
            {boardGrouping === 'status'
              ? (isRtl ? 'اسحب أي مهمة من مقبض السحب (⋮⋮) وأفلتها بين أعمدة الحالات لتحديث مرحلتها فورياً (مثلاً: نقل من To Do إلى In Progress أو Done).' : 'Drag any task via the handle (⋮⋮) and drop it between columns to update status instantly (e.g. To Do → In Progress → Done).')
              : (isRtl ? 'اسحب أي مهمة وأفلتها بين أعمدة الأولوية لتعديل درجة الأهمية فورياً.' : 'Drag tasks between priority columns to update importance level instantly.')}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 font-bold shrink-0 hidden md:inline">
          {boardGrouping === 'status' ? '4 Status Stages' : '4 Priority Tiers'}
        </span>
      </div>

      {/* Empty State Banner if search yields no results across all lanes */}
      {filteredTasks.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {searchQuery 
                ? (isRtl ? `لم يتم العثور على أي مهمة تطابق "${searchQuery}"` : `No tasks matching "${searchQuery}"`)
                : (isRtl ? 'لا توجد مهام تطابق معايير التصفية المحددة' : 'No tasks match the selected filters')}
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              {isRtl ? 'جرب البحث بعنوان آخر أو باسم موظف مختلف، أو امسح البحث لإظهار كافة المهام' : 'Try searching with a different task title or assignee name, or clear your filters.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setPriorityFilter('');
              setStatusFilter('');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>{isRtl ? 'مسح البحث والتصفية' : 'Clear search & filters'}</span>
          </button>
        </div>
      )}

      {/* DRAG-AND-DROP KANBAN STATUS / PRIORITY LANES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeColumns.map(col => {
          const laneTasks = filteredTasks
            .filter(t => (boardGrouping === 'status' ? t.status === col.key : t.priority === col.key))
            .sort(sortTasks);
          const isLaneDragOver = dragOverLane === col.key;

          return (
            <div 
              key={col.key} 
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverLane(col.key);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  if (dragOverLane === col.key) {
                    setDragOverLane(null);
                  }
                }
              }}
              onDrop={(e) => handleDropOnLane(e, col.key)}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col gap-3 min-h-[460px] ${col.laneBg} ${
                isLaneDragOver 
                  ? col.activeRing
                  : 'border-slate-200/80 shadow-2xs'
              }`}
            >
              {/* Lane header */}
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <col.headerIcon className={`w-4 h-4 shrink-0 ${col.headerIconColor}`} />
                  <span className="font-extrabold text-slate-800 text-xs truncate">
                    {col.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${col.badgeColor}`}>
                    {laneTasks.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (boardGrouping === 'status') {
                        setNewTask(prev => ({ ...prev, status: col.key }));
                      } else {
                        setNewTask(prev => ({ ...prev, priority: col.key }));
                      }
                      setFormOpen(true);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-[#FF6500] hover:bg-orange-50 transition-colors cursor-pointer"
                    title={isRtl ? `إضافة مهمة جديدة في: ${col.title}` : `Add task to ${col.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tasks List within Lane */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-380px)] pr-0.5">
                {laneTasks.length === 0 ? (
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      setDragOverLane(col.key);
                    }}
                    onDrop={(e) => handleDropOnLane(e, col.key)}
                    className={`p-6 border-2 border-dashed rounded-xl text-center space-y-2 transition-all my-2 ${
                      isLaneDragOver 
                        ? 'border-[#FF6500] bg-orange-50/70 scale-[1.02]' 
                        : 'border-slate-200/80 hover:border-slate-300 bg-white/50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <col.headerIcon className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                      {draggedTaskId 
                        ? (isRtl ? `+ أفلت هنا للنقل إلى: ${col.title}` : `+ Drop here to move to: ${col.title}`) 
                        : col.emptyHint}
                    </p>
                  </div>
                ) : (
                  laneTasks.map(task => {
                    const isBeingDragged = draggedTaskId === task.id;
                    const isDragOver = dragOverTaskId === task.id;
                    const isRecentlyMoved = recentlyMovedTaskId === task.id;

                    return (
                      <div 
                        key={task.id} 
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.dataTransfer.dropEffect = 'move';
                          if (draggedTaskId !== null && draggedTaskId !== task.id) {
                            setDragOverTaskId(task.id);
                          }
                        }}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            if (dragOverTaskId === task.id) {
                              setDragOverTaskId(null);
                            }
                          }
                        }}
                        onDrop={(e) => handleDropOnTask(e, task)}
                        className={`bg-white p-4 rounded-xl shadow-xs border relative space-y-3 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md ${
                          getPriorityBorder(task.priority)
                        } ${
                          isBeingDragged 
                            ? 'opacity-35 border-dashed border-2 border-slate-400 scale-[0.97]' 
                            : 'border-slate-200 hover:border-orange-300'
                        } ${
                          isDragOver 
                            ? 'border-2 border-[#FF6500] bg-orange-50/30 scale-[1.02] shadow-sm' 
                            : ''
                        } ${
                          isRecentlyMoved 
                            ? 'ring-2 ring-emerald-400 border-emerald-400 shadow-md bg-emerald-50/15 animate-pulse' 
                            : ''
                        }`}
                      >
                        <div>
                          {/* Title & Status indicator with Drag handle */}
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-start gap-1.5 p-0.5 max-w-[85%]">
                              <GripVertical className="w-3.5 h-3.5 text-slate-300 hover:text-[#FF6500] transition-colors cursor-grab shrink-0 mt-0.5" />
                              <p className={`font-bold text-slate-800 leading-tight ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                                {task.title}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(isRtl ? 'هل أنت متأكد من مسح هذه المهمة؟' : 'Remove task item?')) {
                                  onDeleteTask(task.id);
                                }
                              }}
                              className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                              title={isRtl ? 'حذف المهمة' : 'Delete task'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Secondary tag indicator */}
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {/* Color-coded Priority Badge (High: Red, Medium: Amber, Low: Blue) */}
                            <span 
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold shadow-3xs ${getPriorityLabelBg(task.priority)}`}
                              title={`${isRtl ? 'الأولوية' : 'Priority'}: ${t(`pri_${task.priority}`)}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                task.priority === 'urgent' ? 'bg-red-600 animate-pulse' :
                                task.priority === 'high' ? 'bg-red-500' :
                                task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                              }`} />
                              <span>{t(`pri_${task.priority}`)}</span>
                            </span>

                            {boardGrouping === 'priority' && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {t(`state_${task.status}`)}
                              </span>
                            )}

                            {task.status === 'completed' && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>{isRtl ? 'مكتملة' : 'Done'}</span>
                              </span>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-slate-500 mt-1.5 leading-relaxed text-[10px]">{task.description}</p>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {task.tags.map((tag, idx) => (
                                <span 
                                  key={idx} 
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200"
                                >
                                  {tag === 'Note' ? '📌' : '🏷️'} {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Client row name if present */}
                        {task.client_id && (
                          <div className="bg-slate-50 px-2 py-1 rounded border border-slate-100 text-[10px] text-slate-500 font-sans">
                            💼 {getClientName(task.client_id)}
                          </div>
                        )}

                        {/* NESTED SUBTASKS CHECKLIST */}
                        {(() => {
                          const subtasksList = task.subtasks || [];
                          const totalSubtasks = subtasksList.length;
                          const completedSubtasks = subtasksList.filter(s => s.completed).length;
                          const percentDone = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
                          const isExpanded = expandedSubtasks[task.id] !== undefined ? expandedSubtasks[task.id] : true;

                          return (
                            <div className="pt-2 border-t border-slate-100 space-y-2">
                              {/* Checklist Header */}
                              <div className="flex items-center justify-between gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedSubtasks(prev => ({ ...prev, [task.id]: !isExpanded }));
                                  }}
                                  className="flex items-center gap-1.5 text-slate-700 hover:text-[#FF6500] font-bold text-[10px] transition-colors cursor-pointer group"
                                  title={isRtl ? 'إظهار / إخفاء قائمة التدقيق' : 'Toggle checklist'}
                                >
                                  <ListTodo className="w-3.5 h-3.5 text-[#FF6500] shrink-0" />
                                  <span>{t('subtasks')}</span>
                                  {totalSubtasks > 0 && (
                                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                                      completedSubtasks === totalSubtasks && totalSubtasks > 0
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {completedSubtasks}/{totalSubtasks}
                                    </span>
                                  )}
                                  {isExpanded ? (
                                    <ChevronUp className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                                  )}
                                </button>

                                {totalSubtasks > 0 && (
                                  <span className={`text-[9px] font-mono font-bold ${
                                    percentDone === 100 ? 'text-emerald-600' : 'text-slate-400'
                                  }`}>
                                    {percentDone}%
                                  </span>
                                )}
                              </div>

                              {/* Mini Progress Bar if subtasks exist */}
                              {totalSubtasks > 0 && (
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      percentDone === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-[#FF6500]'
                                    }`}
                                    style={{ width: `${percentDone}%` }}
                                  />
                                </div>
                              )}

                              {/* Nested Checklist Body */}
                              {isExpanded && (
                                <div className="space-y-1.5 pt-0.5">
                                  {subtasksList.length > 0 ? (
                                    <div className="space-y-1 max-h-[160px] overflow-y-auto pr-0.5">
                                      {subtasksList.map(st => (
                                        <div 
                                          key={st.id}
                                          className={`group/st flex items-center justify-between gap-2 p-1.5 rounded-lg border transition-all ${
                                            st.completed 
                                              ? 'bg-slate-50/70 border-slate-150 text-slate-400' 
                                              : 'bg-white border-slate-200/80 hover:border-orange-200 text-slate-700 shadow-3xs'
                                          }`}
                                        >
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleSubtask(task.id, st.id, st.completed);
                                            }}
                                            className="flex items-center gap-1.5 flex-1 text-left rtl:text-right min-w-0 cursor-pointer"
                                            title={st.completed ? (isRtl ? 'إلغاء الإكمال' : 'Mark incomplete') : (isRtl ? 'تعليم كمكتمل' : 'Mark complete')}
                                          >
                                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border transition-all ${
                                              st.completed 
                                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                                : 'border-slate-300 bg-white group-hover/st:border-orange-400'
                                            }`}>
                                              {st.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                            </span>
                                            <span className={`text-[10px] leading-tight break-words ${
                                              st.completed ? 'line-through text-slate-400' : 'font-medium'
                                            }`}>
                                              {st.title}
                                            </span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSubtask(task.id, st.id);
                                            }}
                                            className="opacity-0 group-hover/st:opacity-100 text-slate-300 hover:text-rose-500 p-0.5 rounded transition-all cursor-pointer shrink-0"
                                            title={t('deleteSubtask')}
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-[9px] text-slate-400 italic py-0.5 text-center font-serif">
                                      {t('noSubtasks')}
                                    </p>
                                  )}

                                  {/* Quick Add Subtask Input inside Card */}
                                  <div 
                                    className="flex items-center gap-1 pt-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="text"
                                      value={subtaskInput[task.id] || ''}
                                      onChange={(e) => setSubtaskInput(prev => ({ ...prev, [task.id]: e.target.value }))}
                                      placeholder={t('subtaskPlaceholder')}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleAddSubtask(task.id);
                                        }
                                      }}
                                      className="flex-1 py-1 px-2 border border-slate-200 rounded-lg text-[9px] bg-slate-50 focus:bg-white focus:outline-none focus:border-[#FF6500] transition-colors"
                                    />
                                    <button
                                      type="button"
                                      disabled={submittingSubtask[task.id] || !subtaskInput[task.id]?.trim()}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddSubtask(task.id);
                                      }}
                                      className="px-2 py-1 bg-slate-100 hover:bg-[#FF6500] hover:text-white text-slate-700 font-extrabold text-[9px] rounded-lg transition-colors shrink-0 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-700 cursor-pointer inline-flex items-center gap-1"
                                      title={t('addSubtask')}
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                      <span>{isRtl ? 'إضافة' : 'Add'}</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Date & Assignee metadata */}
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[9px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-orange-400" />
                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-500">
                            <UserCheck className="w-3 h-3 text-blue-500" />
                            <span>{getAssigneeName(task.assigned_to_id)}</span>
                          </span>
                        </div>

                        {/* Comments button and Inline comment area */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{isRtl ? 'المناقشات والردود:' : 'Task Discussions:'}</span>
                          <button
                            type="button"
                            onClick={() => setExpandedComments(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                            className="flex items-center gap-1 text-[#FF6500] hover:text-orange-600 font-extrabold text-[9px] px-1.5 py-0.5 rounded bg-orange-50/50 border border-orange-100 transition-colors cursor-pointer"
                          >
                            <span>💬</span>
                            <span>
                              {task.comments?.length || 0} {isRtl ? 'تحديث' : 'remarks'}
                            </span>
                          </button>
                        </div>

                        {expandedComments[task.id] && (
                          <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60 mt-1 space-y-2.5 text-[10px] font-sans">
                            <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1">
                              {(!task.comments || task.comments.length === 0) ? (
                                <p className="text-[9px] text-slate-400 italic py-1 text-center font-medium">
                                  {isRtl ? 'لا توجد تعليقات أو تحديثات بعد.' : 'No updates logged yet.'}
                                </p>
                              ) : (
                                task.comments.map((c, index) => (
                                  <div key={c.id || index} className="p-1.5 rounded bg-white shadow-3xs border border-slate-100/50 space-y-1">
                                    <div className="flex justify-between items-center text-[8px] font-medium text-slate-400">
                                      <span className="font-extrabold text-slate-700">{c.user_name}</span>
                                      <span className="font-mono">{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-slate-600 text-[10px] leading-relaxed break-words">{c.content}</p>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Add Comment mini Form */}
                            <div className="flex items-center gap-1 pt-1.5 border-t border-dashed border-slate-150">
                              <input
                                type="text"
                                value={commentInput[task.id] || ''}
                                onChange={(e) => setCommentInput(prev => ({ ...prev, [task.id]: e.target.value }))}
                                placeholder={isRtl ? 'اكتب ملاحظة أو تحديث للمهمة...' : 'Post update or feedback...'}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handlePostComment(task.id);
                                  }
                                }}
                                className="flex-1 py-1 px-2 border border-slate-200 rounded text-[9px] bg-white focus:outline-none focus:border-orange-400"
                              />
                              <button
                                type="button"
                                disabled={submittingComment[task.id]}
                                onClick={() => handlePostComment(task.id)}
                                className="px-2 py-1 bg-[#FF6500] hover:bg-orange-600 font-extrabold text-white text-[9px] rounded transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                              >
                                {submittingComment[task.id] ? '...' : (isRtl ? 'إرسال' : 'Add')}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Status Transition controls and State select */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1">
                            {task.status !== 'completed' && (
                              <button
                                type="button"
                                onClick={() => updateStatus(task.id, 'completed')}
                                className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-[9px] transition-colors cursor-pointer inline-flex items-center gap-0.5"
                                title={isRtl ? 'تعليم كمكتملة' : 'Mark Done'}
                              >
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>{isRtl ? 'إكمال' : 'Done'}</span>
                              </button>
                            )}
                            {task.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => updateStatus(task.id, 'in_progress')}
                                className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold text-[9px] transition-colors cursor-pointer inline-flex items-center gap-0.5"
                                title={isRtl ? 'بدء التنفيذ' : 'Start Task'}
                              >
                                <Activity className="w-2.5 h-2.5" />
                                <span>{isRtl ? 'بدء' : 'Start'}</span>
                              </button>
                            )}
                            {task.status === 'completed' && (
                              <button
                                type="button"
                                onClick={() => updateStatus(task.id, 'in_progress')}
                                className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-bold text-[9px] transition-colors cursor-pointer"
                                title={isRtl ? 'إعادة الفتح' : 'Reopen Task'}
                              >
                                <span>↩ {isRtl ? 'إعادة فتح' : 'Reopen'}</span>
                              </button>
                            )}
                          </div>

                          <select
                            value={task.status}
                            onChange={(e) => updateStatus(task.id, e.target.value as any)}
                            className="py-1 px-1.5 border border-slate-200 rounded text-[9px] font-bold bg-slate-50 text-slate-700 cursor-pointer"
                          >
                            <option value="pending">{t('state_pending')}</option>
                            <option value="in_progress">{t('state_in_progress')}</option>
                            <option value="completed">{t('state_completed')}</option>
                            <option value="canceled">{t('state_canceled')}</option>
                          </select>
                        </div>

                      </div>
                    );
                  })
                )}

                {/* Additional bottom drop zone when dragging and lane already has items */}
                {draggedTaskId && laneTasks.length > 0 && (
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      setDragOverLane(col.key);
                    }}
                    onDrop={(e) => handleDropOnLane(e, col.key)}
                    className={`p-2.5 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer ${
                      isLaneDragOver 
                        ? 'border-[#FF6500] bg-orange-100/60 text-orange-700 font-bold scale-[1.01]' 
                        : 'border-slate-300/70 text-slate-400 hover:border-orange-300 hover:text-orange-600 bg-white/40'
                    }`}
                  >
                    <span className="text-[10px]">
                      {isRtl ? `+ إفلات هنا للنقل إلى: ${col.title}` : `+ Drop here to move to: ${col.title}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE NEW TASK MODAL */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-slide-in">
            <div 
              className="p-5 text-white flex justify-between items-center"
              style={{ backgroundColor: 'var(--brand-primary, #0B192C)' }}
            >
              <h3 className="font-extrabold tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: 'var(--brand-secondary, #FF6500)' }} />
                <span>{t('addTask')}</span>
              </h3>
              <button onClick={() => setFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <Trash2 className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4 font-serif text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">{t('taskTitle')} *</label>
                <input
                  type="text" required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  placeholder="مراجعة مسودة العقد الفني لشركة STC"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <label className="font-bold text-slate-600 block">{isRtl ? 'وصف تفصيلي للمهمة' : 'Description summary'}</label>
                  <div className="flex items-center gap-1.5">
                    {/* Simulated Voice Fallback to test if mic is unavailable or blocked by sandboxed iframe */}
                    <button
                      type="button"
                      onClick={() => {
                        const sampleText = isRtl
                          ? 'ملاحظة صوتية: مناقشة مسودة عقد الربط الفني ونظام الفوترة التراكمية مع الطاقم الاستشاري.'
                          : 'Voice note: Schedule a sync with consultancy team to review the technical integration draft & billing systems.';
                        setNewTask(prev => {
                          const upToDateTags = prev.tags.includes('Note') ? prev.tags : [...prev.tags, 'Note'];
                          return {
                            ...prev,
                            description: prev.description ? `${prev.description} ${sampleText}` : sampleText,
                            tags: upToDateTags
                          };
                        });
                        setRecordingError(null);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-teal-150 bg-teal-50 text-teal-700 hover:bg-teal-100 text-[10px] font-black transition-all cursor-pointer shadow-subtle hover:shadow-xs active:scale-95"
                      title={isRtl ? 'مساعد تدوين الملاحظة صوتياً تلقائياً' : 'Simulate voice note input fallback'}
                    >
                      <span>⚡ {isRtl ? 'محاكاة صوتية' : 'Simulate Mic'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleVoiceRecording}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-all text-[10px] font-bold ${
                        isRecording 
                          ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse font-black'
                          : 'bg-orange-50 border-orange-100 text-[#FF6500] hover:bg-orange-100'
                      } cursor-pointer`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-3 h-3 text-rose-500 animate-spin" />
                          <span>{isRtl ? 'إيقاف...' : 'Stop...'}</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3 h-3" />
                          <span>{isRtl ? 'إدخال بالصوت' : 'Mic Input'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {recordingError && (
                  <div className="p-2 bg-rose-50/70 border border-rose-100 rounded-lg text-[9px] text-slate-600 space-y-1 mb-1.5 leading-relaxed">
                    <p className="text-rose-600 font-extrabold flex items-center gap-1">
                      ⚠️ {recordingError}
                    </p>
                    <p>
                      {isRtl 
                        ? 'قد يظهر خطأ الشبكة/الصوت بالمتصفح بسبب قيود إطارات العمل التجريبية المحمية أو عدم دعم سيرفرات جوجل/ابل الصوتية في البيئة المغلقة. يرجى الضغط على زر "⚡ محاكاة صوتية" لتجربة تدوين الملاحظات التلقائية فوراً.'
                        : 'Browser SpeechRecognition service can fail over network constraints or iframe sandbox blocks. Click the "⚡ Simulate Mic" button above for instant automated testing.'}
                    </p>
                  </div>
                )}

                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  placeholder={isRtl ? 'اكتب هنا أو اضغط زر "إدخال بالصوت" للتسجيل...' : 'Type description or click "Mic Input" to record...'}
                />
              </div>

              {/* Tags Section */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isRtl ? 'تصنيف المهمة (وسوم):' : 'Task Classification Tags:'}</span>
                </label>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {['Note', 'Meeting', 'Call', 'Followup', 'Urgent'].map(tagOption => {
                    const isSelected = newTask.tags.includes(tagOption);
                    return (
                      <button
                        key={tagOption}
                        type="button"
                        onClick={() => {
                          setNewTask(prev => ({
                            ...prev,
                            tags: prev.tags.includes(tagOption)
                              ? prev.tags.filter(t => t !== tagOption)
                              : [...prev.tags, tagOption]
                          }));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100 border-amber-300 text-amber-800 font-extrabold shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <span>{tagOption === 'Note' ? '📌' : ''} {tagOption}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">{t('priority')}</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-medium"
                  >
                    <option value="low">🔵 {t('pri_low')} ({isRtl ? 'أزرق' : 'Blue'})</option>
                    <option value="medium">🟡 {t('pri_medium')} ({isRtl ? 'كهرماني' : 'Amber'})</option>
                    <option value="high">🔴 {t('pri_high')} ({isRtl ? 'أحمر' : 'Red'})</option>
                    <option value="urgent">🚨 {t('pri_urgent')} ({isRtl ? 'عاجل' : 'Urgent'})</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">{t('dueDate')} *</label>
                  <input
                    type="datetime-local" required
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">{t('assignee')}</label>
                  <select
                    value={newTask.assigned_to_id}
                    onChange={(e) => setNewTask({...newTask, assigned_to_id: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">{isRtl ? '-- بلا موظف مسؤول --' : '-- Choose User --'}</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">{isRtl ? 'العميل المصاحب' : 'Linked Client'}</label>
                  <select
                    value={newTask.client_id}
                    onChange={(e) => setNewTask({...newTask, client_id: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">{isRtl ? '-- بلا عميل --' : '-- Choose Client --'}</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Subtasks Checklist Builder */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <label className="font-bold text-slate-600 block flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ListTodo className="w-3.5 h-3.5 text-[#FF6500]" />
                    <span>{t('subtasks')} ({t('checklist')})</span>
                  </span>
                  {newTask.subtasks.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {newTask.subtasks.length} {isRtl ? 'مهام فرعية' : 'items'}
                    </span>
                  )}
                </label>

                {/* Added subtasks list in modal */}
                {newTask.subtasks.length > 0 && (
                  <div className="space-y-1 max-h-[100px] overflow-y-auto bg-slate-50 p-2 rounded-lg border border-slate-200">
                    {newTask.subtasks.map((st, i) => (
                      <div key={st.id || i} className="flex items-center justify-between gap-2 bg-white px-2 py-1 rounded border border-slate-150 text-[11px]">
                        <span className="truncate text-slate-700 font-medium flex items-center gap-1.5">
                          <CheckSquare className="w-3 h-3 text-orange-500 shrink-0" />
                          <span>{st.title}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewTask(prev => ({
                            ...prev,
                            subtasks: prev.subtasks.filter((_, idx) => idx !== i)
                          }))}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer p-0.5"
                          title={isRtl ? 'حذف' : 'Remove'}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtask input row in modal */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={modalSubtaskInput}
                    onChange={(e) => setModalSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (modalSubtaskInput.trim()) {
                          setNewTask(prev => ({
                            ...prev,
                            subtasks: [...prev.subtasks, {
                              id: `st-init-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                              title: modalSubtaskInput.trim(),
                              completed: false
                            }]
                          }));
                          setModalSubtaskInput('');
                        }
                      }
                    }}
                    placeholder={t('subtaskPlaceholder')}
                    className="flex-1 p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#FF6500]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (modalSubtaskInput.trim()) {
                        setNewTask(prev => ({
                          ...prev,
                          subtasks: [...prev.subtasks, {
                            id: `st-init-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                            title: modalSubtaskInput.trim(),
                            completed: false
                          }]
                        }));
                        setModalSubtaskInput('');
                      }
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-[#FF6500] hover:text-white text-slate-700 font-bold rounded-lg transition-colors cursor-pointer text-xs shrink-0 inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t('addSubtask')}</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl font-bold">
                  {isRtl ? 'إلغاء' : 'Dismiss'}
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: 'var(--brand-secondary, #FF6500)' }}
                  className="px-5 py-2 rounded-xl hover:opacity-90 text-white font-black cursor-pointer shadow-sm transition-all"
                >
                  {isRtl ? 'اعتماد المهمة' : 'Schedule Task'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
