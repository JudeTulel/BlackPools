"use client";

/**
 * useBorrow Hook
 * Orchestrates borrow flow: collateral supply → encryption → borrow call.
 *
 * TODO: Implement with FHE collateral check (FHE.gte + FHE.select).
 */

import { useState, useCallback } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { CONTRACT_ADDRESSES, BLACK_POOLS_ABI, ERC20_ABI } from "@/lib/contracts";
import { MarketParams, TransactionState } from "@/types";

export function useBorrow() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [collateralApproval, setCollateralApproval] = useState<TransactionState>({ status: "idle" });
  const [collateralSupply, setCollateralSupply] = useState<TransactionState>({ status: "idle" });
  const [borrow, setBorrow] = useState<TransactionState>({ status: "idle" });

  const supplyCollateralAndBorrow = useCallback(
    async (
      params: MarketParams,
      collateralAmount: bigint,
      borrowAmount: bigint,
      userAddress: string,
      receiver: string
    ) => {
      if (!publicClient || !walletClient) return;

      try {
        // Step 1: Approve collateral
        setCollateralApproval({ status: "pending" });

        const allowance = (await publicClient.readContract({
          address: params.collateralToken as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [userAddress as `0x${string}`, CONTRACT_ADDRESSES.blackPools as `0x${string}`],
        })) as bigint;

        if (allowance < collateralAmount) {
          const approveTx = await walletClient.writeContract({
            address: params.collateralToken as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACT_ADDRESSES.blackPools as `0x${string}`, collateralAmount],
            account: userAddress as `0x${string}`,
          });

          await publicClient.waitForTransactionReceipt({ hash: approveTx });
        }

        setCollateralApproval({ status: "success" });

        // Step 2: Supply collateral
        setCollateralSupply({ status: "pending" });

        // TODO: Implement with cofhejs.encrypt()
        const encryptedCollateral = "0x"; // Placeholder

        const collateralTx = await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.blackPools as `0x${string}`,
          abi: BLACK_POOLS_ABI,
          functionName: "supplyCollateral",
          args: [
            params,
            encryptedCollateral as `0x${string}`,
            collateralAmount,
            userAddress as `0x${string}`,
          ],
          account: userAddress as `0x${string}`,
        });

        await publicClient.waitForTransactionReceipt({ hash: collateralTx });

        setCollateralSupply({ status: "success" });

        // Step 3: Borrow
        setBorrow({ status: "pending" });

        // TODO: Implement with cofhejs.encrypt()
        const encryptedBorrowAmount = "0x"; // Placeholder

        const borrowTx = await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.blackPools as `0x${string}`,
          abi: BLACK_POOLS_ABI,
          functionName: "borrow",
          args: [
            params,
            encryptedBorrowAmount as `0x${string}`,
            borrowAmount,
            userAddress as `0x${string}`,
            receiver as `0x${string}`,
          ],
          account: userAddress as `0x${string}`,
        });

        await publicClient.waitForTransactionReceipt({ hash: borrowTx });

        setBorrow({ status: "success", hash: borrowTx });
      } catch (error) {
        const errorMsg = String(error);
        if (collateralApproval.status === "pending") {
          setCollateralApproval({ status: "error", error: errorMsg });
        } else if (collateralSupply.status === "pending") {
          setCollateralSupply({ status: "error", error: errorMsg });
        } else {
          setBorrow({ status: "error", error: errorMsg });
        }
      }
    },
    [publicClient, walletClient]
  );

  return {
    collateralApproval,
    collateralSupply,
    borrow,
    supplyCollateralAndBorrow,
  };
}
