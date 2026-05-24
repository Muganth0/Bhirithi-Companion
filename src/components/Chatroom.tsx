import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Smile, ShieldAlert, Heart, Zap, User, Paperclip, Camera, X, FileText, Check, RotateCcw, CameraOff, Sparkle } from 'lucide-react';
import { ChatMessage, PandaRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AttachedFileInfo {
  name: string;
  type: string;
  base64: string;
  previewUrl?: string;
}

export default function Chatroom() {
  const [role, setRole] = useState<PandaRole>('friend');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'panda',
      text: 'Bamboo-hello, Bhirithi! 🐼 I am your cozy Panda companion! Gigantic congratulations on reaching the National Yoga Competitions! 🎉 Give your brother Viransh a huge high-five too! How are you feeling today? Tap a bubbly button below to toggle my role, upload a file/math doubt, or snap an idea snapshot using our Exploration Camera!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: 'friend'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Pep consent state
  const [pepNudgeState, setPepNudgeState] = useState<'idle' | 'awaiting_consent' | 'active'>('idle');

  // File Attachment States
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachedFile, setAttachedFile] = useState<AttachedFileInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Camera Exploration States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const rawBase64 = result.split(',')[1] || result;
        resolve(rawBase64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const processSelectedFile = async (file: File) => {
    try {
      const base64Str = await fileToBase64(file);
      const isImg = file.type.startsWith('image/');
      
      setAttachedFile({
        name: file.name,
        type: file.type,
        base64: base64Str,
        previewUrl: isImg ? `data:${file.type};base64,${base64Str}` : undefined
      });
    } catch (err) {
      console.error("Error staging file upload:", err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processSelectedFile(file);
    }
  };

  // Drag and Drop implementation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processSelectedFile(file);
    }
  };

  // Camera Management
  const startCamera = async () => {
    setIsCameraOpen(true);
    setCameraActive(false);
    setCameraError('');
    setCapturedPhoto(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error("In-app camera activation failed:", err);
      setCameraError("Camera device block or blocked access! Please verify and approve camera settings in your browser, or upload a local photo of your project.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPhoto(dataUrl);
      }
    }
  };

  const attachCapturedPhoto = () => {
    if (capturedPhoto) {
      const rawBase64 = capturedPhoto.split(',')[1] || capturedPhoto;
      setAttachedFile({
        name: `camera_explore_snap_${Date.now()}.jpg`,
        type: 'image/jpeg',
        base64: rawBase64,
        previewUrl: capturedPhoto
      });
      
      if (!input.trim()) {
        setInput("Hey Panda! Here is my camera capture for our exploration project! What cool science or yoga idea matches this? 🧘‍♂️🌸");
      }
      stopCamera();
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !attachedFile) || isLoading) return;

    const studentText = input.trim() || `Look at this attachment, Panda! 🐾`;
    setInput('');

    // Prepare message payload
    const studentMsg: ChatMessage = {
      id: 'student-' + Date.now(),
      sender: 'student',
      text: studentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFile: attachedFile ? {
        name: attachedFile.name,
        type: attachedFile.type,
        previewUrl: attachedFile.previewUrl
      } : undefined
    };

    setMessages(prev => [...prev, studentMsg]);
    setIsLoading(true);

    const backupAttachment = attachedFile;
    setAttachedFile(null); // Clear immediately for clean draft input state

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: studentText,
          history: messages.slice(-10), // send last 10 messages for context
          role: role,
          image: (backupAttachment && backupAttachment.type.startsWith('image/')) ? {
            data: backupAttachment.base64,
            mimeType: backupAttachment.type
          } : undefined
        })
      });

      if (!response.ok) throw new Error('API server request failed');
      const data = await response.json();

      const pandaMsg: ChatMessage = {
        id: 'panda-' + Date.now(),
        sender: 'panda',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: role
      };

      setMessages(prev => [...prev, pandaMsg]);
    } catch (err) {
      console.error(err);
      
      // Fallback friendly local role responses if server is starting or API key not verified yet
      const fallbacks: Record<PandaRole, string> = {
        friend: "Roll with the bamboo, Bhirithi! 🐾 I am feeling super-duper cozy. Give Viransh a happy wave! Make sure you are taking study breaks! What fun game did you play at school today?",
        partner: "You have got this, Bhirithi! As a National Yoga champion, you know all about concentration and steady determination. Let's solve just ONE more Class 6 Math question right now. I know you can do it! 💪✨",
        teacher: "Math and science are like a starry sky, Bhirithi. Did you know Roman numeral L represents 50, and proteins are bodybuilders? Let's check some chapter questions!",
        mom: "Panda says: make sure your back is straight at your desk, Bhirithi! 🎋 Have you eaten a healthy fruit snack? Tell Viransh to join you for an apple!",
        yoga: "Inhale slowly for four seconds, Bhirithi... hold... and breathe out like swinging tree leaves. As our National Champion Yoga expert, keep your focus pristine and show us that safe alignment! 🧘🎋"
      };

      // Customized visual response text for fallbacks
      let fallbackText = `(Bamboo Cabin offline): ${fallbacks[role] || "Cozy panda hugs!"}`;
      if (backupAttachment) {
        fallbackText += `\n\nI saw your uploaded file block (${backupAttachment.name})! It looks extremely clever. Once my internet gears align, I will fully read and annotate it with custom drawings! Just try again soon! ✨`;
      }

      const pandaMsg: ChatMessage = {
        id: 'panda-fallback-' + Date.now(),
        sender: 'panda',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: role
      };

      setMessages(prev => [...prev, pandaMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Triggers immediate energetic motivation with consent
  const triggerPepConsentFlow = () => {
    setPepNudgeState('awaiting_consent');
    const systemMsg: ChatMessage = {
      id: 'system-pep-consent',
      sender: 'panda',
      text: "💥 ENERGY BLAST TRIGGERED! Are you ready for extreme Panda power-up coaching? (This will push you to finish your current study block!) Tap YES to agree, Bhirithi!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: 'partner'
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  const acceptPepConsent = () => {
    setPepNudgeState('active');
    const energyMsgs = [
      "💪 PANDA POWER ACTIVATED! 'You’ve got this, Bhirithi — push one more set!' Let's lock in and write down this NCERT solution like a regional champion!",
      "🏃‍♂️ Bamboo speed! Open your Book/Dojo now and let's read the next 5 lines with absolute laser focus!",
      "🎉 Boom! You completed it! Panda is doing happy backflips in the grass. Take a stretch!"
    ];

    energyMsgs.forEach((txt, idx) => {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `pep-active-${idx}-${Date.now()}`,
          sender: 'panda',
          text: txt,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          role: 'partner'
        }]);
        if (idx === energyMsgs.length - 1) {
          setPepNudgeState('idle');
        }
      }, (idx + 1) * 3000);
    });
  };

  const declinePepConsent = () => {
    setPepNudgeState('idle');
    setMessages(prev => [...prev, {
      id: 'pep-declined-' + Date.now(),
      sender: 'panda',
      text: "Totally fine, Bhirithi! 🎋 We will keep it super steady, comfy, and slow-paced like fluffy clouds. Tell Viransh we are keeping it calm!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: 'friend'
    }]);
  };

  const roleStyles: Record<PandaRole, { active: string; label: string }> = {
    friend: { label: '💬 Cozy Friend', active: 'bg-[#FFEAD2] text-[#86511F] border-[#FFC8A2]' },
    partner: { label: '⚡️ Pep Partner', active: 'bg-[#E8E9FF] text-[#3D408B] border-[#C3C6FF]' },
    teacher: { label: '📖 Guru Teacher', active: 'bg-[#E6F8F2] text-[#1D5E41] border-[#B3ECD2]' },
    mom: { label: '🏠 Sweet Mom', active: 'bg-[#FCEAF0] text-[#8B224B] border-[#F9C2D5]' },
    yoga: { label: '🧘 Zen Coach', active: 'bg-[#E3F4FC] text-[#1B4D6C] border-[#BBE0F2]' }
  };

  return (
    <div 
      className={`bg-[#FFFFFD] rounded-[24px] border-2 border-[#FFE8D6] shadow-md font-sans flex flex-col h-[550px] overflow-hidden relative transition-all duration-200 ${
        isDragging ? 'border-orange-400 bg-orange-50/50 scale-[1.005]' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#FFECE0]/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-40 border-4 border-dashed border-[#FF6A1A] rounded-[22px] pointer-events-none animate-fade-in">
          <div className="text-5xl animate-bounce mb-3">📁</div>
          <p className="text-base font-bold text-[#FF6A1A]">Drop your study doubts here!</p>
          <p className="text-xs text-[#8C7A6E] font-medium mt-1">Panda will review files, images or homework sheets safely!</p>
        </div>
      )}

      {/* Top Header & Role pickers */}
      <div className="bg-gradient-to-r from-[#FFFBF7] to-[#FFFBF0] border-b-2 border-[#FFE8D6] p-4 relative">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <span className="text-4xl filter drop-shadow">🐼</span>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#3B2C24] tracking-tight">
                Panda's Cozy Cabin
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 bg-[#FF6A1A] rounded-full animate-pulse"></span>
                <span className="text-[10px] text-[#A68F81] font-bold tracking-wide uppercase">
                  ACTIVE MODALITY: {role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            {/* Quick pep block trigger */}
            <button
              id="pep-consent-trigger"
              onClick={triggerPepConsentFlow}
              className="flex items-center gap-1.5 bg-[#FFF9EC] border-2 border-[#FFD56B] text-[#8C6D1F] font-bold text-xs px-4 py-2 rounded-full cursor-pointer shadow-sm hover:bg-[#FFF5D1] transition active:scale-95 duration-150"
            >
              <Zap className="w-3.5 h-3.5 fill-[#FFB300] text-[#FFB300] animate-bounce" />
              <span>Nudge Energy!</span>
            </button>
          </div>
        </div>

        {/* Roles Select tab row */}
        <div className="flex items-center gap-2 bg-[#FFF6EE] p-1.5 rounded-full border border-[#FFF0E2] text-[10px] overflow-x-auto scrollbar-none">
          {(['friend', 'partner', 'teacher', 'mom', 'yoga'] as PandaRole[]).map((r) => {
            const isActive = role === r;
            const style = roleStyles[r];
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 min-w-[85px] text-center py-2 rounded-full transition-all duration-200 font-bold cursor-pointer uppercase tracking-wider text-[9px] border-2 ${
                  isActive
                    ? `${style.active} shadow-sm scale-102`
                    : 'bg-white hover:bg-[#FFFBF7] text-[#8C7A6E] border-transparent'
                }`}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Thread List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#FFFDF9] to-[#FFFBF8]">
        <AnimatePresence>
          {messages.map((msg) => {
            const isPanda = msg.sender === 'panda';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3.5 max-w-[85%] ${isPanda ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-sm select-none border-2 ${
                  isPanda ? 'bg-white border-[#FFEAD2]' : 'bg-[#E3F4FC] border-[#C2E3F4]'
                }`}>
                  {isPanda ? '🐼' : '👧'}
                </div>

                <div className="space-y-1 max-w-full">
                  <div
                    className={`px-4 py-3 rounded-[20px] text-xs leading-relaxed border-2 shadow-xs whitespace-pre-wrap ${
                      isPanda
                        ? 'bg-white text-[#4D3A2F] border-[#FFF0E2] rounded-tl-[4px]'
                        : 'bg-[#FFEFE5] text-[#86511F] border-[#FFD8C2] rounded-tr-[4px] font-medium'
                    }`}
                  >
                    <span>{msg.text}</span>

                    {/* Attached staged/sent file info nested inside individual bubbles */}
                    {msg.attachedFile && (
                      <div className="mt-3 border-t border-dashed border-[#FFDEC4] pt-2.5 flex flex-col gap-1.5">
                        {msg.attachedFile.previewUrl ? (
                          <div className="relative rounded-xl overflow-hidden border-2 border-white shadow-xs bg-[#1E140F]">
                            <img
                              src={msg.attachedFile.previewUrl}
                              alt="Attached doubt sheet or camera explorative snapshot"
                              referrerPolicy="no-referrer"
                              className="max-w-full max-h-[160px] object-contain rounded-lg"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-2.5 bg-white/70 backdrop-blur-xs text-[#8C5E43] rounded-xl border border-[#FFDEC4] text-[10.5px]">
                            <FileText className="w-4 h-4 text-[#FF6A1A] flex-shrink-0" />
                            <span className="font-bold truncate max-w-[150px]">{msg.attachedFile.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-[9px] text-orange-400 font-bold uppercase tracking-wider">
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Doubt Attached Successfully</span>
                        </div>
                      </div>
                    )}

                    {/* Pep nudge system layout within bubble */}
                    {msg.id === 'system-pep-consent' && pepNudgeState === 'awaiting_consent' && (
                      <div className="flex gap-2 mt-3.5 justify-end text-[11px]">
                        <button
                          id="pep-decline-btn"
                          onClick={declinePepConsent}
                          className="bg-white hover:bg-slate-50 text-[#8C7B71] px-3.5 py-2 rounded-full border border-[#EFE7E1] font-bold cursor-pointer transition active:scale-95"
                        >
                          Steady pace
                        </button>
                        <button
                          id="pep-accept-btn"
                          onClick={acceptPepConsent}
                          className="bg-[#FF6A1A] hover:bg-[#E85B12] text-white px-4 py-2 rounded-full font-bold cursor-pointer transition active:scale-95 shadow-sm"
                        >
                          Agree to push
                        </button>
                      </div>
                    )}
                  </div>
                  <span className={`text-[9px] text-[#A6978E] font-medium block ${isPanda ? 'text-left pl-1' : 'text-right pr-1'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border-2 border-[#FFEAD2] text-sm">
              🐼
            </div>
            <div className="bg-white border-2 border-[#FFF0E2] px-4 py-2.5 rounded-[20px] rounded-tl-[4px] text-xs text-[#8C7B71] flex items-center gap-2 shadow-xs">
              <span className="font-semibold">Panda is typing cute wisdom</span>
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#FF6A1A] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#FF6A1A] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-[#FF6A1A] rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Inline Camera Explorer Drawer Overlay */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-x-0 bottom-0 top-[88px] bg-white z-30 flex flex-col justify-between border-t-2 border-[#FFE8D6] overflow-y-auto"
          >
            <div className="p-5 flex-1 flex flex-col justify-between">
              {/* Header inside video explorer */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📷</span>
                  <div>
                    <h3 className="text-xs font-bold text-[#3B2C24] uppercase tracking-wider">Panda's Vision Camera Explorer</h3>
                    <p className="text-[10px] text-indigo-500 font-semibold mt-0.5">Explore new projects, verify yoga alignments, or share science views!</p>
                  </div>
                </div>
                <button
                  onClick={stopCamera}
                  className="p-1 px-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-full text-[10px] font-bold hover:bg-rose-100 cursor-pointer"
                >
                  Close Vision Camera
                </button>
              </div>

              {cameraError && (
                <div className="bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs rounded-2xl p-4 mb-4 flex flex-col items-center text-center">
                  <CameraOff className="w-8 h-8 text-rose-500 mb-2" />
                  <span className="font-bold mb-1">Camera Permission Required</span>
                  <p className="font-medium text-[11px] leading-relaxed max-w-xs">{cameraError}</p>
                </div>
              )}

              {/* Player stream viewport */}
              {!cameraError && (
                <div className="relative flex-1 min-h-[180px] bg-[#1E140F] border-2 border-[#FFE8D6] rounded-[20px] overflow-hidden flex items-center justify-center">
                  {/* Live Stream or Captured Freeze-Frame */}
                  {!capturedPhoto ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={capturedPhoto}
                      alt="Captured preview"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {!cameraActive && !capturedPhoto && !cameraError && (
                    <div className="text-xs text-amber-500 font-bold flex flex-col items-center gap-2 animate-pulse">
                      <Sparkles className="w-6 h-6 animate-spin" />
                      <span>Requesting video lens permission...</span>
                    </div>
                  )}

                  {cameraActive && !capturedPhoto && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      LIVE LENS ACTIVE
                    </span>
                  )}
                </div>
              )}

              {/* Controls layout */}
              <div className="mt-4 flex gap-3">
                {!capturedPhoto ? (
                  <button
                    onClick={capturePhoto}
                    disabled={!cameraActive}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-800 disabled:opacity-40 text-white font-bold text-xs py-3 rounded-full cursor-pointer transition active:scale-95 text-center uppercase tracking-wider"
                  >
                    Capture & Explore Snapshot 📸
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setCapturedPhoto(null)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-[#5D4E41] font-bold text-xs py-2 rounded-full cursor-pointer transition flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake</span>
                    </button>
                    <button
                      onClick={attachCapturedPhoto}
                      className="flex-1 bg-[#FF6A1A] hover:bg-[#E85B12] text-white font-bold text-xs py-2 rounded-full cursor-pointer transition flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Attach & Explore ✅</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staged Draft File Warning Ribbon */}
      {attachedFile && (
        <div className="bg-[#FFF6F0] border-t border-[#FFE8D6] px-4 py-2.5 flex items-center justify-between text-xs animate-fade-in relative z-20">
          <div className="flex items-center gap-2 max-w-[85%]">
            {attachedFile.previewUrl ? (
              <img
                src={attachedFile.previewUrl}
                alt="Selected thumbnail"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-lg object-cover border border-[#FFDEC4]"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-[#FFDEC4]">
                <FileText className="w-4 h-4" />
              </div>
            )}
            <div className="truncate">
              <span className="font-bold text-[#3B2C24] block text-[11px] truncate leading-tight">
                Staged Doubt File: {attachedFile.name}
              </span>
              <span className="text-[9px] text-[#8C7A6E] font-semibold uppercase tracking-wide">
                {attachedFile.type || "Document Attachment"} (Will submit on Send)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachedFile(null)}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-orange-100 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input textbox bar */}
      <form onSubmit={sendMessage} className="p-3.5 bg-white border-t-2 border-[#FFE8D6] flex gap-2.5 items-center relative z-10">
        
        {/* Attachment Click Trigger */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 bg-[#FFF4EC] hover:bg-[#FFE6D3] text-[#FF6A1A] rounded-full cursor-pointer transition active:scale-95 flex-shrink-0"
          title="Attach files or sheets for doubts"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        {/* Live Camera Explore Trigger */}
        <button
          type="button"
          onClick={startCamera}
          className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-[#7A61FF] rounded-full cursor-pointer transition active:scale-95 flex-shrink-0"
          title="Open Exploration Camera"
        >
          <Camera className="w-4 h-4" />
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={attachedFile ? "Type your questions or doubts about this file..." : "Ask Panda a question or explain your doubt..."}
            className="w-full pl-5 pr-12 py-3 rounded-full border-2 border-[#FFE0D0] bg-[#FFFBF9] outline-none text-xs focus:bg-white focus:border-[#FFB390] transition-all duration-200 text-[#4D3A2F] font-bold placeholder-[#CDA695]"
          />
          <div className="absolute right-4 top-3 text-lg opacity-40"><Sparkle className="w-4 h-4 text-orange-300 fill-orange-300" /></div>
        </div>

        <button
          type="submit"
          id="send-chat-btn"
          disabled={(!input.trim() && !attachedFile) || isLoading}
          className="bg-[#FF6A1A] hover:bg-[#E85B12] disabled:bg-[#FFE3D5] disabled:text-[#FFC7AE] text-white p-3 rounded-full cursor-pointer transition-all active:scale-95 shadow-md flex items-center justify-center flex-shrink-0"
        >
          <Send className="w-4 h-4 fill-white text-white" />
        </button>
      </form>
    </div>
  );
}
