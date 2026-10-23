import React, { useState, useEffect } from "react";
import { X, Glasses, Bluetooth, Video, ShieldCheck, RefreshCw } from "lucide-react";

interface GlassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  getHttpBase: () => string;
}

export const GlassesModal: React.FC<GlassesModalProps> = ({ isOpen, onClose, getHttpBase }) => {
  const [status, setStatus] = useState<any>({
    bridge_state: "DISCONNECTED",
    active_source: "LAPTOP",
    battery_level: null,
    streaming: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getHttpBase()}/api/glasses/status`);
      if (res.ok) {
        const json = await res.json();
        setStatus(json);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConnect = async () => {
    setLoading(true);
    setFeedback("Connecting to Ray-Ban Meta BLE interface...");
    try {
      const res = await fetch(`${getHttpBase()}/api/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_GLASSES" }),
      });
      const data = await res.json();
      setFeedback(data.message || "Meta Glass link state toggled.");
      fetchStatus();
    } catch (e: any) {
      setFeedback(`Connection error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="hud-panel w-full max-w-xl bg-[#060B1A]/95 border border-cyan-400/50 p-6 rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.25)] flex flex-col gap-4 text-white animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Glasses className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold tracking-wider font-mono">
              RAY-BAN META SMART GLASSES BRIDGE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-cyan-500/30 flex items-center justify-center text-text-muted hover:text-white hover:border-cyan-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* State Card */}
        <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/30 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Bluetooth className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">BLE Peripheral Link</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    status.bridge_state === "CONNECTED" || status.bridge_state === "STREAMING"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                      : "bg-black/60 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {status.bridge_state}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">
                Active Source: {status.active_source} (Laptop Camera primary)
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleConnect}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-40 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Connect Glasses</span>
          </button>
        </div>

        {feedback && (
          <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            {feedback}
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 flex flex-col gap-1">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" /> VIDEO STREAMING
            </span>
            <p className="text-[11px] text-text-muted font-sans">
              Ultra-low latency WiFi/BLE video frames routed to local YuNet face detector and spatial perception engine.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 flex flex-col gap-1">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> HARDWARE FAILOVER
            </span>
            <p className="text-[11px] text-text-muted font-sans">
              Automatic fallback to laptop webcam if glasses are out of range or in standby charging case.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20 text-xs font-mono text-text-muted">
          <span>Ray-Ban Meta BLE Peripheral GATT Server link</span>
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
