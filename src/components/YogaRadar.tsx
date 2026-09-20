import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ExternalLink, RefreshCw, Sparkles, Trophy, Newspaper, MapPin, Clock3, ShieldCheck } from 'lucide-react';

interface YogaUpdate {
  title: string;
  date?: string;
  location?: string;
  organizer?: string;
  summary: string;
  relevance: string;
  sourceUrl: string;
  sourceName: string;
  status?: 'upcoming' | 'recent';
}

interface YogaRadarResponse {
  competitions: YogaUpdate[];
  news: YogaUpdate[];
  generatedAt: string;
  note?: string;
}

const CACHE_KEY = 'bhirithi-yoga-radar-v1';
const REFRESH_MS = 6 * 60 * 60 * 1000;

export default function YogaRadar() {
  const [data, setData] = useState<YogaRadarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadRadar = async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/yoga-updates', { cache: 'no-store' });
      if (!res.ok) throw new Error('Yoga update service unavailable');
      const next = await res.json() as YogaRadarResponse;
      setData(next);
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));
    } catch (err) {
      console.error(err);
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          setData(JSON.parse(cached));
          setError('Live search is temporarily unavailable. Showing the last verified update.');
        } catch {
          setError('Panda could not load the yoga radar right now.');
        }
      } else {
        setError('Panda could not connect to the live yoga radar right now. Try Refresh.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as YogaRadarResponse;
        setData(parsed);
        setLoading(false);
      } catch {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    void loadRadar();

    const timer = window.setInterval(() => {
      void loadRadar();
    }, REFRESH_MS);

    return () => window.clearInterval(timer);
  }, []);

  const lastUpdated = useMemo(() => {
    if (!data?.generatedAt) return 'Waiting for first live search…';
    return new Date(data.generatedAt).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }, [data?.generatedAt]);

  return (
    <section className="mt-8 max-w-7xl mx-auto">
      <div className="bg-[#FFFFFD] rounded-[24px] border-2 border-[#B3ECD2] shadow-md shadow-emerald-900/5 overflow-hidden">
        <div className="p-5 sm:p-7 bg-gradient-to-r from-[#F1FCF7] via-[#F8FFFB] to-[#FFFDF7] border-b-2 border-[#DDF4E9]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-[#B3ECD2] px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Live Yoga Radar
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#24443A] mt-3 flex items-center gap-2">
                <span>🧘</span> Bhirithi's Competition & Yoga News Radar
              </h2>
              <p className="text-xs text-[#648077] mt-2 max-w-3xl leading-relaxed">
                Panda browses current web sources for upcoming yoga competitions and encouraging yoga news.
                It refreshes automatically and keeps the last verified update if a live search is temporarily unavailable.
              </p>
            </div>

            <button
              onClick={() => void loadRadar(true)}
              disabled={loading || refreshing}
              className="self-start lg:self-center inline-flex items-center gap-2 bg-[#1D5E41] hover:bg-[#174A34] disabled:opacity-50 text-white px-4 py-2.5 rounded-full text-xs font-bold transition active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Searching…' : 'Refresh Now'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[9.5px] font-bold text-[#6C8379]">
            <span className="inline-flex items-center gap-1.5 bg-white border border-[#DDF4E9] px-2.5 py-1 rounded-full">
              <Clock3 className="w-3 h-3" />
              Last checked: {lastUpdated}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-[#DDF4E9] px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Sources are checked live before updates are shown
            </span>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-5 bg-[#FFFDEE] border-2 border-[#FFEFC2] text-[#8C6D1F] rounded-2xl p-3 text-[10px] font-semibold">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5 sm:p-7">
          <RadarColumn
            title="Upcoming Competitions"
            icon={<Trophy className="w-4 h-4" />}
            accent="emerald"
            items={data?.competitions || []}
            loading={loading && !data}
            empty="No confirmed upcoming competitions were found in the latest search."
          />

          <RadarColumn
            title="Yoga News & Motivation"
            icon={<Newspaper className="w-4 h-4" />}
            accent="amber"
            items={data?.news || []}
            loading={loading && !data}
            empty="No fresh yoga news was found in the latest search."
          />
        </div>

        <div className="px-5 sm:px-7 pb-6">
          <div className="bg-[#FFF9EC] border-2 border-[#FFEFC2] rounded-[18px] p-4 flex gap-3">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#7B6A3C] font-semibold leading-relaxed">
              Panda uses current source material to create a short, positive takeaway for Bhirithi.
              Competition eligibility, dates and registration details are shown only when the source supports them.
              Always confirm final participation details with the coach or organizer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RadarColumn({
  title,
  icon,
  accent,
  items,
  loading,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  accent: 'emerald' | 'amber';
  items: YogaUpdate[];
  loading: boolean;
  empty: string;
}) {
  const shell = accent === 'emerald'
    ? 'border-[#DDF4E9] bg-[#FBFFFD]'
    : 'border-[#FFEFC2] bg-[#FFFDF7]';
  const badge = accent === 'emerald'
    ? 'bg-[#E6F8F2] text-[#1D5E41]'
    : 'bg-[#FFF4D7] text-[#8C6D1F]';

  return (
    <div className={`rounded-[20px] border-2 ${shell} p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#3B2C24] text-sm flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${badge}`}>{icon}</span>
          {title}
        </h3>
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#9B8A7D]">
          {items.length} found
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-white border border-[#EFE7DD] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-[10px] text-[#8C7A6E] font-semibold">
          {empty}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <article key={`${item.title}-${index}`} className="bg-white border-2 border-[#EFE7DD] rounded-[17px] p-3.5 hover:border-[#CDE7DA] transition">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-bold text-xs text-[#3B2C24] leading-snug">{item.title}</h4>
                <span className={`text-[8px] uppercase font-bold px-2 py-1 rounded-full whitespace-nowrap ${badge}`}>
                  {item.status === 'recent' ? 'News' : 'Upcoming'}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {item.date && (
                  <span className="inline-flex items-center gap-1 text-[9px] text-[#6E665F] font-bold">
                    <CalendarDays className="w-3 h-3" /> {item.date}
                  </span>
                )}
                {item.location && (
                  <span className="inline-flex items-center gap-1 text-[9px] text-[#6E665F] font-bold">
                    <MapPin className="w-3 h-3" /> {item.location}
                  </span>
                )}
              </div>

              <p className="text-[10px] leading-relaxed text-[#6E665F] mt-2">{item.summary}</p>
              <p className="text-[10px] leading-relaxed text-[#1D5E41] font-semibold mt-2">🐼 Panda says: {item.relevance}</p>

              <div className="mt-2.5 flex items-center justify-between gap-3">
                <span className="text-[9px] text-[#A28A76] font-semibold truncate">
                  {item.organizer || item.sourceName}
                </span>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                >
                  Open source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
