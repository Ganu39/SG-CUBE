import React, { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";

interface BottomBarProps {
  currentTranscription?: string;
}

export const BottomBar: React.FC<BottomBarProps> = ({ currentTranscription }) => {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };
      setTimeStr(now.toLocaleDateString("en-US", options));
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full h-8 px-4 flex items-center justify-between border-t border-cyan-500/20 bg-[#060B1A]/80 backdrop-blur-md text-[11px] text-text-muted select-none z-30">
      {/* Brand & Edition */}
      <div className="flex items-center gap-2 font-mono">
        <span className="text-white font-medium">SG CUBE 2.5.0</span>
        <span>|</span>
        <span className="text-text-secondary">Your Personal AI Companion</span>
      </div>

      {/* Center Speech / Assistive Dialogue Banner */}
      <div className="flex-1 max-w-xl mx-4 flex items-center justify-center">
        {currentTranscription ? (
          <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-400/40 text-cyan-200 animate-pulse text-xs font-mono truncate">
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            <span className="truncate">{currentTranscription}</span>
          </div>
        ) : (
          <span className="text-text-muted/60 text-xs tracking-wider font-mono">
            System Online • Voice & Vision Continuous
          </span>
        )}
      </div>

      {/* Date & Time */}
      <div className="font-mono text-cyan-300/90 tracking-wide">
        {timeStr || "Sunday, September 27, 2026 | 11:23 PM"}
      </div>
    </footer>
  );
};
