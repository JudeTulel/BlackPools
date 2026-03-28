"use client";

/**
 * ConnectButton Component
 * Wraps ConnectKit's button and adds FHE readiness badge.
 */

import { ConnectKitButton } from "connectkit";
import { useWallet } from "@/hooks/useWallet";

export function ConnectButton() {
  const wallet = useWallet();

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {wallet.status === "connected" && (
        <span className={wallet.fheReady ? "badge-green" : "badge-yellow"}>
          {wallet.fheReady ? "FHE ready" : "Initialising FHE…"}
        </span>
      )}
      <ConnectKitButton />
    </div>
  );
}
