import React, { useState } from "react";
import { Mic, MicOff, Camera, VideoOff, Square, Power, Send } from "lucide-react";
import type { SystemStatus, AssistantState } from "@/types";

interface QuickActionsProps {
  status: SystemStatus;
  state: AssistantState;
  onSendAction: (action: string, payload?: any) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  status,
  state,
  onSendAction,
}) => {
  const [inputText, setInputText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendAction("SEND_TEXT", { text: inputText });
    setInputText("");
  };

  const isSleeping = state === "SLEEPING";

  return (
    <div className="w-full flex items-center justify-between gap-3 px-4 py-1.5 bg-[#060B1A]/90 border-t border-cyan-500/20 backdrop-blur-md select-none z-20">
      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        {/* Wake / Sleep */}
        <button
          onClick={() => onSendAction(isSleeping ? "WAKE" : "SLEEP")}
          className={`px-3 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm ${
            isSleeping
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 hover:bg-cyan-500/30"
              : "bg-black/40 text-text-muted border border-cyan-500/20 hover:text-white hover:border-cyan-400"
          }`}
          title={isSleeping ? "Wake Assistant" : "Sleep Mode"}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isSleeping ? "WAKE" : "SLEEP"}</span>
        </button>

        {/* Mic Toggle */}
        <button
          onClick={() => onSendAction("TOGGLE_MIC")}
          className="px-3 py-1 rounded-md text-xs font-mono text-text-muted border border-cyan-500/20 bg-black/40 hover:text-cyan-300 hover:border-cyan-400 flex items-center gap-1.5 transition-colors"
          title="Toggle Microphone"
        >
          {status.microphone === "Active" ? (
            <>
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>MIC ACTIVE</span>
            </>
          ) : (
            <>
              <MicOff className="w-3.5 h-3.5 text-red-400" />
              <span>MIC MUTED</span>
            </>
          )}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={() => onSendAction("TOGGLE_CAMERA")}
          className="px-3 py-1 rounded-md text-xs font-mono text-text-muted border border-cyan-500/20 bg-black/40 hover:text-cyan-300 hover:border-cyan-400 flex items-center gap-1.5 transition-colors"
          title="Toggle Camera"
        >
          {status.camera === "Active" ? (
            <>
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>CAM ACTIVE</span>
            </>
          ) : (
            <>
              <VideoOff className="w-3.5 h-3.5 text-amber-400" />
              <span>CAM PAUSED</span>
            </>
          )}
        </button>

        {/* Emergency STOP */}
        <button
          onClick={() => onSendAction("STOP")}
          className="px-3 py-1 rounded-md text-xs font-mono font-bold text-red-400 border border-red-500/40 bg-red-950/20 hover:bg-red-900/40 flex items-center gap-1.5 transition-colors shadow-[0_0_8px_rgba(239,68,68,0.2)]"
          title="Emergency Stop / Cancel Action"
        >
          <Square className="w-3.5 h-3.5 fill-red-400 text-red-400" />
          <span>STOP</span>
        </button>
      </div>

      {/* Quick Text Command Input */}
      <form onSubmit={handleSend} className="flex-1 max-w-md flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a command or query (e.g. 'Tokyo weather', 'what do you see?')..."
            className="w-full px-3 py-1 rounded bg-black/60 border border-cyan-500/30 text-white placeholder-text-muted/60 text-xs font-sans focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1 rounded bg-cyan-950/60 border border-cyan-400/50 text-cyan-200 text-xs font-mono hover:bg-cyan-800/60 flex items-center gap-1 transition-colors"
        >
          <Send className="w-3 h-3" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
