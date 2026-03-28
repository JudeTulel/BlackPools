"use client";

/**
 * SupplyForm Component
 * Controlled form for supplying loan tokens.
 * Displays step-by-step progress: approval → encryption → supply.
 *
 * TODO: Implement with real FHE encryption.
 */

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useSupply } from "@/hooks/useSupply";
import { MarketParams } from "@/types";
import { parseTokenAmount } from "@/lib/markets";

interface SupplyFormProps {
  params: MarketParams;
  onSuccess?: () => void;
}

export function SupplyForm({ params, onSuccess }: SupplyFormProps) {
  const wallet = useWallet();
  const { approval, encryption, transaction, supply } = useSupply();
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.address || !wallet.fheReady || !amount) return;

    const plainAmount = parseTokenAmount(amount, 6); // Assuming 6 decimals for USDC
    await supply(params, plainAmount, wallet.address);

    if (transaction.status === "success") {
      setAmount("");
      onSuccess?.();
    }
  };

  const isLoading = approval.status === "pending" || encryption.status === "encrypting" || transaction.status === "pending";
  const isDisabled = !wallet.fheReady || isLoading;

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="text-xl font-bold text-white">Supply Loan Tokens</h3>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Amount (USDC)
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
          {approval.error && <span className="text-red-400 text-xs">{approval.error}</span>}
        </div>

        <div className="flex items-center gap-2">
          {encryption.status === "encrypted" ? (
            <span className="text-green-400">✓</span>
          ) : encryption.status === "encrypting" ? (
            <span className="spinner"></span>
          ) : (
            <span className="text-slate-500">○</span>
          )}
          <span className={encryption.status === "encrypted" ? "text-green-400" : "text-slate-300"}>
            Encrypt Amount
          </span>
          {encryption.error && <span className="text-red-400 text-xs">{encryption.error}</span>}
        </div>

        <div className="flex items-center gap-2">
          {transaction.status === "success" ? (
            <span className="text-green-400">✓</span>
          ) : transaction.status === "pending" ? (
            <span className="spinner"></span>
          ) : (
            <span className="text-slate-500">○</span>
          )}
          <span className={transaction.status === "success" ? "text-green-400" : "text-slate-300"}>
            Submit Transaction
          </span>
          {transaction.error && <span className="text-red-400 text-xs">{transaction.error}</span>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
      >
        {isLoading ? "Processing..." : "Supply"}
      </button>

      {transaction.status === "success" && (
        <div className="bg-green-900/20 border border-green-700 rounded p-3 text-green-300 text-sm">
          ✓ Supply successful! Tx: {transaction.hash?.slice(0, 10)}...
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        💡 Amounts are encrypted before submission. Your balance remains private.
      </p>
    </form>
  );
}
