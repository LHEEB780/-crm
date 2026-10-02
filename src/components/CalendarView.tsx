/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, CheckCircle, Clock, ChevronLeft, ChevronRight, 
  MapPin, UserCheck, Plus, Sparkles, Filter
} from 'lucide-react';
import { translations } from '../locales';
import { Task, User, Client } from '../types';

interface CalendarProps {
  tasks: Task[];
  users: User[];
  clients: Client[];
  language: 'ar' | 'en';
  onAddTask: (data: any) => void;
}

export default function CalendarView({
  tasks,
  users,
  clients,
  language,
  onAddTask
}: CalendarProps) {
  const t = (key: string) => translations[key]?.[language] || key;
  const isRtl = language === 'ar';

  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month');
  
  // Hardcoded calendar reference focal month: June 2026 (matching mock timeline context)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed being index 5)

  // Creation pop-open
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_to_id: '',
    client_id: ''
  });

  const monthsListAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const monthsListEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const daysWeekAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const daysWeekEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getMonthName = () => {
    return isRtl ? monthsListAr[currentMonth] : monthsListEn[currentMonth];
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({
      ...newTask,
      status: 'pending',
      assigned_to_id: newTask.assigned_to_id ? Number(newTask.assigned_to_id) : undefined,
      client_id: newTask.client_id ? Number(newTask.client_id) : undefined,
      due_date: new Date(newTask.due_date).toISOString()
    });
    setNewTask({ title: '', description: '', priority: 'medium', due_date: '', assigned_to_id: '', client_id: '' });
    setScheduleModalOpen(false);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Helper calendar calculations
  const calendarCells: Array<number | null> = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Filter tasks scheduled specifically on a day
  const getTasksForDay = (dayNum: number) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return taskDate.getFullYear() === currentYear &&
             taskDate.getMonth() === currentMonth &&
             taskDate.getDate() === dayNum;
    });
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const handleCellClick = (dayNum: number) => {
    const formattedD = dayNum < 10 ? `0${dayNum}` : dayNum;
    const formattedM = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : (currentMonth + 1);
    const dateStr = `${currentYear}-${formattedM}-${formattedD}T10:00`;
    setSelectedCalendarDate(`${currentYear}-${formattedM}-${formattedD}`);
    setNewTask(prev => ({ ...prev, due_date: dateStr }));
    setScheduleModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs font-serif">
      
      {/* TOP INLINE HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t('calendar')}</span>
            <Calendar className="w-5 h-5 text-[#FF6500]" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl ? 'عرض ومتابعة مواعيد تسليم الصفقات، وترتيب المهام، واجتماعات المبيعات المجدولة بمزامنة حية.' : 'Comprehensive calendar scheduler to monitor sales meetups, due deadlines and action alerts'}
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-[10px] font-bold self-start md:self-auto gap-1">
          <button
            onClick={() => setViewType('month')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewType === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {isRtl ? 'عرض شهري' : 'Month View'}
          </button>
          <button
            onClick={() => setViewType('week')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewType === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {isRtl ? 'عرض أسبوعي' : 'Week View'}
          </button>
          <button
            onClick={() => setViewType('day')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewType === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {isRtl ? 'عرض يومي' : 'Day View'}
          </button>
        </div>
      </div>

      {/* CALENDAR MONTH SELECTOR BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Calendar title with loaded month */}
          <span className="font-extrabold text-base text-slate-900">{getMonthName()} {currentYear}</span>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RENDER VIEW: MONTH MATRIX */}
      {viewType === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-250 overflow-hidden shadow-xs">
          {/* Days week names */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center py-2.5 font-bold text-slate-500">
            {(isRtl ? daysWeekAr : daysWeekEn).map((dw, u) => (
              <span key={u} className="text-[10px] tracking-widest">{dw}</span>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 border-collapse">
            {calendarCells.map((cell, idx) => {
              const dayTasks = cell ? getTasksForDay(cell) : [];
              return (
                <div 
                  key={idx} 
                  onClick={() => cell && handleCellClick(cell)}
                  className={`min-h-[100px] p-2.5 transition-colors group cursor-pointer text-start flex flex-col justify-between ${
                    cell ? 'bg-white hover:bg-orange-50/10' : 'bg-slate-50/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-mono text-sm font-bold ${cell ? 'text-slate-800' : 'text-slate-300'}`}>
                      {cell || ''}
                    </span>
                    {cell && (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-[#FF6500] font-bold">
                        + {isRtl ? 'أضف مهمة' : 'Schedule'}
                      </span>
                    )}
                  </div>

                  {/* Tasks nested list alerts for Month cell */}
                  {cell && dayTasks.length > 0 && (
                    <div className="mt-1.5 space-y-1 overflow-y-auto max-h-[70px]">
                      {dayTasks.map(task => (
                        <div 
                          key={task.id} 
                          title={task.title}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold truncate ${getPriorityBgColor(task.priority)}`}
                        >
                          {task.status === 'completed' ? '✓ ' : ''} {task.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER VIEW: WEEKLY GRID MOCK */}
      {viewType === 'week' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <p className="text-slate-400 font-semibold">{isRtl ? 'جدول المواعيد الأسبوعية النشطة' : 'Weekly dynamic schedule agenda:'}</p>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {(isRtl ? daysWeekAr : daysWeekEn).map((dayName, index) => {
              // lets simulate week started June 07
              const dayNum = 7 + index;
              const dayTasks = getTasksForDay(dayNum);
              return (
                <div key={index} className="p-4 border border-slate-200 rounded-xl bg-slate-50/40 space-y-3 min-h-[220px]">
                  <div className="border-b border-slate-100 pb-1.5 flex justify-between items-center font-bold text-slate-800">
                    <span>{dayName}</span>
                    <span className="font-mono text-[#FF6500] bg-orange-50 px-1 rounded">June {dayNum}</span>
                  </div>

                  <div className="space-y-2">
                    {dayTasks.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic mt-4 text-center">{isRtl ? 'لا توجد مهام' : 'No meetings'}</p>
                    ) : (
                      dayTasks.map(task => (
                        <div key={task.id} className={`p-2 rounded-lg border bg-white ${task.priority === 'urgent' ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-orange-500'}`}>
                          <p className="font-bold text-[9px] text-slate-800 truncate">{task.title}</p>
                          <span className="text-[8px] text-slate-400 block mt-1">🕒 {new Date(task.due_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER VIEW: DAILY GRID MOCK */}
      {viewType === 'day' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-250 shadow-xs space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-800">{isRtl ? 'أجندة اليوم لخدمة العملاء' : 'Daily appointment scheduler:'}</span>
            <span className="px-2 py-0.5 bg-orange-50 text-[#FF6500] font-bold rounded">June 10, 2026</span>
          </div>

          <div className="space-y-4">
            {/* Hour Block 1: 9:00 AM */}
            <div className="flex gap-4 border-l border-slate-200 pl-4 relative">
              <span className="font-mono text-slate-400 font-bold w-16 text-end">09:00 AM</span>
              <div className="flex-1 p-3 border border-slate-150 rounded-xl bg-orange-50/20 text-slate-700">
                <p className="font-bold">{isRtl ? 'الاجتماع الصباحي الداخلي للمبيعات' : 'Sales internal alignment syncup'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">الرياض، مقر الإدارة العامة</p>
              </div>
            </div>

            {/* Hour Block 2: 2:00 PM */}
            <div className="flex gap-4 border-l border-slate-200 pl-4 relative">
              <span className="font-mono text-slate-400 font-bold w-16 text-end">02:00 PM</span>
              <div className="flex-1 p-3 border border-slate-150 rounded-xl bg-blue-50/20 text-slate-700">
                <p className="font-bold">{isRtl ? 'مقابلات STC لتحديث السيرفرات' : 'STC Enterprise server license specs meet'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Online via Teams meeting portal</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULING CALENDAR MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-slide-in">
            <div className="p-5 bg-[#0B192C] text-white flex justify-between items-center">
              <h3 className="font-extrabold tracking-tight flex items-center gap-2">
                <Sparkles className="text-[#FF6500] w-5 h-5" />
                <span>{isRtl ? `تسجيل لقاء/مهمة بتاريخ: ${selectedCalendarDate}` : `Add Schedule for: ${selectedCalendarDate}`}</span>
              </h3>
              <button onClick={() => setScheduleModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4 font-serif">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">{t('taskTitle')} *</label>
                <input
                  type="text" required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  placeholder="مكالمة ترحيبية بالعميل الجديد"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Description description</label>
                <input
                  type="text"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">{t('priority')}</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">{t('dueDate')} *</label>
                  <input
                    type="datetime-local" required
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono"
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
                    <option value="">Choose User</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Linked Client</label>
                  <select
                    value={newTask.client_id}
                    onChange={(e) => setNewTask({...newTask, client_id: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">Choose Client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setScheduleModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl font-bold">
                  {isRtl ? 'إلغاء' : 'Dismiss'}
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#FF6500] hover:bg-orange-600 text-white font-black cursor-pointer">
                  {isRtl ? 'حجز الموعد' : 'Schedule Event'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
