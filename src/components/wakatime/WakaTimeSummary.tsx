import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const languageStats = [
  { name: 'Dart', time: '12h 45m', percent: 10 },
  { name: 'TypeScript', time: '8h 12m', percent: 30 },
  { name: 'Python', time: '4h 20m', percent: 20 },
  { name: 'Tailwind', time: '2h 50m', percent: 10 },
  { name: 'Other', time: '2h 50m', percent: 30 },
];

const BASE_GRAY = '#969699'; // standard hex
const EMERALD = '#10b981';

export default function WakaTimeReport() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="max-w-md w-full mx-auto mt-12 p-6 rounded-xl bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-800 pb-4 mb-6">
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
            return languageStats.map((lang, index) => {
              const rotation = (currentAccumulated / 100) * 360;
              currentAccumulated += lang.percent;

              // We create the gap by subtracting a small amount (e.g. 2px equivalent) from the segment length 
              // and adding space to the rest of the circle circumference.
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
                    duration: 0.8,      // 0.8 seconds
                    ease: "easeInOut"   // smooth start and end
                  }}
                />
              );
            });
          })()}
        </svg>

        {/* Center Label */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {hoveredIndex !== null ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <p className="text-zinc-200 font-mono font-bold text-sm tracking-widest uppercase">
                  {languageStats[hoveredIndex].name}
                </p>
                <p className="text-emerald-500 font-mono text-[10px] mt-1">
                  {languageStats[hoveredIndex].time}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 1 }} // Start visible to avoid initial-load invisibility issues
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-tighter">
                  Total
                </p>
                <p className="text-zinc-300 font-mono text-xs font-bold">
                  28h 07m
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend Decoration */}
      <div className="mt-8 pt-4 border-t border-zinc-800/50 flex flex-wrap justify-center gap-x-6 gap-y-3">
        {languageStats.map((lang, index) => (
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
    </div>
  );
}
