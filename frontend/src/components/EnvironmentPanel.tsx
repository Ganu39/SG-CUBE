import React from "react";
import { Users, Home, Sun, Volume2, ShieldCheck } from "lucide-react";
import type { EnvironmentState } from "@/types";

interface EnvironmentPanelProps {
  data: EnvironmentState;
}

export const EnvironmentPanel: React.FC<EnvironmentPanelProps> = ({ data }) => {
  return (
    <div className="hud-panel p-3.5 flex flex-col justify-between h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22D3EE]" />
          <h2 className="hud-heading text-xs tracking-wider">ENVIRONMENT</h2>
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2.5 my-auto py-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <Users className="w-3.5 h-3.5 text-cyan-400/80" />
            <span className="text-text-secondary">People</span>
          </div>
          <span className="font-mono text-white font-medium">{data.people || "0"}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <Home className="w-3.5 h-3.5 text-cyan-400/80" />
            <span className="text-text-secondary">Room</span>
          </div>
          <span className="font-mono text-white font-medium">{data.room || "Unknown"}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <Sun className="w-3.5 h-3.5 text-cyan-400/80" />
            <span className="text-text-secondary">Lighting</span>
          </div>
          <span className="font-mono text-white font-medium">{data.lighting || "Normal"}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400/80" />
            <span className="text-text-secondary">Noise</span>
          </div>
          <span className="font-mono text-white font-medium">{data.noise || "Low"}</span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-cyan-500/10">
          <div className="flex items-center gap-2 text-text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400/80" />
            <span className="text-text-secondary">Safety</span>
          </div>
          <span
            className={`font-mono font-semibold ${
              data.safety === "Clear" ? "text-cyan-400" : "text-amber-400"
            }`}
          >
            {data.safety || "Clear"}
          </span>
        </div>
      </div>
    </div>
  );
};
