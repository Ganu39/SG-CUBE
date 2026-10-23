import React from "react";
import type { NavTab } from "@/types";

interface AppBackgroundProps {
  activeTab: NavTab;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ activeTab }) => {
  const isImageActive = activeTab !== "home";

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#000000]">
      {/* Contextual image layer with smooth opacity transition */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
          isImageActive ? "opacity-20" : "opacity-0"
        }`}
        style={{
          backgroundImage: "url('/assets/bg_abstract_dark.jpg')",
          filter: "contrast(1.2) brightness(0.7)",
        }}
      />

      {/* Dark overlay to guarantee text contrast */}
      <div className="absolute inset-0 bg-[#000000]/80" />

      {/* Subtle radial cyan atmospheric glow */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.04) 0%, rgba(6, 11, 26, 0.5) 55%, rgba(0, 0, 0, 0.95) 100%)",
        }}
      />

      {/* Subtle scanline / cyber texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34, 211, 238, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
};
