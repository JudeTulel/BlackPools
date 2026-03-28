"use client";

/**
 * RepayForm Component
 * Form for repaying borrowed loan tokens.
 *
 * TODO: Implement with real FHE encryption.
 */

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useRepay } from "@/hooks/useRepay";
import { MarketParams } from "@/types";
import { parseTokenAmount } from "@/lib/markets";

interface RepayFormProps {
  params: MarketParams;
  onSuccess?: () => void;
}

export function RepayForm({ params, onSuccess }: RepayFormProps) {
  const wallet = useWallet();
  const { approval, repay, repayDebt } = useRepay();
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.address || !wallet.fheReady || !amount) return;

    const plainAmount = parseTokenAmount(amount, 6); // Assuming 6 decimals for USDC
    await repayDebt(params, plainAmount, wallet.address);

    if (repay.status === "success") {
      setAmount("");
      onSuccess?.();
    }
  };

  const isLoading = approval.status === "pending" || repay.status === "pending";
  const isDisabled = !wallet.fheReady || isLoading;

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="text-xl font-bold text-white">Repay Debt</h3>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Repay Amount (USDC)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          disabled={isDisabled}
          step="0.01"
          min="0"
          className="w-full"
        />
      </div>

      {/* Progress Steps */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          {approval.status === "success" ? (
            <span className="text-green-400">✓</span>
          ) : approval.status === "pending" ? (
            <span className="spinner"></span>
          ) : (
            <span className="text-slate-500">○</span>
          )}
          <span className={approval.status === "success" ? "text-green-400" : "text-slate-300"}>
            Token Approval
          </span>
        </div>

        <div className="flex items-center gap-2">
          {repay.status === "success" ? (
            <span className="text-green-400">✓</span>
          ) : repay.status === "pending" ? (
            <span className="spinner"></span>
          ) : (
            <span className="text-slate-500">○</span>
          )}
          <span className={repay.status === "success" ? "text-green-400" : "text-slate-300"}>
            Submit Repayment
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
      >
        {isLoading ? "Processing..." : "Repay"}
      </button>

      {repay.status === "success" && (
        <div className="bg-green-900/20 border border-green-700 rounded p-3 text-green-300 text-sm">
          ✓ Repayment successful! Tx: {repay.hash?.slice(0, 10)}...
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        💡 Repayment amounts are encrypted. Your debt reduction remains private.
      </p>
    </form>
  );
}
