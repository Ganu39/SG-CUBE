import React, { useState, useEffect } from "react";
import { X, Users, RefreshCw, Trash2, UserCheck, Shield } from "lucide-react";
import type { PersonProfile } from "@/types";

interface PeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  getHttpBase: () => string;
}

export const PeopleModal: React.FC<PeopleModalProps> = ({ isOpen, onClose, getHttpBase }) => {
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("");

  const loadPeople = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getHttpBase()}/api/people`);
      if (res.ok) {
        const json = await res.json();
        setPeople(json.people || []);
      }
    } catch (e: any) {
      setStatusMsg(`Failed to load face profiles: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deletePerson = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want SG CUBE to forget "${name}"?`)) return;
    try {
      const res = await fetch(`${getHttpBase()}/api/people/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      if (res.ok) {
        loadPeople();
        setStatusMsg(`Removed profile for ${name}`);
        setTimeout(() => setStatusMsg(""), 3000);
      }
    } catch (e: any) {
      setStatusMsg(`Delete error: ${e.message}`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPeople();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="hud-panel w-full max-w-2xl bg-[#060B1A]/95 border border-cyan-400/50 p-6 rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.25)] flex flex-col gap-4 text-white animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold tracking-wider font-mono">
              KNOWN PEOPLE & BIOMETRIC FACE MEMORY
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadPeople}
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

        {statusMsg && (
          <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            {statusMsg}
          </div>
        )}

        {/* People List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {people.length > 0 ? (
            people.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-lg bg-black/40 border border-cyan-500/20 flex items-center justify-between font-mono text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{p.name}</h4>
                    <p className="text-[11px] text-text-muted">
                      128-D SFace Normalized Centroid • ID: {p.id.slice(0, 16)}...
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deletePerson(p.id, p.name)}
                  className="px-2.5 py-1 rounded bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/60 text-xs font-mono flex items-center gap-1 transition-colors"
                  title="Forget this person"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Forget</span>
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-text-muted font-mono text-xs space-y-2">
              <Users className="w-8 h-8 text-cyan-500/40 mx-auto" />
              <p>No face profiles enrolled yet.</p>
              <p className="text-[11px] text-text-secondary">
                To teach SG CUBE a new person, hold someone in front of the camera and say:
                <br />
                <span className="text-cyan-400 font-bold">"Remember this person as [Name]"</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20 text-xs font-mono text-text-muted">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-cyan-400" />
            Cosine distance matching threshold: 0.55
          </span>
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
