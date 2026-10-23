import React, { useState, useEffect } from "react";
import { X, Activity, RefreshCw, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import type { DiagnosticResult } from "@/types";

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  runDiagnostics: () => Promise<DiagnosticResult>;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  isOpen,
  onClose,
  runDiagnostics,
}) => {
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const executeCheck = async () => {
    setLoading(true);
    try {
      const res = await runDiagnostics();
      setResult(res);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      executeCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="hud-panel w-full max-w-2xl bg-[#060B1A]/95 border border-cyan-400/50 p-6 rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.25)] flex flex-col gap-4 text-white animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold tracking-wider font-mono">
              SYSTEM HARDWARE & RUNTIME DIAGNOSTICS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={executeCheck}
              disabled={loading}
              className="px-2.5 py-1 rounded bg-black/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Re-run Diagnostics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
              <span>Re-check</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded border border-cyan-500/30 flex items-center justify-center text-text-muted hover:text-white hover:border-cyan-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overall Status Banner */}
        {result && (
          <div
            className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
              result.overall === "PASS"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : result.overall === "WARNING"
                ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                : "bg-red-950/40 border-red-500/40 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {result.overall === "PASS" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : result.overall === "WARNING" ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className="font-bold">SYSTEM INTEGRITY STATUS: {result.overall}</span>
            </div>
            <span className="text-[10px] text-text-muted">
              {result.checks.filter((c) => c.status === "PASS").length} / {result.checks.length} Tests Passed
            </span>
          </div>
        )}

        {/* Checks List */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {loading && !result ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-cyan-400 font-mono text-xs">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Querying hardware interfaces & local AI models...</span>
            </div>
          ) : result?.checks ? (
            result.checks.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 text-xs font-mono flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{c.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === "PASS"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                        : c.status === "WARNING"
                        ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                        : "bg-red-950 text-red-300 border border-red-500/40"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary font-sans">{c.details}</p>
                {c.remedy && (
                  <p className="text-[11px] text-amber-300/90 bg-amber-950/20 p-2 rounded border border-amber-500/20 font-sans mt-0.5">
                    💡 <span className="font-semibold">Recommended Action:</span> {c.remedy}
                  </p>
                )}
              </div>
            ))
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20 text-xs font-mono text-text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Direct local telemetry from Windows kernel
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-950/60 border border-cyan-400/50 text-cyan-200 text-xs font-mono hover:bg-cyan-900/60 transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
