"use client";

/**
 * usePosition Hook
 * Fetches encrypted position from chain and provides local decryption.
 * Decryption is user-triggered via Reveal button.
 *
 * TODO: Implement with cofhejs.unseal() for local decryption.
 */

import { useState, useCallback, useEffect } from "react";
import { usePublicClient } from "wagmi";
import { CONTRACT_ADDRESSES, BLACK_POOLS_ABI } from "@/lib/contracts";
import { Position, DecryptionState } from "@/types";
import { decryptUint128 } from "@/lib/fhe";

export function usePosition(marketId: string, userAddress: string) {
  const publicClient = usePublicClient();
  const [position, setPosition] = useState<Position | null>(null);
  const [decryption, setDecryption] = useState<DecryptionState>({ status: "idle" });
  const [loading, setLoading] = useState(false);

  // Fetch encrypted position from chain
  const fetchPosition = useCallback(async () => {
    if (!publicClient || !marketId || !userAddress) return;

    setLoading(true);
    try {
      const data = (await publicClient.readContract({
        address: CONTRACT_ADDRESSES.blackPools as `0x${string}`,
        abi: BLACK_POOLS_ABI,
        functionName: "position",
        args: [marketId as `0x${string}`, userAddress as `0x${string}`],
      })) as any;

      setPosition({
        supplyShares: BigInt(data[0] || 0),
        borrowShares: BigInt(data[1] || 0),
        collateral: BigInt(data[2] || 0),
      });
    } catch (error) {
      console.error("Failed to fetch position:", error);
    } finally {
      setLoading(false);
    }
  }, [publicClient, marketId, userAddress]);

  // Decrypt position locally
  const decrypt = useCallback(async () => {
    if (!position) return;

    setDecryption({ status: "decrypting" });
    try {
      // TODO: Implement with cofhejs.unseal()
      // const supplyShares = await decryptUint128(position.supplyShares);
      // const borrowShares = await decryptUint128(position.borrowShares);
      // const collateral = await decryptUint128(position.collateral);

      setDecryption({
        status: "decrypted",
        decrypted: {
          supplyShares: "0", // TODO: Format decrypted value
          borrowShares: "0",
          collateral: "0",
        },
      });
    } catch (error) {
      console.error("Failed to decrypt position:", error);
      setDecryption({
        status: "error",
        error: String(error),
      });
    }
  }, [position]);

  // Fetch position on mount or when dependencies change
  useEffect(() => {
    fetchPosition();
  }, [publicClient, marketId, userAddress]);

  return {
    position,
    decryption,
    loading,
    fetchPosition,
    decrypt,
  };
}
