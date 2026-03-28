/**
 * Contract Addresses and ABIs
 * Loads contract addresses from environment variables.
 * Defines ABI const assertions for type safety.
 *
 * TODO: Generate ABIs from contract artifacts.
 */

export const CONTRACT_ADDRESSES = {
  blackPools: process.env.NEXT_PUBLIC_BLACKPOOLS_ADDRESS || "0x",
  mockPool: process.env.NEXT_PUBLIC_MOCKPOOL_ADDRESS || "0x",
  taskManager: process.env.NEXT_PUBLIC_TASKMANAGER_ADDRESS || "0x",
  testUsdc: process.env.NEXT_PUBLIC_TEST_USDC_ADDRESS || "0x",
};

// ERC20 ABI (minimal)
export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

// BlackPools ABI (minimal)
export const BLACK_POOLS_ABI = [
  {
    type: "function",
    name: "createMarket",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "loanToken", type: "address" },
          { name: "collateralToken", type: "address" },
          { name: "oracle", type: "address" },
          { name: "lltv", type: "uint128" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "supply",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "loanToken", type: "address" },
          { name: "collateralToken", type: "address" },
          { name: "oracle", type: "address" },
          { name: "lltv", type: "uint128" },
        ],
      },
      { name: "encryptedAssets", type: "bytes" },
      { name: "plainAssets", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "supplyCollateral",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "loanToken", type: "address" },
          { name: "collateralToken", type: "address" },
          { name: "oracle", type: "address" },
          { name: "lltv", type: "uint128" },
        ],
      },
      { name: "encryptedCollateral", type: "bytes" },
      { name: "plainCollateral", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "borrow",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "loanToken", type: "address" },
          { name: "collateralToken", type: "address" },
          { name: "oracle", type: "address" },
          { name: "lltv", type: "uint128" },
        ],
      },
      { name: "encryptedBorrowAmount", type: "bytes" },
      { name: "plainAmount", type: "uint256" },
      { name: "user", type: "address" },
      { name: "receiver", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "repay",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "loanToken", type: "address" },
          { name: "collateralToken", type: "address" },
          { name: "oracle", type: "address" },
          { name: "lltv", type: "uint128" },
        ],
      },
      { name: "encryptedRepayAmount", type: "bytes" },
      { name: "plainAmount", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "position",
    inputs: [
      { name: "marketId", type: "bytes32" },
      { name: "user", type: "address" },
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "supplyShares", type: "uint256" },
          { name: "borrowShares", type: "uint256" },
          { name: "collateral", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "market",
    inputs: [{ name: "marketId", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "totalSupplyAssets", type: "uint256" },
          { name: "totalBorrowAssets", type: "uint256" },
          { name: "totalSupplyShares", type: "uint256" },
          { name: "totalBorrowShares", type: "uint256" },
          { name: "lastUpdate", type: "uint256" },
          { name: "fee", type: "uint128" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "idToMarketParams",
    inputs: [{ name: "marketId", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "loanToken", type: "address" },
          { name: "collateralToken", type: "address" },
          { name: "oracle", type: "address" },
          { name: "lltv", type: "uint128" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isMarketCreated",
    inputs: [{ name: "marketId", type: "bytes32" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "MarketCreated",
    inputs: [
      { name: "marketId", type: "bytes32", indexed: true },
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "loanToken", type: "address" },
          { name: "collateralToken", type: "address" },
          { name: "oracle", type: "address" },
          { name: "lltv", type: "uint128" },
        ],
      },
    ],
  },
  {
    type: "event",
    name: "Supplied",
    inputs: [
      { name: "marketId", type: "bytes32", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "onBehalfOf", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "Borrowed",
    inputs: [
      { name: "marketId", type: "bytes32", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "receiver", type: "address", indexed: true },
      { name: "amount", type: "uint256" },
    ],
  },
] as const;
