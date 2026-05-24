import React, { useState } from 'react';
import { Smile, Frown, Meh, Sparkles, CheckSquare, Send, Mail, Copy, AlertTriangle, Play } from 'lucide-react';
import { StudentMoodRecord } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MoodParentHub() {
  // Local initial records of last week
  const [moodRecords, setMoodRecords] = useState<StudentMoodRecord[]>([
    { date: '2026-05-18', score: 4, emoji: '😊', note: 'Had fun running in physical education class today!', activities: ['Math exercise'] },
    { date: '2026-05-19', score: 3, emoji: '😐', note: 'A bit tired but completed light pinhole class.', activities: ['Science Ch 8'] },
    { date: '2026-05-20', score: 5, emoji: '🤩', note: 'Perfect score on standard matchstick puzzle!', activities: ['Math Ch 11', 'Morning Stretch'] },
    { date: '2026-05-21', score: 2, emoji: '😢', note: 'Left homework notebook at school, was worried.', activities: ['Balasana Relax'] },
    { date: '2026-05-22', score: 4, emoji: '😊', note: 'Panda cheered me up! Solved roman numerals perfectly.', activities: ['Math Ch 1'] },
    { date: '2026-05-23', score: 4, emoji: '😊', note: 'Prepared yoga pose holds for tomorrow.', activities: ['Lotus Hold Prep'] }
  ]);

  // Today tracker
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [todayEmoji, setTodayEmoji] = useState('😊');
  const [todayNote, setTodayNote] = useState('');
  const [todayActivities, setTodayActivities] = useState<string[]>([]);
  const [submittedToday, setSubmittedToday] = useState(false);

  // Parent Consent & Email Reporting
  const [hasParentalConsent, setHasParentalConsent] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReportText, setGeneratedReportText] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

  // WhatsApp dynamic state loads
  const [fatherPhone, setFatherPhone] = useState(() => localStorage.getItem('bhirithi_father_phone') || '');
  const [motherPhone, setMotherPhone] = useState(() => localStorage.getItem('bhirithi_mother_phone') || '');
  const [saveSuccess, setSaveSuccess] = useState('');

  const saveWhatsAppContacts = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('bhirithi_father_phone', fatherPhone.trim());
    localStorage.setItem('bhirithi_mother_phone', motherPhone.trim());
    setSaveSuccess('WhatsApp details saved! 🍃');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const shareReportWhatsApp = (parent: 'Father' | 'Mother') => {
    const rawNum = parent === 'Father' ? fatherPhone : motherPhone;
    if (!rawNum.trim()) {
      alert(`Oops, Bhirithi! Please save your ${parent}'s mobile number with country code first (e.g. +919876543210) so Panda can help you send the report on WhatsApp!`);
      return;
    }
    const cleanNum = rawNum.replace(/[^\d+]/g, '');
    
    // Formulate structured report text
    let reportText = `📊 PANDA STUDY & PROGRESS PROGRESS REPORT 📊\n`;
    reportText += `Hello ${parent}! Here is a quick progress and wellness log for Bhirithi:\n\n`;
    
    reportText += `🟢 ENERGY & VIBE RECORDS:\n`;
    moodRecords.forEach(rec => {
      reportText += `- ${rec.date}: (Vibe: ${rec.score}/5) ${rec.emoji} - ${rec.note || "Calm day"}\n`;
    });
    
    const uniqueActivities = Array.from(new Set(moodRecords.flatMap(r => r.activities)));
    if (uniqueActivities.length > 0) {
      reportText += `\n📖 DISCOVERIES & CHAPTER EXERCISES:\n`;
      uniqueActivities.forEach(act => {
        reportText += `- ${act}\n`;
      });
    }

    reportText += `\n🧘 YOGA STATUS: Continues training active, elite postures for national-level CBSE competitions!`;
    reportText += `\n👨‍👩‍👦 Co-Op study reminders: Positive sibling bonding and hydration prompts!`;

    const waUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanNum)}&text=${encodeURIComponent(reportText)}`;
    window.open(waUrl, '_blank');
  };

  // Activity list checkboxes
  const rawActivities = [
    { label: '📚 Chapter 1: Knowing Numbers Math', value: 'Math Ch 1' },
    { label: '📐 Chapter 11: Algebra Matchsticks', value: 'Math Ch 11' },
    { label: '🥦 Chapter 1: Food Components Science', value: 'Science Ch 1' },
    { label: '🔦 Chapter 8: Lights & Reflection', value: 'Science Ch 8' },
    { label: '🧘 Rise & Shine Yoga Flow', value: 'Yoga Wakeup' },
    { label: '🏆 Class Competition Yoga Stretches', value: 'Lotus Hold' },
    { label: '🎨 Paper Quilling / Craft Work', value: 'Fun Craft' }
  ];

  const handleEmojiSelect = (score: number, emoji: string) => {
    setTodayScore(score);
    setTodayEmoji(emoji);
  };

  const handleActivityToggle = (value: string) => {
    if (todayActivities.includes(value)) {
      setTodayActivities(todayActivities.filter(a => a !== value));
    } else {
      setTodayActivities([...todayActivities, value]);
    }
  };

  const submitTodayMood = () => {
    if (todayScore === null) return;
    const todayStr = new Date().toISOString().split('T')[0];
    
    const record: StudentMoodRecord = {
      date: todayStr,
      score: todayScore,
      emoji: todayEmoji,
      note: todayNote.trim() || 'A fine day with Panda.',
      activities: todayActivities
    };

    setMoodRecords([...moodRecords, record]);
    setSubmittedToday(true);
  };

  // Generate the parent's daily progress report (hitting full-stack server-side route)
  const generateParentReport = async () => {
    if (!hasParentalConsent) return;
    setIsGeneratingReport(true);
    setGeneratedReportText('');

    try {
      const payload = {
        moodRecords: moodRecords.map(m => ({ date: m.date, score: m.score, emoji: m.emoji })),
        studyCompleted: todayActivities.filter(a => a.startsWith('Math') || a.startsWith('Science')).join(', ') || 'NCERT math and science chapters reviewed',
        yogaMinutes: todayActivities.includes('Yoga Wakeup') || todayActivities.includes('Lotus Hold') ? 12 : 5
      };

      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setGeneratedReportText(data.report);
    } catch (e) {
      console.error(e);
      // fallback handled cleanly in server API code or local formatting
      setGeneratedReportText(`### Panda Observational Bulletin (Offline backup)

Dear Parent/Guardian,

Your child has completed active NCERT studies and breathing routines today!

- **Daily vibe rating:** 😊 (Great progress)
- **NCERT study log:** ${todayActivities.join(', ') || 'Class 6 Math Ch. 1 Practice'}
- **Panda's tips:** Advise hydrated study pauses and screen rest times.

Best wishes,
**Panda physical trainer Companion**`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const copyReport = () => {
    navigator.clipboard.writeText(generatedReportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Map scores to nice visual tags for charting
  const formattedChartData = moodRecords.map(item => ({
    date: item.date.substring(5), // "MM-DD"
    Vibe: item.score
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* Logger column */}
      <div className="lg:col-span-6 bg-[#FFFFFD] rounded-[24px] p-6 border-2 border-[#FFE8D6] shadow-md shadow-orange-900/5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌈</span>
            <h2 className="text-xl font-bold text-[#3B2C24] tracking-tight">Vibe Check-in & Mood Tracker</h2>
          </div>

          <p className="text-[#8C7A6E] text-xs mb-4 leading-relaxed font-medium">
            Parents can check progress charts anytime! Student, tell Panda how you feel right now.
          </p>

          {!submittedToday ? (
            <div className="space-y-4">
              {/* Emoji bar */}
              <div>
                <label className="text-xs font-bold text-[#8C7A6E] block mb-2">My current energy score:</label>
                <div className="flex justify-around items-center gap-2 bg-[#FFFDF9] p-3 rounded-[20px] border-2 border-[#FFE8D6]">
                  {[
                    { score: 1, emoji: '😢' },
                    { score: 2, emoji: '😐' },
                    { score: 3, emoji: '😊' },
                    { score: 4, emoji: '🥰' },
                    { score: 5, emoji: '🤩' }
                  ].map((item) => {
                    const isSelected = todayScore === item.score;
                    return (
                      <button
                        key={item.score}
                        id={`emoji-btn-${item.score}`}
                        onClick={() => handleEmojiSelect(item.score, item.emoji)}
                        className={`text-2xl p-2.5 rounded-full transition cursor-pointer border-2 transform hover:scale-110 active:scale-95 duration-150 ${
                          isSelected
                            ? 'bg-[#7A61FF] border-[#7A61FF] text-white scale-110 shadow-md'
                            : 'bg-white hover:bg-[#FFF0E8] border-[#FFDEC4]'
                        }`}
                      >
                        {item.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note input */}
              <div>
                <label className="text-xs font-bold text-[#5D4E41] block mb-1.5 ml-1">Write a tiny 1-line note about today:</label>
                <input
                  type="text"
                  maxLength={100}
                  value={todayNote}
                  onChange={e => setTodayNote(e.target.value)}
                  placeholder="e.g., Prepared lotus pose. Math matchsticks were cool!"
                  className="w-full px-4 py-2.5 text-xs rounded-full bg-white border-2 border-[#FFE0D0] focus:outline-none focus:border-[#FFB390] text-slate-800 font-medium placeholder-slate-405"
                />
              </div>

              {/* Today completed checkbox list */}
              <div>
                <label className="text-xs font-bold text-[#5D4E41] block mb-2 ml-1">What did you practice today? (Select all that apply):</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-36 overflow-y-auto pr-1">
                  {rawActivities.map((act) => {
                    const isChecked = todayActivities.includes(act.value);
                    return (
                      <label
                        key={act.value}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-[16px] border-2 text-[11px] font-bold cursor-pointer transition transform active:scale-98 ${
                          isChecked
                            ? 'bg-[#E6F8F2] border-[#B5E9D2] text-[#1E5D43]'
                            : 'bg-white border-[#FFE8D6] text-[#8C7A6E] hover:bg-[#FFFDFB]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleActivityToggle(act.value)}
                          className="rounded border-[#FFE0D0] text-[#7A61FF] focus:ring-[#7A61FF]"
                        />
                        <span>{act.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                id="submit-mood-btn"
                onClick={submitTodayMood}
                disabled={todayScore === null}
                className="w-full bg-[#FF6A1A] hover:bg-[#E85B12] disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 font-bold py-3 px-5 rounded-full text-white transition cursor-pointer text-xs uppercase tracking-wider shadow-md transform active:scale-98 duration-100"
              >
                Log Today's Activities & Vibe! 🐼🌟
              </button>
            </div>
          ) : (
            <div className="bg-[#FFFDF9] border-2 border-[#FFE8D6] rounded-[24px] p-6 text-center">
              <span className="text-5xl block mb-2">🥳</span>
              <h3 className="font-bold text-[#3B2C24] text-sm mb-1 uppercase tracking-wider">Today's Check-in Logged!</h3>
              <p className="text-[#8C7A6E] text-xs mb-3.5 leading-relaxed font-medium">
                You checked in today with an energy score of {todayEmoji} ({todayScore}/5). 
                Awesome progress! Panda is writing up today's observational bulletins.
              </p>
              <button
                onClick={() => setSubmittedToday(false)}
                className="text-[10px] text-[#A27756] bg-[#FFFBF7] hover:bg-white px-4 py-2 rounded-full border-2 border-[#FFE8D6] transition cursor-pointer font-bold shadow-xs active:scale-95 duration-100"
              >
                Modify Today's Logs
              </button>
            </div>
          )}
        </div>

        {/* Visual Line Chart Trend */}
        <div className="mt-6 border-t-2 border-[#FFF0E2] pt-5">
          <span className="text-xs font-bold text-[#8C7A6E] block mb-2.5 uppercase tracking-wider">Weekly Vibe & Progress Index:</span>
          <div className="w-full h-32 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedChartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFF5EC" />
                <XAxis dataKey="date" stroke="#A27756" fontSize={9} tickLine={false} />
                <YAxis domain={[1, 5]} allowDecimals={false} stroke="#A27756" fontSize={9} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="Vibe" stroke="#FF6A1A" strokeWidth={3} dot={{ r: 4, stroke: '#FF6A1A', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Parental reports generator column */}
      <div className="lg:col-span-6 bg-[#FFFFFD] rounded-[24px] p-6 border-2 border-[#FFE8D6] shadow-md shadow-orange-900/5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏡</span>
            <h2 className="text-xl font-bold text-[#3B2C24] tracking-tight">Parents & Guardians Hearth</h2>
          </div>

          <p className="text-[#8C7A6E] text-xs mb-4 leading-relaxed font-medium">
            Access secure observational bulletins. Generate daily summary drafts of CBSE chapters, study sessions completed, and wellness yoga holding intervals.
          </p>

          <div className="space-y-4">
            {/* WhatsApp Weekly Report dispatch */}
            <div className="p-4 bg-[#EBF7EE] rounded-[22px] border-2 border-[#A8E2B9] text-xs">
              <div className="flex items-center gap-2 mb-1.5 font-bold text-[#135229]">
                <span className="text-base">📲</span>
                <span>WhatsApp Weekly Report Share</span>
              </div>
              <p className="text-[#3E7D51] text-[10px] mb-3 leading-relaxed font-semibold">
                Instantly compile Bhirithi's study logs, mood charts, and yoga habits into a beautifully formatted summary to share with Father or Mother on WhatsApp!
              </p>

              <form onSubmit={saveWhatsAppContacts} className="space-y-3 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-[#2A5E39] uppercase tracking-wider mb-1">Father's WhatsApp:</label>
                    <input
                      type="text"
                      value={fatherPhone}
                      onChange={(e) => setFatherPhone(e.target.value)}
                      placeholder="e.g. +919876543210"
                      className="w-full bg-white border border-[#A2D9B3] rounded-xl px-2.5 py-1.5 focus:outline-none text-[10px] text-slate-800 font-bold placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-[#2A5E39] uppercase tracking-wider mb-1">Mother's WhatsApp:</label>
                    <input
                      type="text"
                      value={motherPhone}
                      onChange={(e) => setMotherPhone(e.target.value)}
                      placeholder="e.g. +919876543210"
                      className="w-full bg-white border border-[#A2D9B3] rounded-xl px-2.5 py-1.5 focus:outline-none text-[10px] text-slate-800 font-bold placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <button
                    type="submit"
                    className="bg-[#1E7D3F] hover:bg-[#165E2F] text-white font-bold px-3.5 py-1.5 rounded-xl active:scale-95 transition text-[9px] uppercase tracking-wider cursor-pointer shadow-xs"
                  >
                    Save Contacts 💾
                  </button>
                  {saveSuccess && (
                     <span className="text-[9px] text-[#1D7438] font-bold animate-pulse truncate">
                       {saveSuccess}
                     </span>
                  )}
                </div>
              </form>

              <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-[#BFECC8]">
                <button
                  type="button"
                  onClick={() => shareReportWhatsApp('Father')}
                  className="flex items-center justify-center gap-1.5 bg-[#1E7D3F] hover:bg-[#165E2F] text-white font-bold py-2.5 px-3 rounded-xl transition active:scale-95 text-[10px] tracking-wide cursor-pointer shadow-xs"
                >
                  Share to Father 📲👨‍💼
                </button>
                <button
                  type="button"
                  onClick={() => shareReportWhatsApp('Mother')}
                  className="flex items-center justify-center gap-1.5 bg-[#1E7D3F] hover:bg-[#165E2F] text-white font-bold py-2.5 px-3 rounded-xl transition active:scale-95 text-[10px] tracking-wide cursor-pointer shadow-xs"
                >
                  Share to Mother 📲👩‍💼
                </button>
              </div>
            </div>

            {/* Consent Form */}
            <div className="p-4 bg-[#FFF9F4] rounded-[20px] border-2 border-[#FFE5D3]">
              <label className="flex items-start gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={hasParentalConsent}
                  onChange={e => setHasParentalConsent(e.target.checked)}
                  className="rounded border-[#FFE0D0] text-[#7A61FF] focus:ring-[#7A61FF] mt-0.5"
                />
                <div>
                  <span className="font-bold text-[#8C5E3D] block mb-0.5 uppercase tracking-wider text-[10px]">Parental Consent Switch</span>
                  <span className="text-[#8C7A6E] leading-relaxed text-[11px] block font-medium">
                    I am a Parent/Guardian and I give express consent to generate Daily Observational Bulletins for my student. (We never store personal data or school IDs).
                  </span>
                </div>
              </label>
            </div>

            {/* Email configuration inputs */}
            {hasParentalConsent && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div>
                    <label className="block text-[#5D4E41] font-bold mb-1.5 ml-1">Parent/Guardian Email Address:</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#A27756] mt-0.5" />
                      <input
                        type="email"
                        value={parentEmail}
                        onChange={e => setParentEmail(e.target.value)}
                        placeholder="e.g., guardian@gmail.com"
                        className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white border-2 border-[#FFE0D0] focus:outline-none focus:border-[#FFB390] text-xs text-slate-800 font-medium placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <button
                  id="generate-report-btn"
                  onClick={generateParentReport}
                  disabled={isGeneratingReport || !parentEmail.includes('@')}
                  className="w-full bg-[#FF6A1A] hover:bg-[#E85B12] disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 text-white font-bold py-3.5 rounded-full transition flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider shadow-md transform active:scale-98"
                >
                  {isGeneratingReport ? (
                    <span>Formulating Report...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Formulate Daily observational log</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Alert info if no consent */}
            {!hasParentalConsent && (
              <div className="bg-[#FFFDEE] border-2 border-[#FFEFC2] p-4 rounded-[20px] flex gap-2.5 text-xs text-[#8C7D52] font-medium leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 animate-bounce" />
                <span>Please toggle the <strong>Parental Consent Switch</strong> above to enable progress report generations and email exports.</span>
              </div>
            )}

            {/* Draft visual display */}
            {generatedReportText && (
              <div className="bg-[#FFFDF6] border-2 border-[#FFD56B] rounded-[20px] p-4.5 text-xs shadow-xs">
                <div className="flex justify-between items-center mb-3 border-b-2 border-[#FFE8D6] pb-2">
                  <span className="font-bold text-[#8C6D1F]">Daily Bulletin Draft:</span>
                  <button
                    id="copy-report-btn"
                    onClick={copyReport}
                    className="flex items-center gap-1.5 text-[10px] text-[#8C6D1F] bg-[#FFF9EC] hover:bg-[#FFF5D1] border-2 border-[#FFD56B] px-3.5 py-1.5 rounded-full cursor-pointer transition font-bold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedReport ? 'Copied!' : 'Copy Draft'}</span>
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto font-mono text-[10.5px] whitespace-pre-wrap leading-relaxed text-[#735A1A] pr-1">
                  {generatedReportText}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact info support */}
        <div className="mt-5 text-[10px] leading-relaxed text-[#A27756] text-center border-t-2 border-[#FFF0E2] pt-4 font-medium">
          Non-Diagnostic observation reports. In case of mental fatigue or prolonged stress indices, please immediately consult a qualified physical trainer or school pediatric counseling counselor.
        </div>
      </div>
    </div>
  );
}
