/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Chatroom from './components/Chatroom';
import StudyDeck from './components/StudyDeck';
import StudyMedia from './components/StudyMedia';
import YogaStudio from './components/YogaStudio';
import Scheduler from './components/Scheduler';
import MoodParentHub from './components/MoodParentHub';
import RescueBeacon from './components/RescueBeacon';
import { BookOpen, Calendar, Heart, ShieldAlert, Sparkles, MessageCircleCode, Brain, Youtube } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'study' | 'media' | 'yoga' | 'routine' | 'parent'>('chat');

  const tabs = [
    { id: 'chat', label: '🐼 Panda\'s Cabin', icon: MessageCircleCode, activeColor: 'bg-[#FFEAD2] text-[#86511F] border-[#FFC8A2]' },
    { id: 'study', label: '📚 Study Studio', icon: BookOpen, activeColor: 'bg-[#E8E9FF] text-[#3D408B] border-[#C3C6FF]' },
    { id: 'media', label: '📺 Learning TV & Web', icon: Youtube, activeColor: 'bg-[#FFF2E6] text-[#A05010] border-[#FFD9B3]' },
    { id: 'yoga', label: '🧘 Yoga Dojo', icon: Brain, activeColor: 'bg-[#E6F8F2] text-[#1D5E41] border-[#B3ECD2]' },
    { id: 'routine', label: '📆 Routine & Alarms', icon: Calendar, activeColor: 'bg-[#E3F4FC] text-[#1B4D6C] border-[#BBE0F2]' },
    { id: 'parent', label: '🏡 Vibe & Parents', icon: Heart, activeColor: 'bg-[#FCEAF0] text-[#8B224B] border-[#F9C2D5]' }
  ];

  return (
    <div id="main-app" className="min-h-screen bg-gradient-to-b from-[#FFFDFB] via-[#FAF3EC] to-[#F7ECD8] text-slate-800 font-sans p-4 sm:p-8 pb-24 relative selection:bg-orange-100 selection:text-orange-950">
      
      {/* Playful Dribbble Kids Learning Header Card */}
      <header className="max-w-7xl mx-auto mb-8 bg-[#FFFFFD] border-2 border-[#FFE8D6] rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md shadow-orange-900/5 relative overflow-hidden">
        {/* Playful decorative confetti dots */}
        <div className="absolute top-2 right-12 text-xl opacity-30 select-none pointer-events-none animate-pulse">⭐️</div>
        <div className="absolute bottom-3 left-1/3 text-lg opacity-25 select-none pointer-events-none">✨</div>
        <div className="absolute top-8 left-10 w-2.5 h-2.5 rounded-full bg-amber-300 opacity-60"></div>
        <div className="absolute bottom-6 right-24 w-3.5 h-3.5 rounded-full bg-[#FFD5C2] opacity-70"></div>

        <div className="space-y-2.5 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FFEFE5] border border-[#FFD8C2] px-3.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#FF6A1A] rounded-full animate-ping"></span>
            <span className="text-[11px] font-bold text-[#FF6A1A] uppercase tracking-wider block">
              Bhirithi's Personal CBSE Class 6 Companion
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-[#3B2C24] tracking-tight font-display">
            Bhirithi's Panda Companion <span className="text-[#FF6A1A]">&</span> Dojo
          </h1>
          
          <p className="text-sm text-[#7D6B60] leading-relaxed font-normal">
            A private learning and training companion built around Bhirithi's NCERT studies, yoga journey, daily routines, wellbeing check-ins, and recent national achievement.
          </p>
        </div>

        <div className="flex items-center gap-3 border-2 border-[#FFD56B] bg-[#FFF9EC] px-4 py-3 rounded-[20px] shadow-sm relative z-10">
          <span className="text-3xl">🏅</span>
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-amber-700 block">Recent National Achievement</span>
            <span className="font-bold text-sm text-[#5D4E41] block">4th Place · 56th KVS National Sports Meet</span>
          </div>
        </div>

        <div className="flex items-center gap-4 border-2 border-[#FFDEC4] bg-[#FFFBF7] p-4 rounded-[20px] shadow-sm transform hover:rotate-2 transition relative z-10">
          <span className="text-5xl animate-bounce">🐼</span>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 block">Your Dojo Kid Partner</span>
            <span className="font-display font-medium text-sm text-[#5D4E41] italic">"Hey buddy! You've got this!"</span>
          </div>
        </div>
      </header>

      {/* Primary tab navigation bar - Bouncy tactile button capsules */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-5 py-3 text-xs font-bold whitespace-nowrap transition-all duration-250 cursor-pointer rounded-full border-2 transform active:scale-95 ${
                  isActive
                    ? `${tab.activeColor} shadow-md -translate-y-0.5 scale-[1.02]`
                    : 'bg-[#FFFFFD] hover:bg-[#FFFDFB] text-[#7D6B60] border-[#EFE7DD] hover:border-[#E1D3C2]'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'scale-110' : 'opacity-70'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main active layout component container */}
      <div className="max-w-7xl mx-auto">
        <div className="transition-all duration-150">
          {activeTab === 'chat' && <Chatroom />}
          {activeTab === 'study' && <StudyDeck />}
          {activeTab === 'media' && <StudyMedia />}
          {activeTab === 'yoga' && <YogaStudio />}
          {activeTab === 'routine' && <Scheduler />}
          {activeTab === 'parent' && <MoodParentHub />}
        </div>
      </div>

      {/* Distress emergency floating hotline button */}
      <RescueBeacon />
    </div>
  );
}
