"use client";

import { motion } from "framer-motion";

export function MetroStatusCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-panel p-4 rounded-xl border border-outline-variant/20 flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-full bg-[#9333ea]/10 flex items-center justify-center">
        <span
          className="material-symbols-outlined text-[#9333ea]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          subway
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-data-label uppercase tracking-wider text-on-surface-variant">
            Purple Line Status
          </span>
          <span className="flex h-2 w-2 rounded-full bg-secondary" />
        </div>
        <p className="text-body-md font-semibold text-on-surface">Running Smoothly</p>
      </div>
    </motion.div>
  );
}
