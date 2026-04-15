import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_GRAY = '#969699';
const EMERALD = '#10b981';

interface Language {
  name: string;
  percent: number;
  text: string;
}

interface Props {
  apiUrl: string; // Changed from String to string
}

export default function WakaTimeReport({ apiUrl }: Props) {
  const [stats, setStats] = useState<{ languages: Language[]; totalText: string }>({
    languages: [],
    totalText: ""
  });
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch WakaTime stats:", err);
        setLoading(false);
      });
  }, [apiUrl]);

  // Destructure for easier access in the JSX
  const { languages, totalText } = stats;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  if (loading) {
    return (
      <div className="max-w-md w-full mx-auto mt-12 p-6 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center min-h-[300px]">
        <div className="text-zinc-500 font-mono text-xs animate-pulse">INITIALIZING_METRICS...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto mt-12 p-6 rounded-xl bg-white/[0.03] border border-white/5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-6">
        <div className="space-y-1">
          <h3 className="text-emerald-400 font-mono text-xs tracking-tighter uppercase font-bold">
            Coding Metrics
          </h3>
          <p className="text-zinc-500 text-[10px] font-mono leading-none uppercase">
            Language Distribution / 7 Days
          </p>
        </div>
        <div className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/50 text-emerald-500 bg-emerald-500/10">
          LIVE
        </div>
      </div>

      {/* Chart Section */}
      <div className="relative flex justify-center items-center py-4">
        <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90 overflow-visible">
          {(() => {
            let currentAccumulated = 0;
            return languages.map((lang, index) => {
              const rotation = (currentAccumulated / 100) * 360;
              currentAccumulated += lang.percent;

              const gap = 3;
              const segmentLength = Math.max(0, ((lang.percent / 100) * circumference) - gap);

              return (
                <motion.circle
                  key={lang.name}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={hoveredIndex === index ? EMERALD : BASE_GRAY}
                  strokeWidth="24"
                  strokeDasharray={`${segmentLength} ${circumference}`}
                  strokeDashoffset={0}
                  animate={{
                    scale: hoveredIndex === index ? 1.06 : 1,
                    stroke: hoveredIndex === index ? EMERALD : BASE_GRAY,
                    rotate: rotation
                  }}
                  style={{
                    transformOrigin: 'center',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut"
                  }}
                />
              );
            });
          })()}
        </svg>

        {/* Center Label */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {hoveredIndex !== null && languages[hoveredIndex] ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <p className="text-zinc-200 font-mono font-bold text-sm tracking-widest uppercase">
                  {languages[hoveredIndex].name}
                </p>
                <p className="text-emerald-500 font-mono text-[10px] mt-1">
                  {languages[hoveredIndex].text}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-tighter">
                  Total
                </p>
                <p className="text-zinc-300 font-mono text-xs font-bold">
                  {totalText}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend Decoration */}
      <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap justify-center gap-x-6 gap-y-3">
        {languages.map((lang, index) => (
          <div
            key={lang.name}
            className="flex items-center gap-2 cursor-pointer group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: hoveredIndex === index ? EMERALD : BASE_GRAY,
                boxShadow: hoveredIndex === index ? `0 0 8px ${EMERALD}` : 'none'
              }}
            />
            <span className={`text-[10px] font-mono transition-colors duration-300 ${hoveredIndex === index ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
              {lang.name}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest opacity-70">
          Data provided by <a href="https://wakatime.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors text-zinc-300 font-bold">WakaTime</a>
        </span>
      </div>
    </div>
  );
}