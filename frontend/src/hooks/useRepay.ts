"use client";

/**
 * useRepay Hook
 * Orchestrates repay flow: token approval → encryption → repay call.
 *
 * TODO: Implement with cofhejs.encrypt() for real FHE encryption.
 */

import { useState, useCallback } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { CONTRACT_ADDRESSES, BLACK_POOLS_ABI, ERC20_ABI } from "@/lib/contracts";
import { MarketParams, TransactionState } from "@/types";

export function useRepay() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [approval, setApproval] = useState<TransactionState>({ status: "idle" });
  const [repay, setRepay] = useState<TransactionState>({ status: "idle" });

  const repayDebt = useCallback(
    async (params: MarketParams, repayAmount: bigint, userAddress: string) => {
      if (!publicClient || !walletClient) return;

      try {
        // Step 1: Approve loan token
        setApproval({ status: "pending" });

        const allowance = (await publicClient.readContract({
          address: params.loanToken as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [userAddress as `0x${string}`, CONTRACT_ADDRESSES.blackPools as `0x${string}`],
        })) as bigint;

        if (allowance < repayAmount) {
          const approveTx = await walletClient.writeContract({
            address: params.loanToken as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACT_ADDRESSES.blackPools as `0x${string}`, repayAmount],
            account: userAddress as `0x${string}`,
          });

          await publicClient.waitForTransactionReceipt({ hash: approveTx });
        }

        setApproval({ status: "success" });

        // Step 2: Repay
        setRepay({ status: "pending" });

        // TODO: Implement with cofhejs.encrypt()
        const encryptedRepayAmount = "0x"; // Placeholder

        const repayTx = await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.blackPools as `0x${string}`,
          abi: BLACK_POOLS_ABI,
          functionName: "repay",
          args: [
            params,
            encryptedRepayAmount as `0x${string}`,
            repayAmount,
            userAddress as `0x${string}`,
          ],
          account: userAddress as `0x${string}`,
        });

        await publicClient.waitForTransactionReceipt({ hash: repayTx });

        setRepay({ status: "success", hash: repayTx });
      } catch (error) {
        const errorMsg = String(error);
        if (approval.status === "pending") {
          setApproval({ status: "error", error: errorMsg });
        } else {
          setRepay({ status: "error", error: errorMsg });
        }
      }
    },
    [publicClient, walletClient]
  );

  return {
    approval,
    repay,
    repayDebt,
  };
}
