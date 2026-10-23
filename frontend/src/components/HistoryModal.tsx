import React, { useState, useEffect } from "react";
import { X, Clock, RefreshCw, MessageSquare, Bot, User } from "lucide-react";
import type { HistoryItem } from "@/types";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  getHttpBase: () => string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, getHttpBase }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getHttpBase()}/api/history`);
      if (res.ok) {
        const json = await res.json();
        setSessions(json.sessions || []);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="hud-panel w-full max-w-2xl bg-[#060B1A]/95 border border-cyan-400/50 p-6 rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.25)] flex flex-col gap-4 text-white animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold tracking-wider font-mono">
              CONVERSATION ARCHIVE & SESSION LOGS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="px-2.5 py-1 rounded bg-black/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded border border-cyan-500/30 flex items-center justify-center text-text-muted hover:text-white hover:border-cyan-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sessions & Messages List */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {sessions.length > 0 ? (
            sessions.map((s, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-[11px] font-mono text-cyan-400/80 bg-cyan-950/20 px-3 py-1 rounded border border-cyan-500/20 flex justify-between">
                  <span>Session: {s.session?.session_id?.slice(0, 16) || "Active"}</span>
                  <span>{s.messages?.length || 0} messages</span>
                </div>
                <div className="space-y-1.5 pl-2">
                  {s.messages && s.messages.length > 0 ? (
                    s.messages.map((m: any, mIdx: number) => (
                      <div
                        key={mIdx}
                        className={`p-2.5 rounded-lg border text-xs font-sans ${
                          m.sender === "user"
                            ? "bg-black/50 border-cyan-500/20 ml-6"
                            : "bg-cyan-950/30 border-cyan-400/30 mr-6 text-cyan-100"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted mb-1">
                          {m.sender === "user" ? (
                            <>
                              <User className="w-3 h-3 text-text-secondary" />
                              <span>You</span>
                            </>
                          ) : (
                            <>
                              <Bot className="w-3 h-3 text-cyan-400" />
                              <span className="text-cyan-300 font-bold">SG CUBE</span>
                            </>
                          )}
                        </div>
                        <p>{m.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-text-muted font-mono italic">No messages in this session.</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-text-muted font-mono text-xs space-y-2">
              <MessageSquare className="w-8 h-8 text-cyan-500/40 mx-auto" />
              <p>No past conversation sessions recorded yet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20 text-xs font-mono text-text-muted">
          <span>Persistent SQLite conversations.db with FTS5 indexing</span>
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
