import React, { useState, useEffect } from "react";
import {
  X,
  Sliders,
  Volume2,
  Sun,
  Shield,
  Trash2,
  CheckCircle2,
  Key,
  Activity,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  XCircle,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendAction: (action: string, payload?: any) => void;
  settings?: {
    user_name?: string;
    voice?: string;
    speech_rate?: number;
    sensitivity?: number;
    volume?: number;
    brightness?: number;
  };
  fetchSetupStatus?: () => Promise<any>;
  testApiKey?: (key: string) => Promise<any>;
  saveApiKey?: (key: string, slot?: number) => Promise<any>;
  removeApiKey?: (slot?: number) => Promise<any>;
  onOpenDiagnostics?: () => void;
  onOpenSetupWizard?: () => void;
  onOpenVault?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSendAction,
  settings = {},
  fetchSetupStatus,
  testApiKey,
  saveApiKey,
  removeApiKey,
  onOpenDiagnostics,
  onOpenSetupWizard,
  onOpenVault,
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "audio" | "privacy" | "api">("general");
  const [userName, setUserName] = useState(settings.user_name || "User");
  const [voice, setVoice] = useState(settings.voice || "Default");
  const [volume, setVolume] = useState(settings.volume || 50);
  const [brightness, setBrightness] = useState(settings.brightness || 70);
  const [sensitivity, setSensitivity] = useState(settings.sensitivity || 0.7);
  const [savedAlert, setSavedAlert] = useState(false);

  // API Key Tab State
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [showKeyText, setShowKeyText] = useState<boolean>(false);
  const [maskedKeys, setMaskedKeys] = useState<{ [key: string]: string }>({
    "1": "",
    "2": "",
    "3": "",
  });
  const [apiFeedback, setApiFeedback] = useState<{ status: string; msg: string }>({
    status: "",
    msg: "",
  });
  const [testingKey, setTestingKey] = useState<boolean>(false);
  const [savingKey, setSavingKey] = useState<boolean>(false);

  const loadKeys = async () => {
    if (fetchSetupStatus) {
      const status = await fetchSetupStatus();
      if (status && status.keys) {
        const newMasks: { [key: string]: string } = {};
        for (const k of ["1", "2", "3"]) {
          newMasks[k] = status.keys[k]?.masked || "";
        }
        setMaskedKeys(newMasks);
      } else if (status && status.masked_key) {
        setMaskedKeys((prev) => ({ ...prev, "1": status.masked_key }));
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadKeys();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSendAction("SAVE_SETTINGS", {
      user_name: userName,
      voice: voice,
      volume: Number(volume),
      brightness: Number(brightness),
      sensitivity: Number(sensitivity),
    });
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  const handleClearMemory = () => {
    onSendAction("CLEAR_MEMORY");
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  const handleLockVault = () => {
    onSendAction("LOCK_VAULT");
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  const handleTestKey = async () => {
    if (!apiKeyInput.trim()) {
      setApiFeedback({ status: "error", msg: "Please enter an API key to test." });
      return;
    }
    if (!testApiKey) return;
    setTestingKey(true);
    setApiFeedback({ status: "validating", msg: "Testing connection with Google Gemini..." });
    try {
      const res = await testApiKey(apiKeyInput.trim());
      if (res && res.valid) {
        setApiFeedback({ status: "valid", msg: "API Key validated successfully!" });
      } else {
        setApiFeedback({ status: "error", msg: res?.message || "Invalid API key." });
      }
    } catch (e: any) {
      setApiFeedback({ status: "error", msg: e.message || "Test failed" });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) {
      setApiFeedback({ status: "error", msg: "Please enter an API key." });
      return;
    }
    if (!saveApiKey) return;
    setSavingKey(true);
    try {
      const res = await saveApiKey(apiKeyInput.trim(), selectedSlot);
      if (res && res.status === "ok") {
        setMaskedKeys((prev) => ({ ...prev, [selectedSlot.toString()]: res.masked_key }));
        setApiKeyInput("");
        setApiFeedback({
          status: "valid",
          msg: `Slot ${selectedSlot} key encrypted and saved via DPAPI.`,
        });
      } else {
        setApiFeedback({ status: "error", msg: res?.message || "Failed to save key." });
      }
    } catch (e: any) {
      setApiFeedback({ status: "error", msg: e.message || "Error saving key." });
    } finally {
      setSavingKey(false);
    }
  };

  const handleRemoveKey = async (slot: number) => {
    if (!removeApiKey) return;
    try {
      await removeApiKey(slot);
      setMaskedKeys((prev) => ({ ...prev, [slot.toString()]: "" }));
      setApiFeedback({ status: "valid", msg: `Slot ${slot} key removed.` });
    } catch (e: any) {
      setApiFeedback({ status: "error", msg: `Remove failed: ${e.message}` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-xl bg-[#0A1226] border border-cyan-500/40 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.25)] flex flex-col overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-cyan-500/20 bg-[#060B1A]/80">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sliders className="w-5 h-5" />
            <h2 className="text-base font-bold tracking-wide">SG CUBE Settings & Controls</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-cyan-500/20 bg-black/30 px-4 pt-2 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === "general"
                ? "border-cyan-400 text-cyan-300 font-bold"
                : "border-transparent text-text-muted hover:text-white"
            }`}
          >
            General & Voice
          </button>
          <button
            onClick={() => setActiveTab("audio")}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === "audio"
                ? "border-cyan-400 text-cyan-300 font-bold"
                : "border-transparent text-text-muted hover:text-white"
            }`}
          >
            Display & Audio
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === "privacy"
                ? "border-cyan-400 text-cyan-300 font-bold"
                : "border-transparent text-text-muted hover:text-white"
            }`}
          >
            Security & Memory
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`pb-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "api"
                ? "border-cyan-400 text-cyan-300 font-bold"
                : "border-transparent text-text-muted hover:text-white"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API & Tools</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 space-y-4 text-sm font-sans overflow-y-auto max-h-[60vh]">
          {savedAlert && (
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-xs font-mono animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Settings updated successfully!
            </div>
          )}

          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-cyan-400 mb-1">User Display Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-cyan-500/30 text-white focus:outline-none focus:border-cyan-400 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-cyan-400 mb-1">Assistant Voice Profile</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-cyan-500/30 text-white focus:outline-none focus:border-cyan-400 font-mono text-xs"
                >
                  <option value="Default">SG CUBE Default (Neural Puck)</option>
                  <option value="Male">Natural Male (Charon)</option>
                  <option value="Female">Natural Female (Kore)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-cyan-400 mb-1">
                  Wake-Word Sensitivity ({Math.round(sensitivity * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          )}

          {activeTab === "audio" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" /> System Master Volume
                  </span>
                  <span>{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => {
                    setVolume(parseInt(e.target.value));
                    onSendAction("SET_VOLUME", { volume: parseInt(e.target.value) });
                  }}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5" /> Display Brightness
                  </span>
                  <span>{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => {
                    setBrightness(parseInt(e.target.value));
                    onSendAction("SET_BRIGHTNESS", { brightness: parseInt(e.target.value) });
                  }}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-cyan-500/20 bg-black/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" /> Secure Password Vault
                  </h4>
                  <p className="text-[11px] text-text-muted">Manage credentials or lock cryptographic storage</p>
                </div>
                <div className="flex items-center gap-2">
                  {onOpenVault && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenVault();
                      }}
                      className="px-3 py-1 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-200 hover:bg-cyan-500/30 text-xs font-mono font-bold transition-all shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                    >
                      Open Vault
                    </button>
                  )}
                  <button
                    onClick={handleLockVault}
                    className="px-3 py-1 rounded bg-amber-900/40 border border-amber-500/40 text-amber-300 hover:bg-amber-800/60 text-xs font-mono transition-colors"
                  >
                    Lock Vault
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-red-500/20 bg-black/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-red-400" /> Ephemeral Memory Cache
                  </h4>
                  <p className="text-[11px] text-text-muted">Flush interaction and search artifacts</p>
                </div>
                <button
                  onClick={handleClearMemory}
                  className="px-3 py-1 rounded bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/60 text-xs font-mono transition-colors"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-4">
              {/* Slot Selector */}
              <div>
                <label className="block text-xs font-mono text-cyan-400 mb-1.5">
                  Gemini API Key Slots (Multi-Key Failover)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((slot) => {
                    const isConfigured = Boolean(maskedKeys[slot.toString()]);
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-lg border text-xs font-mono flex flex-col items-center justify-center gap-1 transition-all ${
                          selectedSlot === slot
                            ? "bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                            : "bg-black/40 border-cyan-500/20 text-text-muted hover:text-white"
                        }`}
                      >
                        <span className="font-bold">Key Slot {slot}</span>
                        <span
                          className={`text-[10px] ${
                            isConfigured ? "text-emerald-400" : "text-text-muted"
                          }`}
                        >
                          {isConfigured ? "Configured" : "Empty"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Current Masked Key */}
              {maskedKeys[selectedSlot.toString()] && (
                <div className="p-3 rounded-lg bg-black/50 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-text-muted block">SLOT {selectedSlot} ACTIVE KEY:</span>
                    <span className="text-emerald-400 font-bold tracking-widest">
                      {maskedKeys[selectedSlot.toString()]}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveKey(selectedSlot)}
                    className="px-2.5 py-1 rounded bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/60 text-xs font-mono flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              )}

              {/* Input New / Update Key */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-cyan-400">
                  {maskedKeys[selectedSlot.toString()]
                    ? `Update Slot ${selectedSlot} Key:`
                    : `Enter Key for Slot ${selectedSlot}:`}
                </label>
                <div className="relative">
                  <input
                    type={showKeyText ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-3 pr-10 py-1.5 rounded-lg bg-black/40 border border-cyan-500/30 text-white placeholder-text-muted/50 font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="absolute right-2.5 top-2 text-text-muted hover:text-white"
                  >
                    {showKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Key Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestKey}
                  disabled={testingKey || !apiKeyInput.trim()}
                  className="px-3 py-1.5 rounded bg-black/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingKey ? "animate-spin" : ""}`} />
                  <span>Test Key</span>
                </button>

                <button
                  onClick={handleSaveKey}
                  disabled={savingKey || !apiKeyInput.trim()}
                  className="px-3.5 py-1.5 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-200 hover:bg-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save to Slot {selectedSlot}</span>
                </button>
              </div>

              {apiFeedback.msg && (
                <div
                  className={`p-2.5 rounded text-xs font-mono flex items-center gap-2 ${
                    apiFeedback.status === "valid"
                      ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-300"
                      : apiFeedback.status === "error"
                      ? "bg-red-950/40 border border-red-500/40 text-red-300"
                      : "bg-cyan-950/40 border border-cyan-500/40 text-cyan-300"
                  }`}
                >
                  {apiFeedback.status === "valid" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : apiFeedback.status === "error" ? (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" />
                  )}
                  <span>{apiFeedback.msg}</span>
                </div>
              )}

              {/* Diagnostics & Setup Links */}
              <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenDiagnostics) onOpenDiagnostics();
                  }}
                  className="px-3 py-1.5 rounded bg-black/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Run System Diagnostics</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onOpenSetupWizard) onOpenSetupWizard();
                  }}
                  className="px-3 py-1.5 rounded bg-black/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Re-launch Setup Wizard</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-cyan-500/20 bg-[#060B1A]/80 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-cyan-500/20 text-text-muted hover:text-white hover:bg-white/5 text-xs font-mono transition-colors"
          >
            Close
          </button>
          {activeTab !== "api" && (
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)]"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
