import React from 'react';

interface SkillGroupProps {
  category: string;
  items: string[];
}

const SkillGroup: React.FC<SkillGroupProps> = ({ category, items }) => (
  <div className="flex flex-col gap-8 group">
    {/* Category Header */}
    <div className="flex items-center gap-4">
      <h3 className="text-zinc-500 font-mono text-[11px] uppercase tracking-[0.3em] font-medium group-hover:text-emerald-400 transition-colors duration-500">
        {category}
      </h3>
      <div className="h-px flex-grow bg-gradient-to-r from-zinc-800 to-transparent group-hover:from-emerald-900/40 transition-all duration-700" />
    </div>

    {/* Skills Grid */}
    <div className="flex flex-wrap gap-3">
      {items.map((item, index) => (
        <div
          key={item}
          className="relative group/item"
        >
          <div className="relative px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:border-emerald-500/30 hover:bg-zinc-900 transition-all duration-300 flex items-center gap-2.5">
            {/* Subtle indicator */}
            <div className="h-1 w-1 rounded-full bg-zinc-700 group-hover/item:bg-emerald-500 transition-colors" />

            <span className="text-zinc-400 text-sm font-medium tracking-tight group-hover/item:text-zinc-100 transition-colors">
              {item}
            </span>
          </div>

          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 -z-10 bg-emerald-500/5 blur-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
        </div>
      ))}
    </div>
  </div>
);

export default SkillGroup;