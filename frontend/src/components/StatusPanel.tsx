import React from "react";
import { Activity, Battery, ChevronRight } from "lucide-react";
import type { SystemStatus } from "@/types";

interface StatusPanelProps {
  status: SystemStatus;
  onOpenDetails?: () => void;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ status, onOpenDetails }) => {
  return (
    <div className="hud-panel p-3.5 flex flex-col justify-between h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <h2 className="hud-heading text-xs tracking-wider">SYSTEM STATUS</h2>
        </div>
        <button
          onClick={onOpenDetails}
          className="text-text-muted hover:text-cyan-300 transition-colors"
          title="System Diagnostics"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Status Item Rows */}
      <div className="flex flex-col gap-2 my-auto py-1 text-xs">
        {/* Camera */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Camera</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                status.camera === "Active"
                  ? "bg-cyan-400 shadow-[0_0_6px_#22D3EE]"
                  : "bg-amber-400 shadow-[0_0_6px_#F59E0B]"
              }`}
            />
            <span
              className={
                status.camera === "Active" ? "text-cyan-300 font-medium" : "text-amber-300 font-medium"
              }
            >
              {status.camera}
            </span>
          </div>
        </div>

        {/* Microphone */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Microphone</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                status.microphone === "Active"
                  ? "bg-cyan-400 shadow-[0_0_6px_#22D3EE]"
                  : "bg-red-400 shadow-[0_0_6px_#EF4444]"
              }`}
            />
            <span className="text-cyan-300 font-medium">{status.microphone}</span>
          </div>
        </div>

        {/* Speaker */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Speaker</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                status.speaker === "Active"
                  ? "bg-cyan-400 shadow-[0_0_6px_#22D3EE]"
                  : "bg-red-400 shadow-[0_0_6px_#EF4444]"
              }`}
            />
            <span className="text-cyan-300 font-medium">{status.speaker}</span>
          </div>
        </div>

        {/* AI (Gemini) */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">AI (Gemini)</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                status.ai === "Ready"
                  ? "bg-cyan-400 shadow-[0_0_6px_#22D3EE]"
                  : "bg-amber-400 shadow-[0_0_6px_#F59E0B]"
              }`}
            />
            <span className="text-cyan-300 font-medium">{status.ai}</span>
          </div>
        </div>

        {/* Battery */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Battery</span>
          <div className="flex items-center gap-1.5 font-mono">
            <Battery className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300 font-medium">{status.battery || "100%"}</span>
          </div>
        </div>

        {/* Network */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Network</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                status.network === "Online"
                  ? "bg-cyan-400 shadow-[0_0_6px_#22D3EE]"
                  : "bg-red-400 shadow-[0_0_6px_#EF4444]"
              }`}
            />
            <span className="text-cyan-300 font-medium">{status.network}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
