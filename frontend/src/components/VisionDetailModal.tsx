import React from "react";
import { X, Eye, Scan, Target, CheckCircle2 } from "lucide-react";
import type { EnvironmentState, SceneState } from "@/types";

interface VisionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  env: EnvironmentState;
  scene: SceneState;
}

export const VisionDetailModal: React.FC<VisionDetailModalProps> = ({
  isOpen,
  onClose,
  env,
  scene,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="hud-panel w-full max-w-2xl bg-[#060B1A]/95 border border-cyan-400/50 p-6 rounded-lg shadow-[0_0_40px_rgba(34,211,238,0.2)] flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wider font-mono">
              VISION & SPATIAL PERCEPTION MATRIX
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-cyan-500/30 flex items-center justify-center text-text-muted hover:text-white hover:border-cyan-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded bg-black/40 border border-cyan-500/20 flex flex-col gap-2">
            <span className="text-cyan-400 font-bold tracking-wider">ENVIRONMENT ANALYSIS</span>
            <div className="flex justify-between py-1 border-b border-cyan-500/10">
              <span className="text-text-muted">Detected Location:</span>
              <span className="text-white">{env.room}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cyan-500/10">
              <span className="text-text-muted">People in View:</span>
              <span className="text-white">{env.people}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cyan-500/10">
              <span className="text-text-muted">Ambient Lux:</span>
              <span className="text-white">{env.lighting}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cyan-500/10">
              <span className="text-text-muted">Acoustic Floor:</span>
              <span className="text-white">{env.noise}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted">Safety Vector:</span>
              <span className="text-cyan-400 font-bold">{env.safety}</span>
            </div>
          </div>

          <div className="p-3 rounded bg-black/40 border border-cyan-500/20 flex flex-col gap-2">
            <span className="text-cyan-400 font-bold tracking-wider">SPATIAL SECTORS</span>
            <div className="flex justify-between py-1 border-b border-cyan-500/10">
              <span className="text-text-muted">Left Sector:</span>
              <span className="text-white">{scene.left}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cyan-500/10">
              <span className="text-text-muted">Center Crosshair:</span>
              <span className="text-white">{scene.center}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cyan-500/10">
              <span className="text-text-muted">Right Sector:</span>
              <span className="text-white">{scene.right}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cyan-500/10">
              <span className="text-text-muted">Floor Clearance:</span>
              <span className="text-white">{scene.path}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted">Total Objects:</span>
              <span className="text-cyan-400 font-bold">{scene.people}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-950/60 border border-cyan-400/50 text-cyan-200 text-xs font-mono hover:bg-cyan-900/60 transition-colors"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};
