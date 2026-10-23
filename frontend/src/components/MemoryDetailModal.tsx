import React from "react";
import { X, Database, Shield, Lock } from "lucide-react";
import type { MemoryItem } from "@/types";

interface MemoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
}

export const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  isOpen,
  onClose,
  memories,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="hud-panel w-full max-w-2xl bg-[#060B1A]/95 border border-cyan-400/50 p-6 rounded-lg shadow-[0_0_40px_rgba(34,211,238,0.2)] flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wider font-mono">
              PERSISTENT MEMORY & VAULT EXPLORER
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-cyan-500/30 flex items-center justify-center text-text-muted hover:text-white hover:border-cyan-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Memory Items List */}
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          {memories.length > 0 ? (
            memories.map((m, i) => (
              <div
                key={i}
                className="p-3 rounded bg-black/40 border border-cyan-500/20 flex flex-col gap-1 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold uppercase">{m.key}</span>
                  <span className="text-[10px] text-text-muted">Local SQLite v2</span>
                </div>
                <p className="text-white text-xs font-sans tracking-wide mt-0.5">{m.value}</p>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-text-muted font-mono text-xs">
              No custom memories stored yet. Say: "Remember that my favourite color is cyan"
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded bg-cyan-950/20 border border-cyan-400/20 flex items-center gap-2.5 text-xs text-text-muted font-mono">
          <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Protected memories require verified biometric speaker voice password.</span>
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
