/**
 * Markets Library
 * Utilities for market ID derivation, formatting, and demo market setup.
 */

import { keccak256, AbiCoder, parseUnits, formatUnits } from "viem";

export interface MarketParams {
  loanToken: string;
  collateralToken: string;
  oracle: string;
  lltv: bigint;
}

/**
 * Derive market ID from market parameters.
 * @param params Market parameters.
 * @return Market ID as bytes32.
 */
export function marketId(params: MarketParams): string {
  const encoded = AbiCoder.defaultAbiCoder().encode(
    ["address", "address", "address", "uint128"],
    [params.loanToken, params.collateralToken, params.oracle, params.lltv]
  );
  return keccak256(encoded);
}

/**
 * Demo market configuration (USDC/WETH with 80% LLTV).
 */
export const DEMO_MARKET: MarketParams = {
  loanToken: process.env.NEXT_PUBLIC_TEST_USDC_ADDRESS || "0x",
  collateralToken: process.env.NEXT_PUBLIC_TEST_WETH_ADDRESS || "0x",
  oracle: "0x0000000000000000000000000000000000000000", // Zero address for testnet
  lltv: 8000n, // 80% LLTV in basis points
};

/**
 * Format token amount with decimals.
 * @param amount Amount in wei/smallest unit.
 * @param decimals Token decimals.
 * @return Formatted amount as string.
 */
export function formatTokenAmount(amount: bigint | string, decimals: number = 18): string {
  const formatted = formatUnits(BigInt(amount), decimals);
  return parseFloat(formatted).toFixed(2);
}

/**
 * Parse token amount to wei/smallest unit.
 * @param amount Amount as string or number.
 * @param decimals Token decimals.
 * @return Amount in wei/smallest unit as bigint.
 */
export function parseTokenAmount(amount: string | number, decimals: number = 18): bigint {
  return parseUnits(String(amount), decimals);
}

/**
 * Format Ray (27 decimals) to percentage.
 * @param ray Ray value (27 decimals).
 * @return Percentage as string.
 *
 * TODO: Implement Ray formatting for interest rates.
 */
export function formatRay(ray: bigint): string {
  // 1 ray = 1e27
  // 1e27 = 100%
  const percentage = (Number(ray) / 1e27) * 100;
  return percentage.toFixed(2);
}

/**
 * Parse percentage to Ray.
 * @param percentage Percentage as number.
 * @return Ray value (27 decimals).
 *
 * TODO: Implement Ray parsing for interest rates.
 */
export function parseRay(percentage: number): bigint {
  return BigInt(Math.floor((percentage / 100) * 1e27));
}
