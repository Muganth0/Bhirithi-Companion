import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, RotateCcw, AlertTriangle, Trophy, Eye, CheckCircle, Timer } from 'lucide-react';
import { YogaSequence, YogaPose } from '../types';
import { YOGA_DATA } from '../data';
import { motion, AnimatePresence } from 'motion/react';

export default function YogaStudio() {
  const [sequences] = useState<YogaSequence[]>(YOGA_DATA);
  const [selectedSequence, setSelectedSequence] = useState<YogaSequence>(YOGA_DATA[0]);
  const [activePoseIdx, setActivePoseIdx] = useState(0);

  // Breathing Visualizer State
  const [breatheCycle, setBreatheCycle] = useState<'Inhale' | 'Hold' | 'Exhale' | 'HoldOut'>('Inhale');
  const [breatheTimerVal, setBreatheTimerVal] = useState(4);
  const breatheIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Active post timer state
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const poseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound generator
  const playBeep = (freq: number, type: 'sine' | 'square' | 'triangle' = 'sine', duration: number = 0.15) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio permission or unsupported context handled gracefully
    }
  };

  // Breathing ticker
  useEffect(() => {
    breatheIntervalRef.current = setInterval(() => {
      setBreatheTimerVal((prev) => {
        if (prev <= 1) {
          // Play state transition alert
          playBeep(440, 'triangle', 0.1);
          setBreatheCycle((currentCycle) => {
            if (currentCycle === 'Inhale') return 'Hold';
            if (currentCycle === 'Hold') return 'Exhale';
            if (currentCycle === 'Exhale') return 'HoldOut';
            return 'Inhale';
          });
          return 4; // standard 4s block of box breathing
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (breatheIntervalRef.current) clearInterval(breatheIntervalRef.current);
    };
  }, []);

  // Countdown pose timer
  useEffect(() => {
    if (timerIsRunning) {
      poseTimerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            playBeep(880, 'sine', 0.5); // high pitch target bell
            setTimerIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (poseTimerRef.current) clearInterval(poseTimerRef.current);
    }

    return () => {
      if (poseTimerRef.current) clearInterval(poseTimerRef.current);
    };
  }, [timerIsRunning]);

  const selectSequence = (seq: YogaSequence) => {
    setSelectedSequence(seq);
    setActivePoseIdx(0);
    setSecondsRemaining(seq.poses[0]?.durationSeconds || 60);
    setTimerIsRunning(false);
  };

  const selectPose = (idx: number) => {
    setActivePoseIdx(idx);
    setSecondsRemaining(selectedSequence.poses[idx]?.durationSeconds || 60);
    setTimerIsRunning(false);
  };

  const activePose: YogaPose = selectedSequence.poses[activePoseIdx];

  const getBreatheStyles = () => {
    switch (breatheCycle) {
      case 'Inhale':
        return { 
          label: 'Soft Inhale 🌬️', 
          color: 'from-[#FF9854] to-[#FF6A1A] shadow-orange-200', 
          textClr: 'text-[#FF6A1A] font-bold' 
        };
      case 'Hold':
        return { 
          label: 'Hold the light 🌟', 
          color: 'from-[#9D80FE] to-[#7A61FF] shadow-indigo-200', 
          textClr: 'text-[#7A61FF] font-bold' 
        };
      case 'Exhale':
        return { 
          label: 'Steady Outhale 🍃', 
          color: 'from-[#5BC7F9] to-[#1EAFD5] shadow-[#C2F2FF]', 
          textClr: 'text-[#1EAFD5] font-bold' 
        };
      case 'HoldOut':
        return { 
          label: 'Cozy Rest 🧘', 
          color: 'from-[#4CD69B] to-[#1D5E41] shadow-emerald-200', 
          textClr: 'text-[#1D5E41] font-bold' 
        };
    }
  };

  const breatheStyle = getBreatheStyles();

  return (
    <div className="bg-[#FFFFFD] rounded-[24px] p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-md grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* Left: Sequences and Poses */}
      <div className="lg:col-span-7 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🧘</span>
            <h2 className="text-xl font-bold text-[#3B2C24] tracking-tight">Bhirithi's National Yoga Dojo</h2>
          </div>

          <p className="text-[#8C7A6E] text-xs mb-4 leading-relaxed font-medium">
            Welcome, Champion Bhirithi! Perfect your national-caliber alignments, take a calming breath, and maybe show your brother Viransh how to hold an easy tree pose!
          </p>

          {/* Sequence Selectors */}
          <div className="flex flex-wrap gap-2.5 mb-5">
            {sequences.map((seq) => {
              const isActive = selectedSequence.id === seq.id;
              return (
                <button
                  key={seq.id}
                  id={`seq-${seq.id}`}
                  onClick={() => selectSequence(seq)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 border-2 transform active:scale-95 duration-100 ${
                    isActive
                      ? 'bg-[#7A61FF] text-white border-[#7A61FF] shadow-xs'
                      : 'bg-[#FFFBF7] hover:bg-white text-[#8C7A6E] border-[#FFE8D6]'
                  }`}
                >
                  <span className="text-sm">{seq.emoji}</span>
                  <span>{seq.title}</span>
                </button>
              );
            })}
          </div>

          {/* Safety disclaimer banner */}
          <div className="bg-[#FFFDEE] rounded-[18px] p-4 border-2 border-[#FFEFC2] mb-5 flex gap-3 text-xs leading-relaxed text-[#8C7D52]">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 animate-bounce" />
            <div>
              <span className="font-bold text-[#8C6D1F] block mb-0.5">Panda's Yoga Safety Tip</span>
              Breathe softly through your nose. Keep moves comfortable. If any pose feels tricky or pulls, stop right away and ask your physical coach or parent/guardian!
            </div>
          </div>

          {/* Active Sequence Information */}
          <div className="bg-[#FFF9F4] rounded-[18px] p-4 border-2 border-[#FFE5D3] mb-5 text-xs">
            <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-[#FFE5D3]">
              <span className="font-bold text-[#8C5E3D] uppercase tracking-wider text-[10px]">Target Class: {selectedSequence.title}</span>
              <span className="text-[#A27756] font-bold flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-amber-500" />
                Est. {selectedSequence.durationMinutes} Mins
              </span>
            </div>
            <p className="text-[#8C7A6E] italic mb-3.5 leading-relaxed">{selectedSequence.description}</p>
            
            {/* Poses horizontal timeline selectors */}
            <div className="grid grid-cols-3 gap-2.5">
              {selectedSequence.poses.map((pose, idx) => {
                const isActive = activePoseIdx === idx;
                return (
                  <button
                    key={pose.name}
                    onClick={() => selectPose(idx)}
                    className={`p-3.5 rounded-[16px] border-2 transition cursor-pointer flex flex-col items-center transform active:scale-95 duration-100 ${
                      isActive
                        ? 'bg-[#7A61FF] text-white border-[#7A61FF] shadow-xs'
                        : 'bg-white hover:bg-[#FFFDFB] border-[#FFDEC4] text-[#5D4E41]'
                    }`}
                  >
                    <span className="text-2xl block mb-1.5 text-center filter drop-shadow-sm">{pose.emoji}</span>
                    <span className={`font-bold text-[10px] block truncate text-center w-full ${isActive ? 'text-white' : 'text-[#8C7A6E]'}`}>{pose.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Active Pose details & active countdown */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedSequence.id}-${activePoseIdx}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="p-4 sm:p-5 bg-[#FFFDFB] rounded-[22px] border-2 border-[#FFE8D6]"
          >
            <div className="flex justify-between items-start mb-3.5">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-0.5">
                  Active Pose Exercise ({activePoseIdx + 1}/{selectedSequence.poses.length})
                </span>
                <h3 className="text-lg font-bold text-[#3B2C24] tracking-tight flex items-center gap-2">
                  <span className="text-2xl filter drop-shadow-sm">{activePose.emoji}</span>
                  <span>{activePose.name}</span>
                </h3>
              </div>
              
              {/* Active timer values - cute children control panel */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-full border-2 border-[#FFE0D0] bg-white shadow-xs">
                <span className="font-mono text-xs font-bold text-slate-800 pr-1 pl-1">
                  {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}
                </span>
                <button
                  onClick={() => setTimerIsRunning(!timerIsRunning)}
                  className="p-1 hover:bg-[#FFF0E8] rounded-full text-[#FF6A1A] cursor-pointer transition"
                  title={timerIsRunning ? "Pause Pose Timer" : "Start Pose Timer"}
                >
                  <Play className={`w-3.5 h-3.5 ${timerIsRunning ? 'fill-[#FF6A1A] text-[#FF6A1A]' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    setTimerIsRunning(false);
                    setSecondsRemaining(activePose.durationSeconds);
                  }}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer transition"
                  title="Reset Pose Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-[16px] mb-3.5 text-xs border-2 border-[#FFF0E2]">
              <span className="font-bold text-[#3B2C24] block mb-1">Key Benefit:</span>
              <p className="text-[#8C7A6E] mb-2.5 leading-relaxed">{activePose.benefits}</p>
              <span className="font-bold text-[#3B2C24] block mb-1.5">Dojo Steps to hold:</span>
              <ol className="list-decimal pl-5 text-[#8C7A6E] space-y-1.5">
                {activePose.steps.map((step, sIdx) => (
                  <li key={sIdx} className="leading-relaxed font-medium">{step}</li>
                ))}
              </ol>
            </div>

            {/* Regional CBSE Tips */}
            <div className="bg-[#3B2C24] text-[#FFFBF5] p-3.5 rounded-[16px] text-[10.5px] flex gap-2.5 items-center border-2 border-[#291F1A]">
              <Trophy className="w-4 h-4 text-[#FFD56B] flex-shrink-0 animate-pulse" />
              <span className="font-medium">
                <strong className="text-[#FFD56B]">National Champion Alignment:</strong> Bhirithi, align your shoulders perfectly, ground your heels, and model a stunning static state for CBSE Gold!
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right: Box Breathing Visualizer - beautiful warm coral layout */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center bg-gradient-to-br from-[#FFF8F3] to-[#FFF0E4] p-6 rounded-[22px] border-2 border-[#FFE2C5] relative overflow-hidden min-h-[400px]">
        
        {/* Breathing Circle decoration background */}
        <div className="absolute top-3 left-3 bg-[#FF8038] text-white px-3.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase shadow-sm">
          Panda Box Breathing
        </div>

        {/* Dynamic Scale Box Breathe Ball */}
        <div className="relative flex items-center justify-center w-52 h-52 mb-8">
          {/* Pulsating outer bounds */}
          <motion.div
            animate={{
              scale: breatheCycle === 'Inhale' ? 1.3 : breatheCycle === 'Hold' ? 1.3 : breatheCycle === 'Exhale' ? 0.95 : 0.95,
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-[#FFE5CE]/60 blur-md"
          />

          {/* Core Animated Bubble */}
          <motion.div
            animate={{
              scale: breatheCycle === 'Inhale' ? 1.12 : breatheCycle === 'Hold' ? 1.12 : breatheCycle === 'Exhale' ? 0.9 : 0.9,
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className={`w-40 h-40 rounded-full flex flex-col items-center justify-center text-white text-center shadow-lg transition-colors duration-1000 bg-gradient-to-br ${breatheStyle.color}`}
          >
            <Wind className="w-9 h-9 opacity-90 mb-1 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">
              {breatheCycle}
            </span>
            <span className="text-4xl font-bold mt-1 tracking-tight">
              {breatheTimerVal}s
            </span>
          </motion.div>
        </div>

        {/* Directions / Labels based on Box Breathing principles */}
        <div className="text-center w-full max-w-xs bg-white rounded-[18px] p-4.5 shadow-sm border-2 border-[#FFE2C5]">
          <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase mb-1">
            Current Guidance
          </span>
          <span className={`text-sm font-bold ${breatheStyle.textClr} block`}>
            {breatheStyle.label}
          </span>
          <p className="text-[11px] text-[#8C7A6E] mt-2 leading-relaxed font-medium">
            Follow the expanding circle. Excellent for calming nerves before school exams or competition stages!
          </p>
        </div>

        {/* Quick state stats footer */}
        <div className="mt-5 flex gap-1.5 flex-wrap justify-center text-[9px] font-bold">
          <span className={`px-3 py-1 rounded-full border ${breatheCycle === 'Inhale' ? 'bg-[#FF6A1A] text-white border-[#FF6A1A]' : 'bg-white text-slate-500 border-slate-200'}`}>Inhale</span>
          <span className={`px-3 py-1 rounded-full border ${breatheCycle === 'Hold' ? 'bg-[#7A61FF] text-white border-[#7A61FF]' : 'bg-white text-slate-500 border-slate-200'}`}>Pause</span>
          <span className={`px-3 py-1 rounded-full border ${breatheCycle === 'Exhale' ? 'bg-[#1EAFD5] text-white border-[#1EAFD5]' : 'bg-white text-slate-500 border-slate-200'}`}>Exhale</span>
          <span className={`px-3 py-1 rounded-full border ${breatheCycle === 'HoldOut' ? 'bg-[#1D5E41] text-white border-[#1D5E41]' : 'bg-white text-slate-500 border-slate-200'}`}>Rest</span>
        </div>
      </div>
    </div>
  );
}
