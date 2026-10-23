import React from "react";
import { Clock, ChevronRight } from "lucide-react";
import type { HistoryItem } from "@/types";

interface HistoryPanelProps {
  items: HistoryItem[];
  onViewAll?: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ items, onViewAll }) => {
  return (
    <div className="hud-panel p-3.5 flex flex-col h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <h2 className="hud-heading text-xs tracking-wider">RECENT HISTORY</h2>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs text-cyan-400/80 hover:text-cyan-300 flex items-center gap-0.5 transition-colors font-mono"
        >
          <span>View All</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* History Turn Rows */}
      <div className="flex-1 flex flex-col justify-around py-1 gap-1.5 overflow-hidden">
        {items.slice(0, 5).map((item, idx) => {
          const isUser = item.sender === "user";
          return (
            <div
              key={idx}
              className="flex items-baseline gap-2 text-xs py-1 border-b border-cyan-500/5 last:border-none"
            >
              <span className="font-mono text-text-muted text-[11px] shrink-0">
                {item.time || "23:11"}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase shrink-0 ${
                  isUser
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-400/30"
                    : "bg-cyan-950/40 text-cyan-400 border border-cyan-500/40"
                }`}
              >
                {isUser ? "You" : "AI"}
              </span>
              <p className="text-white text-xs truncate max-w-full font-sans tracking-wide">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
