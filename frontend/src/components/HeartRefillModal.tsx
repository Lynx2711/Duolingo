// src/components/HeartRefillModal.tsx — Refill Hearts Modal Component
//
// Allows users to spend 350 gems to instantly refill their hearts back to max (5).
// Handles API call to POST /api/users/{user_id}/refill-hearts and displays error if insufficient gems.

"use client";

import React, { useState } from "react";
import { userApi } from "@/lib/api";

interface HeartRefillModalProps {
  user?: {
    id: number;
    hearts: number;
    max_hearts: number;
    gems: number;
  } | null;
  onClose: () => void;
  onRefillSuccess: () => void;
}

export const HeartRefillModal: React.FC<HeartRefillModalProps> = ({
  user,
  onClose,
  onRefillSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentHearts = user?.hearts ?? 4;
  const maxHearts = user?.max_hearts ?? 5;
  const gems = user?.gems ?? 500;
  const REFILL_COST = 350;

  const handleRefill = async () => {
    if (!user) return;
    if (gems < REFILL_COST) {
      setError("Not enough gems! Complete lessons or quests to earn more.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await userApi.refillHearts(user.id);
      onRefillSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to refill hearts";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="card-duo bg-[var(--background-secondary)] max-w-sm w-full p-6 rounded-duo-xl border-2 border-[var(--border)] shadow-duo-modal text-center relative animate-bounce-in">
        {/* Close Button X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] font-black text-xl"
        >
          ✕
        </button>

        {/* Heart Icon Illustration */}
        <div className="text-6xl mb-3 animate-pulse">❤️</div>

        {/* Modal Title */}
        <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">
          Need More Hearts?
        </h3>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Refill your hearts to full so you can keep learning without interruptions!
        </p>

        {/* Current Status Box */}
        <div className="flex items-center justify-around bg-[var(--background-hover)] p-3 rounded-duo-md mb-6">
          <div>
            <span className="text-xs text-[var(--text-tertiary)] uppercase font-bold block">
              Current Hearts
            </span>
            <span className="font-black text-lg text-cardinal">
              {currentHearts} / {maxHearts}
            </span>
          </div>
          <div className="h-8 w-px bg-[var(--border)]" />
          <div>
            <span className="text-xs text-[var(--text-tertiary)] uppercase font-bold block">
              Your Gems
            </span>
            <span className="font-black text-lg text-macaw">💎 {gems}</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-cardinal/10 border border-cardinal/30 text-cardinal text-xs font-bold p-2.5 rounded-duo-md mb-4">
            {error}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleRefill}
          disabled={loading || currentHearts >= maxHearts || gems < REFILL_COST}
          className="btn-duo-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
        >
          {loading ? (
            "REFILLING..."
          ) : currentHearts >= maxHearts ? (
            "HEARTS ALREADY FULL"
          ) : (
            <>
              <span>REFILL HEARTS</span>
              <span className="bg-black/20 px-2 py-0.5 rounded-duo-pill text-xs font-black">
                💎 {REFILL_COST}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
