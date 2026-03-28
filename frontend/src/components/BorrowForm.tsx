"use client";

/**
 * BorrowForm Component
 * Form for supplying collateral and borrowing loan tokens.
 *
 * TODO: Implement with FHE collateral check.
 */

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useBorrow } from "@/hooks/useBorrow";
import { MarketParams } from "@/types";
import { parseTokenAmount } from "@/lib/markets";

interface BorrowFormProps {
  params: MarketParams;
  onSuccess?: () => void;
}

export function BorrowForm({ params, onSuccess }: BorrowFormProps) {
  const wallet = useWallet();
  const { collateralApproval, collateralSupply, borrow, supplyCollateralAndBorrow } = useBorrow();
  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.address || !wallet.fheReady || !collateralAmount || !borrowAmount) return;

    const collateral = parseTokenAmount(collateralAmount, 18); // Assuming 18 decimals for WETH
    const borrow_ = parseTokenAmount(borrowAmount, 6); // Assuming 6 decimals for USDC

    await supplyCollateralAndBorrow(params, collateral, borrow_, wallet.address, wallet.address);

    if (borrow.status === "success") {
      setCollateralAmount("");
      setBorrowAmount("");
      onSuccess?.();
    }
  };

  const isLoading =
    collateralApproval.status === "pending" ||
    collateralSupply.status === "pending" ||
    borrow.status === "pending";
  const isDisabled = !wallet.fheReady || isLoading;

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="text-xl font-bold text-white">Borrow Against Collateral</h3>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Collateral Amount (WETH)
        </label>
        <input
          type="number"
          value={collateralAmount}
          onChange={(e) => setCollateralAmount(e.target.value)}
          placeholder="0.00"
          disabled={isDisabled}
          step="0.01"
          min="0"
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Borrow Amount (USDC)
        </label>
        <input
          type="number"
          value={borrowAmount}
          onChange={(e) => setBorrowAmount(e.target.value)}
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
          {collateralApproval.status === "success" ? (
            <span className="text-green-400">✓</span>
          ) : collateralApproval.status === "pending" ? (
            <span className="spinner"></span>
          ) : (
            <span className="text-slate-500">○</span>
          )}
          <span className={collateralApproval.status === "success" ? "text-green-400" : "text-slate-300"}>
            Collateral Approval
          </span>
        </div>

        <div className="flex items-center gap-2">
          {collateralSupply.status === "success" ? (
            <span className="text-green-400">✓</span>
          ) : collateralSupply.status === "pending" ? (
            <span className="spinner"></span>
          ) : (
            <span className="text-slate-500">○</span>
          )}
          <span className={collateralSupply.status === "success" ? "text-green-400" : "text-slate-300"}>
            Supply Collateral
          </span>
        </div>

        <div className="flex items-center gap-2">
          {borrow.status === "success" ? (
            <span className="text-green-400">✓</span>
          ) : borrow.status === "pending" ? (
            <span className="spinner"></span>
          ) : (
            <span className="text-slate-500">○</span>
          )}
          <span className={borrow.status === "success" ? "text-green-400" : "text-slate-300"}>
            Borrow Tokens
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
      >
        {isLoading ? "Processing..." : "Borrow"}
      </button>

      {borrow.status === "success" && (
        <div className="bg-green-900/20 border border-green-700 rounded p-3 text-green-300 text-sm">
          ✓ Borrow successful! Tx: {borrow.hash?.slice(0, 10)}...
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        🔐 Collateral check happens entirely in FHE. Your position remains private.
      </p>
    </form>
  );
}
