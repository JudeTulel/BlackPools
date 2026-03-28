/**
 * TypeScript Type Definitions
 */

export interface MarketParams {
  loanToken: string;
  collateralToken: string;
  oracle: string;
  lltv: bigint;
}

export interface Market {
  totalSupplyAssets: bigint;
  totalBorrowAssets: bigint;
  totalSupplyShares: bigint;
  totalBorrowShares: bigint;
  lastUpdate: bigint;
  fee: bigint;
}

export interface Position {
  supplyShares: bigint;
  borrowShares: bigint;
  collateral: bigint;
}

export interface WalletState {
  status: "disconnected" | "connected";
  address?: string;
  fheReady?: boolean;
}

export interface TransactionState {
  status: "idle" | "pending" | "success" | "error";
  hash?: string;
  error?: string;
}

export interface EncryptionState {
  status: "idle" | "encrypting" | "encrypted" | "error";
  error?: string;
}

export interface DecryptionState {
  status: "idle" | "decrypting" | "decrypted" | "error";
  decrypted?: {
    supplyShares: string;
    borrowShares: string;
    collateral: string;
  };
  error?: string;
}
