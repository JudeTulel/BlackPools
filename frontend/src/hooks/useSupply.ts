"use client";

/**
 * useSupply Hook
 * Orchestrates supply flow: token approval → encryption → contract call.
 * Tracks each step separately for granular UI progress.
 *
 * TODO: Implement with cofhejs.encrypt() for real FHE encryption.
 */

import { useState, useCallback } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { CONTRACT_ADDRESSES, BLACK_POOLS_ABI, ERC20_ABI } from "@/lib/contracts";
import { MarketParams, EncryptionState, TransactionState } from "@/types";
import { encryptUint128 } from "@/lib/fhe";

export function useSupply() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [approval, setApproval] = useState<TransactionState>({ status: "idle" });
  const [encryption, setEncryption] = useState<EncryptionState>({ status: "idle" });
  const [transaction, setTransaction] = useState<TransactionState>({ status: "idle" });

    const supply = useCallback(
      async (params: MarketParams, plainAmount: bigint, userAddress: string) => {
        if (!publicClient || !walletClient) return;

        let currentStep: "approval" | "encryption" | "transaction" = "approval";
        try {
        // Step 1: Check and request approval
        currentStep = "approval";
        setApproval({ status: "pending" });

        const allowance = (await publicClient.readContract({
          address: params.loanToken as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [userAddress as `0x${string}`, CONTRACT_ADDRESSES.blackPools as `0x${string}`],
        })) as bigint;

        if (allowance < plainAmount) {
          const approveTx = await walletClient.writeContract({
            address: params.loanToken as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACT_ADDRESSES.blackPools as `0x${string}`, plainAmount],
            account: userAddress as `0x${string}`,
          });

          await publicClient.waitForTransactionReceipt({ hash: approveTx });
        }

        setApproval({ status: "success" });

        // Step 2: Encrypt amount
        currentStep = "encryption";
        setEncryption({ status: "encrypting" });

        // TODO: Implement with cofhejs.encrypt()
        // const result = await encryptUint128(String(plainAmount));
        const encryptedInput = "0x"; // Placeholder

        setEncryption({ status: "encrypted" });

        // Step 3: Call BlackPools.supply
        currentStep = "transaction";
        setTransaction({ status: "pending" });

        const supplyTx = await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.blackPools as `0x${string}`,
          abi: BLACK_POOLS_ABI,
          functionName: "supply",
          args: [params, encryptedInput as `0x${string}`, plainAmount, userAddress as `0x${string}`],
          account: userAddress as `0x${string}`,
        });

        await publicClient.waitForTransactionReceipt({ hash: supplyTx });

        setTransaction({ status: "success", hash: supplyTx });
      } catch (error) {
        const errorMsg = String(error);
        // Use currentStep to determine which state to update (synchronous, not React state)
        if (currentStep === "approval") {
          setApproval({ status: "error", error: errorMsg });
        } else if (currentStep === "encryption") {
          setEncryption({ status: "error", error: errorMsg });
        } else {
          setTransaction({ status: "error", error: errorMsg });
        }
      }
    },
    [publicClient, walletClient]
  );

  return {
    approval,
    encryption,
    transaction,
    supply,
  };
}
