"use client";

/**
 * Vaults Dashboard Page
 * Authenticated dashboard showing markets and position management.
 * Users can supply, borrow, and repay through this interface.
 *
 * TODO: Implement market discovery and filtering.
 */

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@/components/ConnectButton";
import { SupplyForm } from "@/components/SupplyForm";
import { BorrowForm } from "@/components/BorrowForm";
import { RepayForm } from "@/components/RepayForm";
import { PositionCard } from "@/components/PositionCard";
import { DEMO_MARKET, marketId } from "@/lib/markets";

export default function VaultsPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"supply" | "borrow" | "repay" | "position">("position");

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  // Return loading state while redirect is in progress
  if (!isConnected || !address) {
    return null;
  }

  const marketIdHash = marketId(DEMO_MARKET);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">BP</span>
              </div>
              <h1 className="text-xl font-bold text-white">Black Pools Dashboard</h1>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to Black Pools</h2>
          <p className="text-slate-300">
            Connected wallet: <span className="font-mono text-blue-400">{address.slice(0, 6)}...{address.slice(-4)}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-slate-700">
          {["position", "supply", "borrow", "repay"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-semibold transition border-b-2 ${
                activeTab === tab
                  ? "text-blue-400 border-blue-400"
                  : "text-slate-400 border-transparent hover:text-slate-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === "position" && (
              <PositionCard marketId={marketIdHash} userAddress={address} />
            )}

            {activeTab === "supply" && (
              <SupplyForm
                params={DEMO_MARKET}
                onSuccess={() => {
                  // Refresh position
                  setActiveTab("position");
                }}
              />
            )}

            {activeTab === "borrow" && (
              <BorrowForm
                params={DEMO_MARKET}
                onSuccess={() => {
                  setActiveTab("position");
                }}
              />
            )}

            {activeTab === "repay" && (
              <RepayForm
                params={DEMO_MARKET}
                onSuccess={() => {
                  setActiveTab("position");
                }}
              />
            )}
          </div>

          {/* Right Column: Info */}
          <div className="space-y-6">
            <div className="card">
              <h4 className="text-lg font-bold text-white mb-4">Market Info</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-400">Loan Token</p>
                  <p className="text-white font-mono text-xs">{DEMO_MARKET.loanToken.slice(0, 10)}...</p>
                </div>
                <div>
                  <p className="text-slate-400">Collateral Token</p>
                  <p className="text-white font-mono text-xs">{DEMO_MARKET.collateralToken.slice(0, 10)}...</p>
                </div>
                <div>
                  <p className="text-slate-400">LLTV</p>
                  <p className="text-white">80%</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 className="text-lg font-bold text-white mb-4">How It Works</h4>
              <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
                <li>Supply loan tokens to earn interest</li>
                <li>Post collateral to enable borrowing</li>
                <li>Borrow against your collateral</li>
                <li>Repay to reduce your debt</li>
              </ol>
            </div>

            <div className="card bg-blue-900/20 border-blue-700">
              <h4 className="text-lg font-bold text-blue-300 mb-2">🔐 Privacy First</h4>
              <p className="text-sm text-blue-200">
                All your positions are encrypted on-chain. Only you can decrypt your balances.
              </p>
            </div>

            <div className="card">
              <h4 className="text-lg font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://github.com/fhenixprotocol" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    GitHub →
                  </a>
                </li>
                <li>
                  <a href="https://cofhe-docs.fhenix.zone" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    Fhenix Docs →
                  </a>
                </li>
                <li>
                  <a href="https://whitepaper.morpho.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    Morpho Whitepaper →
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>Black Pools v1.2.0 — Confidential DeFi Lending on Fhenix CoFHE</p>
          <p className="mt-2 text-sm">
            ⚠️ This is a testnet demo. Do not use with real funds.
          </p>
        </div>
      </footer>
    </div>
  );
}
