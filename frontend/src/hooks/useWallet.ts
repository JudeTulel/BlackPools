"use client";

/**
 * useWallet Hook
 * Manages wallet connection state and FHE SDK initialization.
 * Automatically initializes cofhejs on wallet connection.
 */

import { useEffect, useRef, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { initFhe } from "@/lib/fhe";
import { WalletState } from "@/types";

export function useWallet(): WalletState {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [fheReady, setFheReady] = useState(false);
  const initializingRef = useRef(false);

  useEffect(() => {
    if (!isConnected || !walletClient) {
      setFheReady(false);
      initializingRef.current = false;
      return;
    }

    // Prevent double-initialization if walletClient reference changes
    if (initializingRef.current) {
      return;
    }

    initializingRef.current = true;
    (async () => {
      try {
        await initFhe(walletClient);
        setFheReady(true);
      } catch (error) {
        console.error("Failed to initialize FHE:", error);
        setFheReady(false);
      } finally {
        initializingRef.current = false;
      }
    })();
  }, [isConnected, address]);

  if (!isConnected || !address) {
    return { status: "disconnected" };
  }

  return {
    status: "connected",
    address,
    fheReady,
  };
}
