import React, { useState } from 'react';
import { Calendar, Plus, Trash2, CheckCircle2, Clock, Copy, Sparkles, Smile } from 'lucide-react';
import { ScheduleEvent } from '../types';
import { DEFAULT_SCHEDULE } from '../data';

export default function Scheduler() {
  const [events, setEvents] = useState<ScheduleEvent[]>(DEFAULT_SCHEDULE);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('04:00 PM');
  const [newDuration, setNewDuration] = useState(30);
  const [newCategory, setNewCategory] = useState<'study' | 'yoga' | 'rest' | 'craft' | 'school'>('study');
  const [copied, setCopied] = useState(false);

  const addEvent = () => {
    if (!newTitle.trim()) return;
    const newEv: ScheduleEvent = {
      id: 'custom-' + Date.now(),
      title: newTitle.trim(),
      time: newTime,
      durationMinutes: newDuration,
      category: newCategory,
      done: false
    };
    setEvents([...events, newEv]);
    setNewTitle('');
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const toggleEventDone = (id: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, done: !e.done } : e));
  };

  // Allow student to copy alarms to clipboard so they can put it in their phone or alarm app
  const copyAlarms = () => {
    const textFormat = events
      .map(e => `⏰ ${e.time} - [${e.category.toUpperCase()}] ${e.title} (${e.durationMinutes} mins)`)
      .join('\n');
    
    navigator.clipboard.writeText(textFormat);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Style colors for schedule categories on Dribbble Kid UI elements
  const categoryBadges: Record<string, { bg: string; text: string; border: string }> = {
    study: { bg: 'bg-[#E8E9FF]', text: 'text-[#3D408B]', border: 'border-[#C3C6FF]' },
    yoga: { bg: 'bg-[#E6F8F0]', text: 'text-[#1E5D43]', border: 'border-[#B5E9D2]' },
    rest: { bg: 'bg-[#FFEAD2]', text: 'text-[#86511F]', border: 'border-[#FFC8A2]' },
    craft: { bg: 'bg-[#FCEAF0]', text: 'text-[#8C234C]', border: 'border-[#F9C3D6]' },
    school: { bg: 'bg-[#E3F4FC]', text: 'text-[#1B4E6B]', border: 'border-[#BBE0F2]' }
  };

  return (
    <div className="bg-[#FFFFFD] rounded-[24px] p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-md shadow-orange-900/5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b-2 border-[#FFF0E2] pb-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📆</span>
          <h2 className="text-xl font-bold text-[#3B2C24]">My Kids Daily Planner</h2>
        </div>
        <button
          id="copy-alarms-btn"
          onClick={copyAlarms}
          className="flex items-center gap-1.5 bg-[#FFF9EC] border-2 border-[#FFD56B] text-[#8C6D1F] text-xs font-bold px-4 py-2.5 rounded-full cursor-pointer hover:bg-[#FFF5D1] transition active:scale-95 shadow-sm"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>{copied ? 'Copied to clipboard! ✨' : 'Copy Routine Alarms'}</span>
        </button>
      </div>

      <p className="text-[#8C7A6E] text-xs mb-6 leading-relaxed font-medium">
        Let's allocate steady study blocks, yoga stretches, fun craft projects, and good sleep windows. 
        Tick the check circles to make progress!
      </p>

      {/* Scheduler Form Creator */}
      <div className="bg-[#FFFDF9] p-5 rounded-[20px] mb-6 border-2 border-[#FFE2C5] text-xs shadow-xs">
        <span className="font-bold text-[#FF6A1A] block mb-4 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-[#FFE2C5] pb-2">
          <Sparkles className="w-4 h-4 text-[#FFB300] animate-pulse" />
          Plan An Activity Block
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[#5D4E41] font-bold mb-1.5 ml-1">Activity Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g., Read NCERT light reflection"
              className="w-full px-4 py-2.5 rounded-full bg-white border-2 border-[#FFE0D0] focus:outline-none focus:border-[#FFB390] text-xs text-slate-800 font-medium placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block text-[#5D4E41] font-bold mb-1.5 ml-1 flex justify-between">
              <span>Category type</span>
              <span className="text-[10px] text-amber-600 font-bold">Class 6 dojo</span>
            </label>
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-full bg-white border-2 border-[#FFE0D0] focus:outline-none focus:border-[#FFB390] text-xs text-slate-800 font-medium cursor-pointer"
            >
              <option value="study">📚 Study (NCERT Prep)</option>
              <option value="yoga">🧘 Yoga & Breath Stretch</option>
              <option value="rest">🍪 Chill / Panda Snacks</option>
              <option value="craft">🎨 Creative Craft / Play</option>
              <option value="school">🏫 School Time</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-[#5D4E41] font-bold mb-1.5 ml-1">Reminder Alarm</label>
            <input
              type="text"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              placeholder="e.g., 04:30 PM"
              className="w-full px-4 py-2.5 rounded-full bg-white border-2 border-[#FFE0D0] focus:outline-none focus:border-[#FFB390] text-xs text-slate-800 font-medium placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block text-[#5D4E41] font-bold mb-1.5 ml-1">Duration (minutes)</label>
            <input
              type="number"
              value={newDuration}
              onChange={e => setNewDuration(Number(e.target.value))}
              placeholder="30"
              className="w-full px-4 py-2.5 rounded-full bg-white border-2 border-[#FFE0D0] focus:outline-none focus:border-[#FFB390] text-xs text-slate-800 font-medium placeholder-slate-400"
            />
          </div>
        </div>

        <button
          id="add-event-btn"
          onClick={addEvent}
          className="w-full bg-[#FF6A1A] hover:bg-[#E85B12] text-white font-bold py-3 rounded-full transition cursor-pointer text-xs uppercase tracking-wider shadow-md transform active:scale-98"
        >
          Add to Daily Schedule
        </button>
      </div>

      {/* Routine list */}
      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 font-sans">
        {events.map((event) => {
          const badge = categoryBadges[event.category] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
          return (
            <div
              key={event.id}
              className={`flex items-center justify-between p-4 rounded-[20px] border-2 transition-all duration-200 ${
                event.done
                  ? 'bg-[#E6F8F2]/40 border-[#B5E9D2] opacity-75 shadow-none'
                  : 'bg-white border-[#FFE8D6] hover:border-[#FFDEC4] shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => toggleEventDone(event.id)}
                  className="text-slate-400 hover:text-slate-900 cursor-pointer transition-transform duration-150 transform active:scale-95"
                >
                  <CheckCircle2
                    className={`w-5 h-5 ${event.done ? 'text-emerald-500 fill-emerald-100' : 'text-slate-350'}`}
                  />
                </button>
                <div>
                  <span
                    className={`text-xs font-bold block capitalize ${
                      event.done ? 'line-through text-slate-400 font-medium' : 'text-slate-800'
                    }`}
                  >
                    {event.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[#8C7A6E] flex items-center gap-0.5 font-bold font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#FF6A1A]" />
                      {event.time} ({event.durationMinutes} mins)
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border-2 font-bold uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}>
                      {event.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {event.id.startsWith('custom-') && (
                  <button
                    onClick={() => removeEvent(event.id)}
                    className="p-2 hover:bg-red-55 text-red-400 hover:text-red-600 rounded-full cursor-pointer transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="text-center py-9 border-2 border-dashed border-[#FFE2C5] rounded-[20px] bg-[#FFFDF9]">
            <Smile className="w-7 h-7 text-amber-300 mx-auto mb-1.5 animate-bounce" />
            <span className="text-xs text-[#8C7A6E] font-bold block">Schedule is empty. Add events above!</span>
          </div>
        )}
      </div>
    </div>
  );
}
