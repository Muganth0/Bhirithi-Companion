import React, { useState } from 'react';
import { ShieldAlert, X, Heart, Wind, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RescueBeacon() {
  const [isOpen, setIsOpen] = useState(false);
  const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  // Load parent WhatsApp numbers from localStorage
  const [fatherPhone, setFatherPhone] = useState(() => localStorage.getItem('bhirithi_father_phone') || '');
  const [motherPhone, setMotherPhone] = useState(() => localStorage.getItem('bhirithi_mother_phone') || '');
  const [saveSuccess, setSaveSuccess] = useState('');

  const saveContacts = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('bhirithi_father_phone', fatherPhone.trim());
    localStorage.setItem('bhirithi_mother_phone', motherPhone.trim());
    setSaveSuccess('Emergency WhatsApp contact numbers saved successfully! 🍃');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const triggerWhatsAppSOS = (parent: 'Father' | 'Mother') => {
    const rawNum = parent === 'Father' ? fatherPhone : motherPhone;
    if (!rawNum.trim()) {
      alert(`Oops, Bhirithi! Please fill in your ${parent}'s mobile number with country code first (e.g. +919876543210) so Panda can help you send details!`);
      return;
    }
    const cleanNum = rawNum.replace(/[^\d+]/g, '');
    const sosMsg = `🚨 EMERGENCY HELP REQUEST 🚨
Hey ${parent}, this is Bhirithi. I am feeling a bit worries, stressed, or overwhelmed right now and wanted to talk to you immediately. Please call me back or check in on me! Viransh is with me. ❤️ (Sent via Panda Companion app)`;

    const waUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanNum)}&text=${encodeURIComponent(sosMsg)}`;
    window.open(waUrl, '_blank');
  };

  // Simple interval simulation within user click
  const triggerBreathe = () => {
    if (breathePhase === 'Inhale') {
      setBreathePhase('Hold');
    } else if (breathePhase === 'Hold') {
      setBreathePhase('Exhale');
    } else {
      setBreathePhase('Inhale');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Small Urgent Button in modern warm coral/pink kids style */}
      <motion.button
        id="rescue-button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[#FF4564] hover:bg-[#E32D4C] text-white px-5 py-3.5 rounded-full shadow-lg shadow-[#FF4564]/20 transition-colors duration-200 cursor-pointer text-xs font-bold uppercase tracking-wider"
      >
        <ShieldAlert className="w-5 h-5 animate-pulse text-white" />
        <span>Ask a Human / Help 🆘</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#FFFFFD] rounded-[28px] max-w-md w-full p-6 shadow-2xl border-2 border-[#FFE8D6] max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-[#FF4564]">
                  <Heart className="w-6 h-6 fill-[#FF4564]" />
                  <span className="text-lg font-bold tracking-tight">Panda's Safe Nest 🌸</span>
                </div>
                <button
                  id="close-rescue"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-[#FFF4EC] rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Validation & Calm down script */}
              <h3 className="text-base font-bold text-[#3B2C24] mb-2 leading-snug">
                Hey Bhirithi! Panda is here, and you are completely safe. ❤️
              </h3>
              <p className="text-[#8C7A6E] text-xs mb-4.5 leading-relaxed font-medium">
                If you are feeling extra worried, sad, or overwhelmed, that is absolutely okay. Let's take one tiny step together right now, or call your brother Viransh to breathe with you!
              </p>

              {/* WhatsApp Rapid Parental Emergency Connect */}
              <div className="bg-[#EBF7EE] border-2 border-[#A8E2B9] rounded-[22px] p-4 mb-4.5 text-[11px] text-[#135229]">
                <div className="flex items-center gap-2 mb-1.5 font-bold text-xs">
                  <span className="text-base animate-pulse">🟢</span>
                  <span>WhatsApp Rapid SOS Dispatch</span>
                </div>
                
                <p className="text-[#3E7D51] text-[10px] mb-3 font-medium">
                  Set WhatsApp numbers for Father and Mother to instantly trigger or share an urgent SOS notification from your phone/tablet!
                </p>

                <form onSubmit={saveContacts} className="space-y-2.5">
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
                      className="bg-[#1E7D3F] hover:bg-[#165E2F] text-white font-bold px-3 py-1.5 rounded-lg active:scale-95 transition text-[9px] uppercase tracking-wider cursor-pointer"
                    >
                      Save Contacts 💾
                    </button>
                    {saveSuccess && (
                      <span className="text-[9px] text-[#1D7438] font-bold animate-pulse truncate max-w-[150px]">
                        {saveSuccess}
                      </span>
                    )}
                  </div>
                </form>

                {/* Instant trigger SOS action buttons */}
                <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-[#BFECC8]">
                  <button
                    type="button"
                    onClick={() => triggerWhatsAppSOS('Father')}
                    className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2.5 px-3 rounded-xl transition active:scale-95 text-[10.5px] tracking-wide cursor-pointer shadow-xs"
                  >
                    <span>💬 SOS Father</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerWhatsAppSOS('Mother')}
                    className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2.5 px-3 rounded-xl transition active:scale-95 text-[10.5px] tracking-wide cursor-pointer shadow-xs"
                  >
                    <span>💬 SOS Mother</span>
                  </button>
                </div>
              </div>

              {/* Fast 2-Minute Grounding Visualizer */}
              <div className="bg-[#FFEFEF] border-2 border-[#FFAFAF] rounded-[22px] p-5 mb-5 flex flex-col items-center">
                <span className="text-[10px] font-bold text-[#FF4564] uppercase tracking-wider mb-2">
                  Panda's 10-Second Quick Calm
                </span>
                <motion.div
                  animate={{
                    scale: breathePhase === 'Inhale' ? 1.15 : breathePhase === 'Hold' ? 1.15 : 0.9,
                  }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  onClick={triggerBreathe}
                  className="w-16 h-16 bg-gradient-to-br from-[#FF8297] to-[#FF4564] rounded-full flex items-center justify-center text-white hover:opacity-90 font-bold text-xs cursor-pointer shadow-md mb-3 hover:scale-105 active:scale-95 duration-150"
                >
                  {breathePhase}
                </motion.div>
                <button
                  onClick={triggerBreathe}
                  className="text-[10.5px] text-[#A2283C] bg-[#FFE0E4] border border-[#FFAFAF] px-4 py-1.5 rounded-full font-bold cursor-pointer active:scale-95 duration-100"
                >
                  Tap bubble to change!
                </button>
              </div>

              {/* Escalation Guidelines */}
              <div className="space-y-3 mb-5">
                <div className="p-3.5 bg-[#E3F2FD] text-[#0D47A1] border-2 border-[#90CAF9] rounded-2xl text-[11px] flex gap-3 leading-relaxed">
                  <Wind className="w-5 h-5 text-[#1976D2] flex-shrink-0 animate-pulse" />
                  <div>
                    <span className="font-bold block mb-0.5">Please tell a grown-up right now!</span>
                    Go find your Mom, Dad, a favorite teacher, or a sports coach and say: <span className="italic font-bold">"I feel worried and I need to talk to you."</span> They love you and want to support you!
                  </div>
                </div>

                <div className="p-3.5 bg-[#FFFDE7] text-[#5D4600] border-2 border-[#FFE082] rounded-2xl text-[11px] flex gap-3 leading-relaxed">
                  <Phone className="w-5 h-5 text-[#F57F17] flex-shrink-0" />
                  <div>
                    <span className="font-bold block mb-0.5">Child & Teen Support Hotlines:</span>
                    <ul className="list-disc pl-4 space-y-1 mt-1 font-medium">
                      <li><strong>India (Childline):</strong> Call <strong className="text-[#FF6A1A]">1098</strong> (Toll-Free, 24/7)</li>
                      <li><strong>KIRAN Helpline (Govt):</strong> <strong className="text-[#9D80FE]">1800-599-0019</strong></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Close footer */}
              <button
                id="ack-rescue"
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#FF4564] hover:bg-[#E32D4C] text-white py-3.5 rounded-full font-bold cursor-pointer text-xs uppercase tracking-wider shadow-md transform active:scale-95 duration-150"
              >
                I am okay, take me back to Panda! 🐾
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
