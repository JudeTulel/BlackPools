"use client";

/**
 * PositionCard Component
 * Displays encrypted position with masked values and Reveal button.
 * Clicking Reveal triggers local decryption via cofhejs.unseal().
 *
 * TODO: Implement with real FHE decryption.
 */

import { useEffect, useState } from "react";
import { usePosition } from "@/hooks/usePosition";
import { formatTokenAmount } from "@/lib/markets";

interface PositionCardProps {
  marketId: string;
  userAddress: string;
}

export function PositionCard({ marketId, userAddress }: PositionCardProps) {
  const { position, decryption, loading, fetchPosition, decrypt } = usePosition(marketId, userAddress);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition, marketId, userAddress]);

  const handleReveal = async () => {
    await decrypt();
    setRevealed(true);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center gap-2">
          <span className="spinner"></span>
          <span className="text-slate-300">Loading position...</span>
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="card">
        <p className="text-slate-400">No position found</p>
      </div>
    );
  }

  const maskValue = "••••••";

  return (
    <div className="card space-y-4">
      <h3 className="text-xl font-bold text-white">Your Position</h3>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Supply Shares */}
        <div className="bg-slate-800 rounded p-4">
          <p className="text-sm text-slate-400 mb-2">Supply Shares</p>
          <p className="text-2xl font-bold text-white">
            {revealed && decryption.decrypted ? decryption.decrypted.supplyShares : maskValue}
          </p>
        </div>

        {/* Borrow Shares */}
        <div className="bg-slate-800 rounded p-4">
          <p className="text-sm text-slate-400 mb-2">Borrow Shares</p>
          <p className="text-2xl font-bold text-white">
            {revealed && decryption.decrypted ? decryption.decrypted.borrowShares : maskValue}
          </p>
        </div>

        {/* Collateral */}
        <div className="bg-slate-800 rounded p-4">
          <p className="text-sm text-slate-400 mb-2">Collateral</p>
          <p className="text-2xl font-bold text-white">
            {revealed && decryption.decrypted ? decryption.decrypted.collateral : maskValue}
          </p>
        </div>
      </div>

      {/* Reveal Button */}
      <button
        onClick={handleReveal}
        disabled={revealed || decryption.status === "decrypting"}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
      >
        {decryption.status === "decrypting" ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner"></span>
            Decrypting...
          </span>
        ) : revealed ? (
          "Revealed"
        ) : (
          "Reveal Balance"
        )}
      </button>

      {decryption.error && (
        <div className="bg-red-900/20 border border-red-700 rounded p-3 text-red-300 text-sm">
          ✗ Decryption failed: {decryption.error}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center border-t border-slate-700 pt-4">
        🔐 Decryption happens locally — your private key never leaves this browser.
      </p>
    </div>
  );
}
