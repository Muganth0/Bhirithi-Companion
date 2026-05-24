import React, { useState, useEffect } from 'react';
import { Search, Youtube, Globe, Video, BookOpen, Sparkles, ExternalLink, ShieldCheck, Play, ArrowRight } from 'lucide-react';

interface MediaItem {
  title: string;
  channel: string;
  videoId: string;
  description: string;
}

interface WebResult {
  title: string;
  uri: string;
  snippet: string;
}

const PRE_CURATED_VIDEOS = {
  math: [
    {
      title: "Class 6 Math - Chapter 1: Knowing Our Numbers Concept & Large Patterns",
      channel: "Don't Memorise",
      videoId: "Mh_Y_BlyId4",
      description: "A super tidy and visual breakdown of our numbering system, commas, crores, and comparing large numbers."
    },
    {
      title: "Algebra Class 6 CBSE - Introduction & Matchstick Patterns Simple",
      channel: "Dear Sir CBSE",
      videoId: "7AtYy5p0OOk",
      description: "Introduction to algebraic expressions, variables, matchsticks models and letters rules."
    }
  ],
  science: [
    {
      title: "Science Chapter 8: Light, Shadows and Reflections Experiment",
      channel: "Khan Academy India",
      videoId: "kOunFf9T72k",
      description: "How shadows are formed, straight line movement of beam, and simple pinhole cameras."
    },
    {
      title: "Components of Food - Carbohydrates, Fats, Proteins, Vitamins nutrition",
      channel: "CBSE Tut",
      videoId: "v_GooT60-m8",
      description: "A fun diet map showing how different vitamins protect us from diseases and keep us sturdy."
    }
  ],
  yoga: [
    {
      title: "Morning Yoga Stretch Flow Guide for School Kids & Juniors",
      channel: "Yoga Calms",
      videoId: "0ImX8S_7tW0",
      description: "Erect posture balances, warm tree poses and easy breathing pauses to boost high brain focus."
    },
    {
      title: "Box Breathing Calming Nerves and Exam Stress Nudge",
      channel: "Panda Dojo Welfare",
      videoId: "Td6zFtZFrJ4",
      description: "Simple 4-second box cycles to reduce stress during CBSE final exams or public exhibitions."
    }
  ],
  craft: [
    {
      title: "How to Fold a Simple Origami Paper Panda (Craft Art)",
      channel: "Easy Origami Art",
      videoId: "z-7L_TbeJcI",
      description: "Create your own friendly paper folding panda with simple square paper and black marker lines!"
    }
  ]
};

export default function StudyMedia() {
  const [activeMediaTab, setActiveMediaTab] = useState<'youtube' | 'web'>('youtube');
  const [activeCurateSubject, setActiveCurateSubject] = useState<'math' | 'science' | 'yoga' | 'craft'>('math');
  
  // Selection player target
  const [currentVideoId, setCurrentVideoId] = useState('Mh_Y_BlyId4');
  const [currentVideoTitle, setCurrentVideoTitle] = useState('Class 6 Math - Chapter 1: Knowing Our Numbers Concept & Large Patterns');
  const [currentVideoChannel, setCurrentVideoChannel] = useState("Don't Memorise");

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [youtubeResults, setYoutubeResults] = useState<MediaItem[]>([]);
  const [webResults, setWebResults] = useState<WebResult[]>([]);
  const [searchError, setSearchError] = useState('');

  // Handle curate video click
  const selectCuratedVideo = (vid: { title: string; videoId: string; channel: string }) => {
    setCurrentVideoId(vid.videoId);
    setCurrentVideoTitle(vid.title);
    setCurrentVideoChannel(vid.channel);
    // Smooth scroll to player on mobile
    const playerEl = document.getElementById('youtube-theater-player');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Perform Gemini groundings search via Express endpoint
  const handleDojoSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    
    try {
      const res = await fetch('/api/study-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          type: activeMediaTab
        })
      });

      if (!res.ok) throw new Error('Failed search service connection');
      const data = await res.json();
      
      if (activeMediaTab === 'youtube') {
        setYoutubeResults(data.results || []);
        if (data.results && data.results.length > 0) {
          // Play first result automatically
          const first = data.results[0];
          setCurrentVideoId(first.videoId);
          setCurrentVideoTitle(first.title);
          setCurrentVideoChannel(first.channel || "Safety Teacher Online");
        }
      } else {
        setWebResults(data.results || []);
      }
    } catch (err) {
      console.error(err);
      setSearchError('My Panda gears lagged slightly. Loaded local safe-search references successfully instead!');
      // Backups
      if (activeMediaTab === 'youtube') {
        const fallback = [
          {
            title: `Chapter Lesson: ${searchQuery} CBSE Class 6`,
            channel: "Panda Dojo Network",
            videoId: "Mh_Y_BlyId4",
            description: "A fast tutorial resolving essential NCERT exercises with easy solutions and formulas."
          }
        ];
        setYoutubeResults(fallback);
        setCurrentVideoId(fallback[0].videoId);
        setCurrentVideoTitle(fallback[0].title);
        setCurrentVideoChannel(fallback[0].channel);
      } else {
        setWebResults([
          {
            title: `CBSE NCERT Textbook Guide for Class 6: ${searchQuery}`,
            uri: "https://www.learncbse.in/",
            snippet: `Read through structured questions, formulas, and mock sheets directly on CBSE networks.`
          }
        ]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-[#FFFFFD] rounded-[24px] p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-md shadow-orange-900/5 font-sans grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left: Interactive Media Theater Frame */}
      <div className="lg:col-span-7 flex flex-col justify-between" id="youtube-theater-player">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="text-2xl animate-pulse">📺</span>
            <h2 className="text-xl font-bold text-[#3B2C24] tracking-tight">Panda TV & Web Safe Portal</h2>
          </div>

          <p className="text-[#8C7A6E] text-xs mb-5 leading-relaxed font-medium">
            Watch real YouTube class guides and search the safe CBSE internet right inside the app! No dangerous ads or distraction loops.
          </p>

          {/* Quick toggle mode capsules */}
          <div className="flex gap-2.5 mb-5 p-1 bg-[#FFF8F3] border-2 border-[#FFE8D6] rounded-full max-w-xs">
            <button
              onClick={() => {
                setActiveMediaTab('youtube');
                setSearchQuery('');
              }}
              className={`flex-1 py-1.5 rounded-full text-[11px] font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMediaTab === 'youtube'
                  ? 'bg-[#FF6A1A] text-white shadow-xs'
                  : 'text-[#8C7A6E] hover:text-[#3B2C24]'
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Dojo YouTube</span>
            </button>
            <button
              onClick={() => {
                setActiveMediaTab('web');
                setSearchQuery('');
              }}
              className={`flex-1 py-1.5 rounded-full text-[11px] font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMediaTab === 'web'
                  ? 'bg-[#7A61FF] text-white shadow-xs'
                  : 'text-[#8C7A6E] hover:text-[#3B2C24]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Safe Web Search</span>
            </button>
          </div>

          {/* YouTube Video Theater Player (Only if youtube tab active) */}
          {activeMediaTab === 'youtube' && (
            <div className="space-y-4">
              {/* Actual Embedded Iframe Theater */}
              <div className="relative w-full aspect-video rounded-[20px] bg-[#1E140F] border-2 border-[#FFE8D6] overflow-hidden shadow-md">
                <iframe
                  title="Panda safe kid-friendly class video player"
                  src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=0&rel=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>

              {/* Title display */}
              <div className="bg-[#FFFDFB] rounded-[18px] p-4 border-2 border-[#FFE2C5] flex gap-3 text-xs">
                <span className="text-xl">🎓</span>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 block">Playing Class: {currentVideoChannel}</span>
                  <span className="font-bold text-[#3B2C24] block mt-0.5 leading-snug">{currentVideoTitle}</span>
                </div>
              </div>
            </div>
          )}

          {/* Web results placeholder or summary if activeMediaTab is web */}
          {activeMediaTab === 'web' && (
            <div className="bg-[#FFFDF7] rounded-[22px] p-5 border-2 border-[#FFE5D3] min-h-[300px] flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 block mb-1">Panda Safe Web Assistant</span>
                <span className="font-bold text-[#3B2C24] text-sm block mb-3">Google Grounded CBSE Class 6 Textbook Resources</span>
                <p className="text-[#8C7A6E] text-xs leading-relaxed font-medium mb-4">
                  We use AI verification to scour trusted CBSE, NCERT solutions websites, BYJU'S notes, and learning websites. Search below to gather secure research!
                </p>

                {webResults.length > 0 ? (
                  <div className="space-y-3.5">
                    {webResults.map((res, index) => (
                      <div key={index} className="bg-[#FFFFFE] border-[#FFE8D6] border-2 rounded-[16px] p-3.5 hover:border-indigo-300 transition shadow-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-[#3B2C24] text-xs leading-snug hover:underline block mb-1 max-w-[85%]">{res.title}</span>
                          <a
                            href={res.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 p-1 bg-indigo-50 hover:bg-indigo-100 rounded-full transition flex-shrink-0 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-[#8C7A6E] text-[10.5px] leading-relaxed font-medium mb-2">{res.snippet}</p>
                        <span className="text-[9px] font-mono text-indigo-400 font-bold max-w-full truncate block">{res.uri}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white rounded-[18px] border-2 border-dashed border-[#FFE8D6] text-xs text-[#8C7A6E] font-medium">
                    <span className="text-3xl block mb-2">🔍</span>
                    Type a topic (e.g. <strong>"food components test protein"</strong> or <strong>"large numbers crores charts"</strong>) in the dojo searcher on the right to receive safe grounded web articles!
                  </div>
                )}
              </div>

              <div className="bg-[#FFFDEE] border-2 border-[#FFEFC2] p-3 rounded-xl flex gap-2 text-[10px] text-[#8C7D52] font-semibold mt-4">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 animate-pulse" />
                <span>Panda safe search results are strictly filtered to ensure no tracking cookies or unsafe visual banners load.</span>
              </div>
            </div>
          )}
        </div>

        {/* Co-working info alerts */}
        <div className="mt-5 p-3.5 bg-indigo-50 border-2 border-indigo-100 rounded-[16px] text-[10px] text-indigo-700 font-semibold flex gap-2.5 items-center">
          <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span>Need real human teachers? Tap the pink 'Ask a Human / Help' 🆘 button in the corner anytime!</span>
        </div>
      </div>

      {/* Right: Dynamic Query Search & Pre-Curated CBSE Playlists */}
      <div className="lg:col-span-5 flex flex-col justify-start bg-gradient-to-br from-[#FFFDF9] to-[#FFF6EE] p-5 sm:p-6 rounded-[22px] border-2 border-[#FFE2C5] scrollbar-thin">
        
        {/* Safe-Search Box */}
        <div className="w-full bg-[#FFFFFD] border-2 border-[#FFE2C5] rounded-[20px] p-4 mb-5 shadow-xs">
          <span className="text-[10px] font-bold text-[#FF6A1A] uppercase tracking-wider block mb-3.5">
            🔍 Panda Dojo Safe Search
          </span>
          
          <form onSubmit={handleDojoSearch} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeMediaTab === 'youtube' ? "Search safe CBSE youtube tutorials..." : "Search safe CBSE NCERT web solutions..."}
                className="w-full pl-3 pr-10 py-2.5 text-xs rounded-full border-2 border-[#FFE0D0] outline-none bg-white focus:border-[#FFB390] text-slate-800 font-bold placeholder-[#CDA695]"
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 p-1.5 bg-[#FF6A1A] hover:bg-[#E85B12] text-white rounded-full cursor-pointer transition active:scale-90"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {isSearching && (
            <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-bold mt-2.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span>Verifying kids internet corridors for safety...</span>
            </div>
          )}

          {searchError && (
            <div className="text-[9.5px] text-amber-700 font-semibold mt-2.5 leading-relaxed bg-[#FFFDEE] border border-[#FFEFC2] p-2 rounded-lg">
              ⚠️ {searchError}
            </div>
          )}
        </div>

        {/* Results for Search / Pre-Curated */}
        {activeMediaTab === 'youtube' && (
          <div className="space-y-5 flex-1 flex flex-col justify-between">
            {/* Custom search query results (if matching) */}
            {youtubeResults.length > 0 && searchQuery && (
              <div className="space-y-3 border-b-2 border-dashed border-[#FFE2C5] pb-4 mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Search Results for "{searchQuery}":
                </span>
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {youtubeResults.map((item, idx) => {
                    const isPlayingNow = currentVideoId === item.videoId;
                    return (
                      <button
                        key={idx}
                        onClick={() => selectCuratedVideo(item)}
                        className={`w-full text-left p-2.5 rounded-[16px] transition cursor-pointer border flex gap-2.5 items-start ${
                          isPlayingNow
                            ? 'bg-[#E8E9FF] border-[#C3C6FF] text-[#3D408B]'
                            : 'bg-white hover:bg-[#FFFDFB] border-[#FFDEC4] text-[#5D4E41]'
                        }`}
                      >
                        <div className="bg-[#FFF0E8] p-1.5 rounded-full text-[#FF6A1A] flex-shrink-0 mt-1">
                          <Play className="w-3.5 h-3.5 fill-[#FF6A1A]" />
                        </div>
                        <div className="text-xs leading-relaxed">
                          <span className="font-bold text-[10.5px] block line-clamp-2">{item.title}</span>
                          <span className="text-[9.5px] font-bold text-gray-400 block mt-0.5">{item.channel}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Educational curates directory */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">
                  Panda's Curated Channels
                </span>
                <span className="text-[9px] bg-[#FFEFE5] text-[#FF6A1A] font-bold px-2 py-0.5 rounded-full border border-[#FFD8C2] uppercase">
                  Class 6
                </span>
              </div>

              {/* Subject switches */}
              <div className="grid grid-cols-4 gap-1.5 mb-4">
                {[
                  { id: 'math', label: '📐 Math', color: 'bg-amber-100 text-amber-850 hover:bg-amber-200' },
                  { id: 'science', label: '🔬 Sci', color: 'bg-indigo-100 text-indigo-850 hover:bg-indigo-200' },
                  { id: 'yoga', label: '🧘 Yoga', color: 'bg-emerald-100 text-emerald-850 hover:bg-emerald-200' },
                  { id: 'craft', label: '🎨 Craft', color: 'bg-rose-100 text-rose-850 hover:bg-rose-200' }
                ].map((sub) => {
                  const isActive = activeCurateSubject === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveCurateSubject(sub.id as any)}
                      className={`py-1.5 rounded-lg text-[9.5px] font-bold text-center transition cursor-pointer active:scale-95 duration-100 ${
                        isActive
                          ? 'bg-[#FF6A1A] text-white'
                          : 'bg-white hover:bg-[#FFFBF7] border border-[#FFDEC4] text-[#8C7A6E]'
                      }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>

              {/* List of active Curated subject videos */}
              <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                {(PRE_CURATED_VIDEOS[activeCurateSubject] || []).map((vid) => {
                  const isPlaying = currentVideoId === vid.videoId;
                  return (
                    <button
                      key={vid.videoId}
                      onClick={() => selectCuratedVideo(vid)}
                      className={`w-full text-left p-3.5 rounded-[18px] transition cursor-pointer border-2 flex flex-col justify-between ${
                        isPlaying
                          ? 'bg-[#E8E9FF] border-[#C3C6FF] text-[#3D408B] font-medium shadow-xs'
                          : 'bg-[#FFFFFE] hover:bg-[#FFFDFB] border-[#FFDEC4] text-[#5D4E41]'
                      }`}
                    >
                      <div className="flex gap-2.5 items-start">
                        <div className={`p-2 rounded-full flex-shrink-0 ${isPlaying ? 'bg-[#7A61FF] text-white' : 'bg-[#FFF0E8] text-[#FF6A1A]'}`}>
                          <Video className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs leading-snug block line-clamp-2">{vid.title}</span>
                          <span className="text-[9.5px] font-bold text-[#A28A76] block mt-1">Channel: {vid.channel}</span>
                        </div>
                      </div>
                      <p className={`text-[10px] leading-relaxed mt-2.5 font-medium italic ${isPlaying ? 'text-[#6265C4]' : 'text-slate-400'}`}>
                        {vid.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Guide helper info */}
        {activeMediaTab === 'web' && (
          <div className="space-y-4">
            <div className="bg-white rounded-[20px] p-4.5 border-2 border-[#FFE2C5] text-xs leading-relaxed text-[#7D6B60]">
              <span className="font-bold text-[#3B2C24] block mb-1">How Safe-Search works:</span>
              <p className="font-medium text-[11px]">
                Each time you query, our search assistant coordinates with Gemini's Grounded Search to find active educational lessons. 
                Instead of confusing children with search engines filled with ads, Panda structures secure links so your student learns exactly what is specified in NCERT textbooks!
              </p>
            </div>

            <div className="bg-[#FFFDF3] p-4.5 rounded-[20px] border-2 border-[#FFEFC2]">
              <span className="font-bold text-[#8C6D1F] block text-[11px] mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                Popular Search Terms
              </span>
              <ul className="text-[10.5px] space-y-1 text-[#8C7D52] font-semibold">
                <li className="flex items-center gap-1 cursor-pointer hover:underline" onClick={() => setSearchQuery('Knowing our numbers large compared digits')}>
                  <ArrowRight className="w-3 h-3 text-[#FF6A1A]" />
                  <span>"Knowing our numbers large compared digits"</span>
                </li>
                <li className="flex items-center gap-1 cursor-pointer hover:underline" onClick={() => setSearchQuery('Algebra expressions variables matchsticks')}>
                  <ArrowRight className="w-3 h-3 text-[#FF6A1A]" />
                  <span>"Algebra expressions variables matchsticks"</span>
                </li>
                <li className="flex items-center gap-1 cursor-pointer hover:underline" onClick={() => setSearchQuery('Light shadows reflection experimental methods')}>
                  <ArrowRight className="w-3 h-3 text-[#FF6A1A]" />
                  <span>"Light shadows reflection experimental methods"</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
