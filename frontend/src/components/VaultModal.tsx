import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface VaultRecordMeta {
  key: string;
  category: string;
  created_at?: number;
}

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  getHttpBase?: () => string;
}

export const VaultModal: React.FC<VaultModalProps> = ({
  isOpen,
  onClose,
  getHttpBase = () => "",
}) => {
  const [isSetup, setIsSetup] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [recordCount, setRecordCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Setup Form
  const [setupMasterPw, setSetupMasterPw] = useState<string>("");
  const [setupConfirmPw, setSetupConfirmPw] = useState<string>("");
  const [showSetupPw, setShowSetupPw] = useState<boolean>(false);

  // Unlock Form
  const [unlockMasterPw, setUnlockMasterPw] = useState<string>("");
  const [showUnlockPw, setShowUnlockPw] = useState<boolean>(false);

  // Records & Search
  const [records, setRecords] = useState<VaultRecordMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [revealedPasswords, setRevealedPasswords] = useState<{ [key: string]: string }>({});
  const [visibleState, setVisibleState] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Add Credential Form
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newKey, setNewKey] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("credentials");
  const [showNewValue, setShowNewValue] = useState<boolean>(false);

  // Status & Error Messages
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${getHttpBase()}/api/vault/status`);
      const data = await res.json();
      if (data.status === "ok") {
        setIsSetup(data.is_setup);
        setIsUnlocked(data.is_unlocked);
        setRecordCount(data.record_count || 0);
        if (data.is_unlocked) {
          fetchRecords();
        } else {
          setRecords([]);
          setRevealedPasswords({});
          setVisibleState({});
        }
      }
    } catch {
      setStatusMsg({ type: "error", text: "Failed to connect to Secure Vault service." });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await fetch(`${getHttpBase()}/api/vault/records`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch {
      //
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Vault Setup
  const handleSetupVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupMasterPw.length < 6) {
      setStatusMsg({ type: "error", text: "Master password must be at least 6 characters." });
      return;
    }
    if (setupMasterPw !== setupConfirmPw) {
      setStatusMsg({ type: "error", text: "Master passwords do not match. Please verify." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${getHttpBase()}/api/vault/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ master_password: setupMasterPw }),
      });
      const data = await res.json();
      if (res.ok && data.status === "ok") {
        setStatusMsg({ type: "success", text: "Password Vault successfully created and unlocked!" });
        setSetupMasterPw("");
        setSetupConfirmPw("");
        await fetchStatus();
      } else {
        setStatusMsg({ type: "error", text: data.message || "Failed to set up vault." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Network error configuring vault." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Unlock Vault
  const handleUnlockVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockMasterPw) {
      setStatusMsg({ type: "error", text: "Please enter your master password." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${getHttpBase()}/api/vault/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ master_password: unlockMasterPw }),
      });
      const data = await res.json();
      if (res.ok && data.status === "ok") {
        setStatusMsg({ type: "success", text: "Vault unlocked." });
        setUnlockMasterPw("");
        await fetchStatus();
      } else {
        setStatusMsg({ type: "error", text: data.message || "Invalid master password. Vault remains locked." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Failed to unlock vault." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Lock Vault
  const handleLockVault = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${getHttpBase()}/api/vault/lock`, {
        method: "POST",
      });
      if (res.ok) {
        setStatusMsg({ type: "info", text: "Secure Vault locked. Cryptographic keys purged from memory." });
        await fetchStatus();
      }
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Add Credential
  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue) {
      setStatusMsg({ type: "error", text: "Please enter both service name and password/secret." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${getHttpBase()}/api/vault/record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newKey.trim(),
          value: newValue,
          category: newCategory,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === "ok") {
        setStatusMsg({ type: "success", text: `Credential '${newKey.trim()}' securely saved with AES-256-GCM encryption.` });
        setNewKey("");
        setNewValue("");
        setIsAdding(false);
        await fetchStatus();
      } else {
        setStatusMsg({ type: "error", text: data.message || "Failed to save credential." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Error saving credential." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Toggle Show/Hide Password
  const handleToggleReveal = async (key: string) => {
    if (visibleState[key]) {
      // Currently visible -> hide
      setVisibleState((prev) => ({ ...prev, [key]: false }));
      return;
    }

    // Currently hidden -> reveal
    if (revealedPasswords[key]) {
      setVisibleState((prev) => ({ ...prev, [key]: true }));
      return;
    }

    try {
      const res = await fetch(`${getHttpBase()}/api/vault/record/reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (res.ok && data.status === "ok") {
        setRevealedPasswords((prev) => ({ ...prev, [key]: data.value }));
        setVisibleState((prev) => ({ ...prev, [key]: true }));
      } else {
        setStatusMsg({ type: "error", text: data.message || "Unable to reveal credential." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Failed to reveal credential." });
    }
  };

  // Handle Copy Password
  const handleCopyPassword = async (key: string) => {
    let secret = revealedPasswords[key];
    if (!secret) {
      try {
        const res = await fetch(`${getHttpBase()}/api/vault/record/reveal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        });
        const data = await res.json();
        if (res.ok && data.status === "ok") {
          secret = data.value;
          setRevealedPasswords((prev) => ({ ...prev, [key]: data.value }));
        }
      } catch {
        //
      }
    }

    if (secret) {
      try {
        await navigator.clipboard.writeText(secret);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2500);
      } catch {
        // Fallback for environments where clipboard API is blocked
        setStatusMsg({ type: "info", text: `Password for ${key} ready.` });
      }
    }
  };

  // Handle Delete Record
  const handleDeleteRecord = async (key: string) => {
    if (!confirm(`Are you sure you want to permanently delete the stored credential for '${key}'?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${getHttpBase()}/api/vault/record/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (res.ok && data.status === "ok") {
        setStatusMsg({ type: "success", text: `Record '${key}' removed from vault.` });
        setRevealedPasswords((prev) => {
          const c = { ...prev };
          delete c[key];
          return c;
        });
        await fetchStatus();
      } else {
        setStatusMsg({ type: "error", text: data.message || "Failed to delete record." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Error deleting record." });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered records
  const filteredRecords = records.filter(
    (r) =>
      r.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-2xl bg-[#060B1A] border border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(34,211,238,0.25)] flex flex-col overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200 max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-cyan-500/20 bg-[#0A1226]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-cyan-400/40 bg-cyan-950/40 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wide text-white">SG CUBE Secure Password Vault</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                    !isSetup
                      ? "bg-amber-950/60 text-amber-300 border border-amber-500/40"
                      : isUnlocked
                      ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                      : "bg-red-950/60 text-red-300 border border-red-500/40"
                  }`}
                >
                  {!isSetup ? (
                    <>
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>NOT CONFIGURED</span>
                    </>
                  ) : isUnlocked ? (
                    <>
                      <Unlock className="w-3 h-3 text-emerald-400" />
                      <span>UNLOCKED ({recordCount})</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-red-400" />
                      <span>LOCKED</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-text-muted font-mono">
                Hardware-Backed AES-256-GCM Encrypted Storage & Argon2id Derivation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <button
                onClick={handleLockVault}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/60 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                title="Lock Vault immediately"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Vault</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-cyan-500/20 bg-black/40 flex items-center justify-center text-text-muted hover:text-white hover:border-cyan-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMsg && (
          <div
            className={`px-6 py-2.5 text-xs font-mono flex items-center justify-between border-b ${
              statusMsg.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                : statusMsg.type === "error"
                ? "bg-red-950/40 border-red-500/30 text-red-300"
                : "bg-cyan-950/40 border-cyan-500/30 text-cyan-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : statusMsg.type === "error" ? (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
            <button onClick={() => setStatusMsg(null)} className="text-text-muted hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* CASE 1: Vault Not Set Up */}
          {!isSetup && (
            <div className="space-y-5 max-w-lg mx-auto py-2">
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-cyan-300 mb-1">Set Up Your Secure Password Vault</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Protect private passwords, ATM PINs, Wi-Fi keys, and sensitive credentials with hardware-level AES-256-GCM encryption. Choose a strong master password to initialize your personal vault.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSetupVault} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-cyan-400 mb-1.5">
                    Vault Master Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSetupPw ? "text" : "password"}
                      value={setupMasterPw}
                      onChange={(e) => setSetupMasterPw(e.target.value)}
                      placeholder="Enter strong master password (min 6 chars)..."
                      className="w-full pl-3.5 pr-10 py-2 rounded-lg bg-black/50 border border-cyan-500/30 text-white placeholder-text-muted/50 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowSetupPw(!showSetupPw)}
                      className="absolute right-2.5 top-2.5 text-text-muted hover:text-white"
                    >
                      {showSetupPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-cyan-400 mb-1.5">
                    Confirm Master Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={setupConfirmPw}
                    onChange={(e) => setSetupConfirmPw(e.target.value)}
                    placeholder="Repeat master password..."
                    className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-cyan-500/30 text-white placeholder-text-muted/50 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                  />
                  {setupConfirmPw && setupMasterPw !== setupConfirmPw && (
                    <p className="text-[11px] text-red-400 font-mono mt-1">Passwords do not match.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !setupMasterPw || setupMasterPw !== setupConfirmPw || setupMasterPw.length < 6}
                  className="w-full py-2.5 rounded-lg bg-cyan-500/25 border border-cyan-400 text-cyan-200 hover:bg-cyan-500/35 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  <span>Create & Initialize Vault</span>
                </button>
              </form>
            </div>
          )}

          {/* CASE 2: Vault Set Up but Locked */}
          {isSetup && !isUnlocked && (
            <div className="space-y-5 max-w-md mx-auto py-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-500/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.25)]">
                  <Lock className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-base font-bold text-white">Vault is Locked</h3>
                <p className="text-xs text-text-muted">
                  Enter your master password to decrypt and view stored credentials.
                </p>
              </div>

              <form onSubmit={handleUnlockVault} className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      type={showUnlockPw ? "text" : "password"}
                      value={unlockMasterPw}
                      onChange={(e) => setUnlockMasterPw(e.target.value)}
                      placeholder="Enter master password..."
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-black/60 border border-cyan-500/30 text-white placeholder-text-muted/50 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowUnlockPw(!showUnlockPw)}
                      className="absolute right-3 top-3 text-text-muted hover:text-white"
                    >
                      {showUnlockPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !unlockMasterPw}
                  className="w-full py-2.5 rounded-lg bg-cyan-500/25 border border-cyan-400 text-cyan-200 hover:bg-cyan-500/35 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                  <span>Unlock Vault</span>
                </button>
              </form>
            </div>
          )}

          {/* CASE 3: Vault Unlocked — Full Credential Management */}
          {isSetup && isUnlocked && (
            <div className="space-y-4">
              {/* Controls Bar: Search & Add Credential Toggle */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search credentials, passwords, services..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/50 border border-cyan-500/30 text-white placeholder-text-muted/50 text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2 text-text-muted hover:text-white text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsAdding(!isAdding)}
                  className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                    isAdding
                      ? "bg-cyan-950/60 border-cyan-400 text-cyan-300"
                      : "bg-cyan-500/20 border-cyan-400 text-cyan-200 hover:bg-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAdding ? "Cancel" : "Add Credential"}</span>
                </button>
              </div>

              {/* Add Credential Sub-Form */}
              {isAdding && (
                <form
                  onSubmit={handleAddCredential}
                  className="p-4 rounded-xl bg-black/60 border border-cyan-500/40 space-y-3 animate-in fade-in duration-150"
                >
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    Store New Secure Credential
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-text-muted mb-1">
                        Service Name / Account Identifier:
                      </label>
                      <input
                        type="text"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        placeholder="e.g. SG CUBE TEST, Gmail, Wi-Fi..."
                        className="w-full px-3 py-1.5 rounded bg-black/60 border border-cyan-500/30 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-text-muted mb-1">Category:</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-black/60 border border-cyan-500/30 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                      >
                        <option value="credentials">Credentials / Passwords</option>
                        <option value="financial">Financial / Banking / PIN</option>
                        <option value="identity">Identity / Passport / ID</option>
                        <option value="security">API Keys / Tokens</option>
                        <option value="personal">Confidential Notes</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-muted mb-1">
                      Secret Password / Key Value:
                    </label>
                    <div className="relative">
                      <input
                        type={showNewValue ? "text" : "password"}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="Enter password or secret..."
                        className="w-full pl-3 pr-9 py-1.5 rounded bg-black/60 border border-cyan-500/30 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewValue(!showNewValue)}
                        className="absolute right-2.5 top-2 text-text-muted hover:text-white"
                      >
                        {showNewValue ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1 rounded bg-black/40 border border-white/10 text-text-muted text-xs font-mono hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !newKey.trim() || !newValue}
                      className="px-4 py-1 rounded bg-cyan-500/25 border border-cyan-400 text-cyan-200 hover:bg-cyan-500/35 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)] disabled:opacity-40"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Save Encrypted Record</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Credentials List */}
              <div className="space-y-2.5 max-h-[48vh] overflow-y-auto pr-1">
                {filteredRecords.length === 0 ? (
                  <div className="py-10 text-center text-text-muted font-mono text-xs space-y-1">
                    <Key className="w-8 h-8 mx-auto text-cyan-500/40 mb-2" />
                    <p>{searchQuery ? "No matching credentials found." : "No credentials stored in vault yet."}</p>
                    <p className="text-[11px] text-text-secondary">
                      Click "+ Add Credential" or speak "SG CUBE, remember as protected: my password is..." to store one.
                    </p>
                  </div>
                ) : (
                  filteredRecords.map((r) => {
                    const isVisible = visibleState[r.key];
                    const decryptedVal = revealedPasswords[r.key];
                    const isCopied = copiedKey === r.key;

                    return (
                      <div
                        key={r.key}
                        className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors flex items-center justify-between gap-3 text-xs font-mono"
                      >
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white truncate text-sm">{r.key}</span>
                            <span className="px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px]">
                              {r.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-text-muted">
                            <span className="text-[11px] text-text-secondary">Password:</span>
                            <span className="font-mono text-cyan-300 font-medium">
                              {isVisible && decryptedVal ? decryptedVal : "••••••••••••••••"}
                            </span>
                          </div>
                        </div>

                        {/* Row Action Buttons: Show/Hide, Copy, Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Show / Hide Button */}
                          <button
                            onClick={() => handleToggleReveal(r.key)}
                            className="p-1.5 rounded bg-black/40 border border-cyan-500/20 text-cyan-300 hover:text-white hover:border-cyan-400 transition-colors"
                            title={isVisible ? "Hide password" : "Show password"}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopyPassword(r.key)}
                            className={`px-2 py-1.5 rounded border text-[11px] flex items-center gap-1 transition-all ${
                              isCopied
                                ? "bg-emerald-950/60 border-emerald-400 text-emerald-300"
                                : "bg-black/40 border-cyan-500/20 text-text-muted hover:text-cyan-200 hover:border-cyan-400"
                            }`}
                            title="Copy password to clipboard"
                          >
                            {isCopied ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteRecord(r.key)}
                            className="p-1.5 rounded bg-red-950/30 border border-red-500/20 text-red-400 hover:bg-red-900/40 hover:border-red-500/50 transition-colors"
                            title="Delete credential permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-2.5 border-t border-cyan-500/20 bg-[#0A1226]/80 flex items-center justify-between text-[11px] font-mono text-text-muted">
          <span>AES-256-GCM • DPAPI • PBKDF2 / Argon2id</span>
          <span>Zero Plaintext Persistence</span>
        </div>
      </div>
    </div>
  );
};
