"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function SyncBanner() {
  const { isSyncing, syncLog, lastSyncedAt } = useAppStore();

  return (
    <>
      {/* Banner hiển thị khi đang đồng bộ */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full flex items-center gap-3 border whitespace-nowrap"
            style={{
              backgroundColor: "#FEFEFE",
              borderColor: "#E8E8E8",
              boxShadow: "6px 6px 12px #e0e0e0, -6px -6px 12px #ffffff",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
            >
              <RefreshCw size={16} style={{ color: "#7aad00" }} />
            </motion.div>
            <span className="text-sm font-bold text-gray-700">
              {syncLog || "Đang đồng bộ dữ liệu..."}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge nhỏ góc dưới: "Đồng bộ lần cuối X phút trước" */}
      <AnimatePresence>
        {!isSyncing && lastSyncedAt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.3 }}
            className="fixed bottom-28 lg:bottom-6 right-4 lg:right-6 z-40 flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold text-gray-500"
            style={{
              backgroundColor: "#FAFAFA",
              borderColor: "#E8E8E8",
              boxShadow: "3px 3px 8px #e0e0e0, -3px -3px 8px #ffffff",
            }}
          >
            <CheckCircle2 size={13} style={{ color: "#7aad00" }} />
            Đồng bộ{" "}
            {formatDistanceToNow(lastSyncedAt, { addSuffix: true, locale: vi })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
