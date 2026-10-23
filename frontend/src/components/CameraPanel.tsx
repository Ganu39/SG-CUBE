import React, { useState } from "react";
import { Camera, Maximize2, RefreshCw } from "lucide-react";

interface CameraPanelProps {
  cameraActive: boolean;
  fps: number;
  onToggleCamera?: () => void;
}

export const CameraPanel: React.FC<CameraPanelProps> = ({
  cameraActive,
  fps = 25,
  onToggleCamera,
}) => {
  const [streamError, setStreamError] = useState(false);
  const streamUrl = "/api/camera/stream";

  return (
    <div className="relative w-full h-full rounded-md bg-[#020305] border border-cyan-500/30 overflow-hidden flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
      {/* Top HUD Overlay Bar inside camera */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* LIVE indicator */}
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-red-400 text-xs font-mono font-bold tracking-wider shadow-[0_0_8px_rgba(239,68,68,0.4)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            <span>LIVE</span>
          </div>

          {/* FPS Badge */}
          <div className="px-2 py-0.5 rounded bg-black/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            {cameraActive ? `${fps} FPS` : "OFFLINE"}
          </div>
        </div>

        {/* Camera action buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={onToggleCamera}
            className="w-7 h-7 rounded bg-black/60 border border-cyan-500/30 flex items-center justify-center text-text-muted hover:text-cyan-300 transition-colors shadow"
            title={cameraActive ? "Pause Camera" : "Resume Camera"}
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setStreamError(false)}
            className="w-7 h-7 rounded bg-black/60 border border-cyan-500/30 flex items-center justify-center text-text-muted hover:text-cyan-300 transition-colors shadow"
            title="Refresh Video Feed"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-7 h-7 rounded bg-black/60 border border-cyan-500/30 flex items-center justify-center text-text-muted hover:text-cyan-300 transition-colors shadow"
            title="Fullscreen Video"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Video Content */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center bg-black/90">
        {cameraActive && !streamError ? (
          <img
            src={streamUrl}
            alt="Live Vision Feed"
            onError={() => setStreamError(true)}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-text-muted">
            <div className="w-14 h-14 rounded-full border border-cyan-500/20 bg-cyan-950/20 flex items-center justify-center">
              <Camera className="w-7 h-7 text-cyan-500/40" />
            </div>
            <div className="text-center font-mono text-sm">
              <span className="text-text-secondary">Vision Feed Paused</span>
              <p className="text-xs text-text-muted mt-1">Camera standby • Computer use active</p>
            </div>
          </div>
        )}

        {/* Futuristic Corner Reticle Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />
      </div>
    </div>
  );
};
