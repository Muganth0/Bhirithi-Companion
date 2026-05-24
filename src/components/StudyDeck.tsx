/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, HelpCircle, ChevronRight, Lightbulb, CheckCircle2, Bookmark, Award, Sparkles } from 'lucide-react';
import { NCERTChapter, PracticeQuestion } from '../types';
import { NCERT_DATA } from '../data';

export default function StudyDeck() {
  const [chapters] = useState<NCERTChapter[]>(NCERT_DATA);
  const [selectedSubject, setSelectedSubject] = useState<'Math' | 'Science'>('Math');
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);

  // Practice state
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(-1); // -1 means no hints yet, 0 is first hint, up to 3
  const [studentInput, setStudentInput] = useState('');
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const filteredChapters = chapters.filter(ch => ch.subject === selectedSubject);
  const currentChapter = filteredChapters[selectedChapterIdx] || filteredChapters[0];

  const handleChapterChange = (idx: number) => {
    setSelectedChapterIdx(idx);
    setActiveQuestionIdx(0);
    setStudentInput('');
    setAnsweredCorrectly(null);
    setRevealedHintIndex(-1);
    setShowSolution(false);
  };

  const handleSubjectChange = (subject: 'Math' | 'Science') => {
    setSelectedSubject(subject);
    setSelectedChapterIdx(0);
    setActiveQuestionIdx(0);
    setStudentInput('');
    setAnsweredCorrectly(null);
    setRevealedHintIndex(-1);
    setShowSolution(false);
  };

  const handleNextQuestion = () => {
    if (activeQuestionIdx < currentChapter.practiceQuestions.length - 1) {
      setActiveQuestionIdx(prev => prev + 1);
      setStudentInput('');
      setAnsweredCorrectly(null);
      setRevealedHintIndex(-1);
      setShowSolution(false);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx(prev => prev - 1);
      setStudentInput('');
      setAnsweredCorrectly(null);
      setRevealedHintIndex(-1);
      setShowSolution(false);
    }
  };

  const checkAnswer = () => {
    if (!studentInput.trim()) return;
    const currentQ = currentChapter.practiceQuestions[activeQuestionIdx];
    
    // Normalize and do soft check:
    const normalizedInput = studentInput.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedAnswer = currentQ.solution.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check if input contains substantial answer content or exact match
    if (normalizedInput === normalizedAnswer || normalizedAnswer.includes(normalizedInput)) {
      setAnsweredCorrectly(true);
    } else {
      setAnsweredCorrectly(false);
    }
  };

  const currentQ: PracticeQuestion = currentChapter.practiceQuestions[activeQuestionIdx];

  const triggerNextHint = () => {
    if (currentQ && revealedHintIndex < currentQ.hints.length - 1) {
      setRevealedHintIndex(prev => prev + 1);
    }
  };

  return (
    <div className="bg-[#FFFFFD] rounded-[24px] p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-md shadow-orange-900/5 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b-2 border-[#FFF0E2] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <h2 className="text-xl font-bold text-[#3B2C24] tracking-tight">NCERT Homework Practice Studio</h2>
          </div>
          <p className="text-[#8C7A6E] text-xs mt-1 leading-relaxed">
            Aligned with the CBSE Class 6 syllabus to support reasoning-based inquiry with friendly stepwise clues!
          </p>
        </div>

        {/* Subject selectors - bouncy pills */}
        <div className="flex gap-2 bg-[#FFF6EE] p-1.5 rounded-full border border-[#FFF0E2] w-full md:w-auto">
          <button
            onClick={() => handleSubjectChange('Math')}
            className={`flex-1 md:flex-initial px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer border-2 ${
              selectedSubject === 'Math' 
                ? 'bg-[#FF6A1A] text-white border-[#FF6A1A] shadow-sm' 
                : 'bg-white text-[#8C7A6E] border-transparent hover:bg-white/80'
            }`}
          >
            📐 Math
          </button>
          <button
            onClick={() => handleSubjectChange('Science')}
            className={`flex-1 md:flex-initial px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer border-2 ${
              selectedSubject === 'Science' 
                ? 'bg-[#7A61FF] text-white border-[#7A61FF] shadow-sm' 
                : 'bg-white text-[#8C7A6E] border-transparent hover:bg-white/80'
            }`}
          >
            🔬 Science
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Chapter Index and Cheat Notes */}
        <div className="lg:col-span-4 space-y-4">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block ml-1">
            Choose Lesson Chapter (NCERT v1)
          </span>

          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
            {filteredChapters.map((ch, idx) => {
              const isActive = currentChapter.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChapterChange(idx)}
                  className={`w-full text-left p-4 rounded-[18px] transition cursor-pointer border-2 flex flex-col ${
                    isActive
                      ? 'bg-[#E8E9FF] border-[#C3C6FF] text-[#3D408B] font-medium shadow-xs'
                      : 'bg-[#FFFBF7] hover:bg-[#FFFDFB] border-[#FFDEC4] text-[#5D4E41]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bookmark className={`w-3.5 h-3.5 ${isActive ? 'text-[#3D408B]' : 'text-amber-500'}`} />
                    <span className="font-bold text-xs">Ch {ch.number}: {ch.title}</span>
                  </div>
                  <span className={`text-[10px] mt-1.5 ml-5 truncate block ${isActive ? 'text-[#6164C1]' : 'text-slate-400'}`}>
                    Topics: {ch.topics.join(', ')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick study summary box - Beautiful cozy yellow pillow */}
          <div className="bg-[#FFFDEE] p-4 rounded-[20px] border-2 border-[#FFEFC2]">
            <span className="font-bold text-[#8C6D1F] text-[11px] uppercase tracking-wider block mb-1.5 flex items-center gap-2 border-b border-[#FFEFC2] pb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB300] animate-pulse" />
              Panda\'s Homework Bullet Tips
            </span>
            <p className="text-[#8C7D52] text-[11px] leading-relaxed font-medium">
              {currentChapter.notesSnippet}
            </p>
          </div>
        </div>

        {/* Right column: Multi-hint Scaffolding practice window - Cute dreamy blue card */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#FAF9FF] to-[#F2F4FF] rounded-[22px] p-5 sm:p-6 border-2 border-[#D9DCFF] flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-[#555099] uppercase tracking-wider">
                Interactive Practice Deck
              </span>
              <span className="text-[10.5px] font-bold text-[#4F4A96] bg-[#E1E4FF] px-3 py-1 rounded-full border border-[#C5CAFF]">
                Problem {activeQuestionIdx + 1} of {currentChapter.practiceQuestions.length}
              </span>
            </div>

            {/* Question Text Cloud Box */}
            <div className="bg-white p-5 rounded-[18px] border-2 border-[#E1E4FF] shadow-xs mb-4">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-[#4A47A3] mt-0.5 flex-shrink-0" />
                <p id="question-text" className="font-bold text-xs text-[#2B2961] leading-relaxed">
                  {currentQ?.question}
                </p>
              </div>
            </div>

            {/* Scaffolding Clues Box */}
            <div className="bg-white p-4 sm:p-5 rounded-[18px] border-2 border-dashed border-[#C5CAFF] mb-4">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#EEF0FF]">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-[#D32F2F] animate-pulse" />
                  <span className="font-bold text-xs text-[#3B2C24]">Clue Scaffolding ({revealedHintIndex + 1}/{currentQ?.hints.length})</span>
                </div>
                
                {/* Scaffold hint triggers */}
                {revealedHintIndex < (currentQ?.hints.length - 1) && (
                  <button
                    id="trigger-hint-btn"
                    onClick={triggerNextHint}
                    className="text-[9px] font-bold uppercase tracking-wider text-[#FF6A1A] bg-[#FFEAE0] hover:bg-[#FFDFC4] border-2 border-[#FFDEC4] px-3 py-1.5 rounded-full cursor-pointer transition active:scale-95 duration-100"
                  >
                    Reveal Next Small Hint ✨
                  </button>
                )}
              </div>

              {/* Incremental hint blocks */}
              <div className="space-y-2">
                {currentQ?.hints.map((hint, hIdx) => {
                  if (hIdx > revealedHintIndex) return null;
                  return (
                    <div
                      key={hIdx}
                      className="p-3 bg-[#FFFDF8] text-[#554A42] text-xs rounded-[12px] flex items-start gap-2.5 border-2 border-[#FFE8D6] shadow-xs"
                    >
                      <span className="font-bold text-white bg-[#FF8038] rounded-full w-5 h-5 text-[9px] flex items-center justify-center flex-shrink-0 shadow-xs">
                        {hIdx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{hint}</span>
                    </div>
                  );
                })}

                {revealedHintIndex === -1 && (
                  <div className="text-center py-5 bg-[#FAF9FF] rounded-[12px] border-2 border-dashed border-[#E1E4FF]">
                    <span className="text-[10px] text-[#7874C1] font-medium block">Feeling stuck with homework calculations?</span>
                    <span className="text-[10px] text-[#A29ED6] block mt-0.5">Click "Reveal Next Small Hint" to take small steps together with Panda.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Answer check system */}
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-bold uppercase text-[#736FBF] tracking-wider block ml-1">Your Final Solved Answer Draft:</label>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={studentInput}
                  onChange={e => setStudentInput(e.target.value)}
                  placeholder="e.g., 50 (or type terms like light reflection)"
                  className="flex-1 px-4 py-3 text-xs rounded-full border-2 border-[#D9DCFF] outline-none bg-white focus:border-[#7A61FF] text-[#2B2961] font-bold placeholder-[#A6AADB]"
                />
                <button
                  id="check-answer-btn"
                  onClick={checkAnswer}
                  className="bg-[#FF6A1A] hover:bg-[#E85B12] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full cursor-pointer transition shadow-md active:scale-95 duration-150"
                >
                  Verify! 🐼
                </button>
              </div>

              {/* Feedback responses */}
              {answeredCorrectly !== null && (
                <div className={`p-4 rounded-[16px] text-xs flex gap-2.5 items-center ${
                  answeredCorrectly 
                    ? 'bg-[#E6F8F0] text-[#1E5D43] border-2 border-[#B5E9D2]' 
                    : 'bg-[#FFF2F2] text-[#A62626] border-2 border-[#F9C3C3]'
                }`}>
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 animate-bounce" />
                  <div>
                    {answeredCorrectly ? (
                      <div>
                        <strong className="block text-sm mb-0.5">Perfect Calculation! 🎉</strong> Panda Dojo high-fives you. Your logical progression is completely sound!
                      </div>
                    ) : (
                      <div>
                        <strong className="block text-sm mb-0.5">Keep trying, superstar! 🌟</strong> Compare your steps with the clues, or review the complete solution below.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Show full verified textbook solution explicitly */}
            {showSolution ? (
              <div className="p-4 bg-[#FFFBF0] border-2 border-[#FFE8D6] rounded-[16px] text-xs">
                <span className="font-bold text-[#8C5E28] uppercase tracking-wider text-[9px] block mb-1">Standard CBSE Textbook Solution Steps:</span>
                <p className="text-[#6B4B27] font-medium leading-relaxed italic">{currentQ?.solution}</p>
              </div>
            ) : (
              <div className="text-right">
                <button
                  id="toggle-solution-btn"
                  onClick={() => setShowSolution(true)}
                  className="text-[10px] text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
                >
                  Show complete textbook verified steps
                </button>
              </div>
            )}
          </div>

          {/* Nav buttons footer */}
          <div className="flex justify-between items-center border-t-2 border-[#E8EAFF] pt-4 mt-4">
            <button
              onClick={handlePrevQuestion}
              disabled={activeQuestionIdx === 0}
              className={`px-4.5 py-2 rounded-full text-xs font-bold cursor-pointer transition active:scale-95 border-2 ${
                activeQuestionIdx === 0 
                  ? 'text-slate-350 bg-slate-100 border-slate-200 pointer-events-none' 
                  : 'text-[#8C7A6E] bg-white border-[#E9E4DC] hover:bg-[#FFFBF7]'
              }`}
            >
              ← Back
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={activeQuestionIdx === currentChapter.practiceQuestions.length - 1}
              className={`px-4.5 py-2 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer border-2 transition active:scale-95 ${
                activeQuestionIdx === currentChapter.practiceQuestions.length - 1 
                  ? 'text-slate-350 bg-slate-100 border-slate-200 pointer-events-none' 
                  : 'text-white bg-[#7A61FF] border-[#7F64FF] hover:bg-[#684CFF]'
              }`}
            >
              <span>Next Core Problem</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

