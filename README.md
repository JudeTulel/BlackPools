# Black Pools — Confidential DeFi Lending Protocol

A confidential lending and borrowing protocol built on **Fhenix CoFHE** with **Morpho-aligned isolated markets**. All user supply shares, borrow shares, and collateral positions remain encrypted on-chain using Fully Homomorphic Encryption (FHE).

## Version

**v1.2.0** — DRAFT (March 2026)

## Key Features

- **Isolated Markets**: Permissionless market creation with independent liquidity pools
- **Share-Based Accounting**: O(1) interest accrual regardless of user count
- **Full Privacy**: All positions encrypted as `euint128` on-chain
- **Morpho Architecture**: Aligned with Morpho Blue design principles
- **EIP-712 Permits**: Third-party delegation for auditors and liquidators
- **Next.js Frontend**: Wallet connection, encrypted input, local decryption

## Architecture Overview

### Smart Contracts (Solidity)

| Contract | Purpose |
|----------|---------|
| `BlackPools.sol` | Main protocol: all markets, supply/borrow/repay/liquidate |
| `IBlackPools.sol` | Canonical interface: structs and function signatures |
| `MarketLib.sol` | Market ID derivation and validation helpers |
| `TaskManager.sol` | EIP-712 permit delegation for third-party access |
| `MockPool.sol` | Aave V3 IPool simulation for testnet |
| `TestERC20.sol` | Mintable test tokens (USDC/WETH stand-ins) |
| `Counter.sol` | FHE reference contract for onboarding |

### Frontend (Next.js)

- **Wallet Connection**: MetaMask, Coinbase Wallet, WalletConnect via ConnectKit
- **FHE Integration**: cofhejs SDK for encryption/decryption
- **Components**: SupplyForm, BorrowForm, RepayForm, PositionCard
- **Hooks**: useWallet, usePosition, useSupply, useBorrow, useRepay

## Project Structure

```
black-pools/
├── contracts/                    # Solidity smart contracts
│   ├── BlackPools.sol
│   ├── TaskManager.sol
│   ├── MockPool.sol
│   ├── TestERC20.sol
│   ├── Counter.sol
│   ├── interfaces/
│   │   └── IBlackPools.sol
│   ├── libraries/
│   │   └── MarketLib.sol
│   ├── test/
│   │   ├── Vault.test.ts
│   │   └── Counter.test.ts
│   ├── tasks/
│   │   ├── deploy-vault.ts
│   │   ├── demo-vault.ts
│   │   └── utils.ts
│   ├── hardhat.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                     # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── providers.tsx
│   │   │   ├── page.tsx
│   │   │   └── vaults/
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── ConnectButton.tsx
│   │   │   ├── SupplyForm.tsx
│   │   │   ├── BorrowForm.tsx
│   │   │   ├── RepayForm.tsx
│   │   │   └── PositionCard.tsx
│   │   ├── hooks/
│   │   │   ├── useWallet.ts
│   │   │   ├── usePosition.ts
│   │   │   ├── useSupply.ts
│   │   │   ├── useBorrow.ts
│   │   │   └── useRepay.ts
│   │   ├── lib/
│   │   │   ├── fhe.ts
│   │   │   ├── contracts.ts
│   │   │   └── markets.ts
│   │   └── types/
│   │       └── index.ts
│   └── package.json
│
├── package.json                  # Root workspace
├── .env.example
└── README.md
```

## Quick Start

### Prerequisites

- Node.js v20+
- pnpm (install globally: `npm install -g pnpm`)
- WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)
- Arbitrum Sepolia RPC URL (Alchemy, Infura, or public endpoint)

### Contract Workspace Setup

```bash
# Install dependencies
pnpm install

# Compile contracts
pnpm compile

# Run tests
pnpm test

# Deploy to Arbitrum Sepolia
pnpm arb-sepolia:deploy-vault

# Run E2E demo
pnpm arb-sepolia:demo-vault
```

### Frontend Workspace Setup

```bash
# Enter frontend directory
cd frontend

# Install dependencies
pnpm install

# Create .env.local with contract addresses from deploy step
# (See .env.example for required variables)

# Start dev server
pnpm dev

# Open http://localhost:3000
```

### Local Development (Mock Mode)

```bash
# Terminal 1: Start Hardhat local node
pnpm hardhat node

# Terminal 2: Deploy to local network
pnpm hardhat deploy-vault --network localhost

# Terminal 3: Start frontend dev server
cd frontend && pnpm dev
```

In mock mode, `cofhejs.encrypt()` and `cofhejs.unseal()` complete synchronously with no real FHE coprocessor.

## Core Concepts

### Isolated Markets

Each market is identified by a unique `marketId` derived as:

```solidity
marketId = keccak256(abi.encode(MarketParams))
```

Where `MarketParams` includes:
- `loanToken`: ERC-20 token borrowers receive
- `collateralToken`: ERC-20 token borrowers post
- `oracle`: Price feed address
- `lltv`: Liquidation LTV in basis points

### Share-Based Accounting

Positions are tracked as encrypted shares (`euint128`), not raw amounts. Interest accrues by updating `totalSupplyAssets` and `totalBorrowAssets` without changing per-user shares — each share becomes worth more over time.

### Privacy Model

All sensitive data is encrypted:
- `supplyShares`: User's share of the supply pool (euint128)
- `borrowShares`: User's share of the borrow pool (euint128)
- `collateral`: User's posted collateral (euint128)

Only the position owner can decrypt their own balance via `cofhejs.unseal()`. Third-party access requires an EIP-712 permit from TaskManager.

## Functional Requirements

| Requirement | Description |
|-------------|-------------|
| **FR-01** | Isolated Market Creation — permissionless, no governance approval |
| **FR-02** | Supply with Encrypted Shares — shares tracked as euint128 |
| **FR-03** | Collateral Supply and Encrypted Borrow — safety check in FHE |
| **FR-04** | Share-Based Interest Accrual — O(1) regardless of user count |
| **FR-05** | Liquidation — seize collateral and repay debt in FHE |
| **FR-06** | Own-Balance Decryption — local via cofhejs.unseal() |
| **FR-07** | Third-Party Permit Delegation — EIP-712 signed permits |
| **FR-08** | Permissionless Market Params Lookup — idToMarketParams() |
| **FR-09** | MockPool Aave Interface — Aave V3 IPool simulation |
| **FR-10** | Next.js Wallet Connection — MetaMask, Coinbase, WalletConnect |
| **FR-11** | Encrypted Input Submission — cofhejs.encrypt() before contract call |
| **FR-12** | Local Balance Decryption in Browser — React state only |

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **NFR-01** | Privacy Guarantee — no plaintext positions on-chain |
| **NFR-02** | FHE Access Control Correctness — _allow() on every euint128 write |
| **NFR-03** | O(1) Interest Accrual — no per-user iteration |
| **NFR-04** | Gas Budget — supply ≤900k gas, borrow ≤1.2M gas |
| **NFR-05** | Encryption Latency — cofhejs.encrypt() ≤600ms |

## Security Considerations

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| On-Chain Observer | All positions are euint128 encrypted |
| Missing _allow() Call | Audit coverage + test suite negative tests |
| Fake Market Creation | Isolated — cannot affect other markets |
| Reentrancy | ReentrancyGuard + CEI pattern |
| Permit Forgery | EIP-712 signature validation + nonce |
| Frontend Key Exfiltration | Decrypted values in React state only |
| MockPool on Mainnet | onlyTestnet modifier prevents deployment |
| Stale Oracle | 1-hour freshness threshold + pause |

### Known Limitations

- **FHE.div unavailable**: Share-to-asset redemption uses 1:1 ratio for testnet
- **Plaintext ERC-20 amounts**: plainAssets parameter exposes token amount
- **Off-chain liquidation health check**: Production requires on-chain ZK attestation
- **Keeper-supplied interest rate**: Production would fix rate as market parameter

## Development Workflow

### Compiling

```bash
pnpm compile
```

### Testing

```bash
pnpm test
```

### Deployment

```bash
# Compile first
pnpm compile

# Deploy to Arbitrum Sepolia
PRIVATE_KEY=your_key ARBITRUM_SEPOLIA_RPC_URL=your_rpc pnpm hardhat run tasks/deploy-vault.ts --network arbitrumSepolia

# Or use the predefined task
pnpm arb-sepolia:deploy-vault
```

### Frontend Development

```bash
cd frontend
pnpm dev
```

The frontend will:
1. Initialize wagmi with arbitrumSepolia and hardhat chains
2. Set up ConnectKit for wallet connection
3. Initialize cofhejs SDK on wallet connection
4. Display FHE readiness badge in header

## TODO / Unimplemented Features

See individual files for TODO comments marking unimplemented features:

- **Smart Contracts**:
  - [ ] FHE.div circuit for fixed-point division (currently 1:1 ratio)
  - [ ] Commit-reveal scheme for plainAssets parameter
  - [ ] On-chain ZK attestation for liquidation health
  - [ ] On-chain interest rate model contract
  - [ ] Stale oracle pause mechanism

- **Frontend**:
  - [ ] Market discovery and filtering UI
  - [ ] Advanced liquidation dashboard
  - [ ] Historical transaction log
  - [ ] Portfolio analytics and risk metrics
  - [ ] Multi-market position aggregation

## References

- [Morpho Blue Whitepaper](https://whitepaper.morpho.org)
- [Morpho Blue Source](https://github.com/morpho-org/morpho-blue)
- [Fhenix CoFHE Docs](https://cofhe-docs.fhenix.zone)
- [cofhe-hardhat-starter](https://github.com/fhenixprotocol/cofhe-hardhat-starter)
- [cofhejs SDK](https://github.com/FhenixProtocol/cofhejs)
- [wagmi v2 Docs](https://wagmi.sh)
- [ConnectKit Docs](https://docs.family.co/connectkit)
- [viem Docs](https://viem.sh)
- [EIP-712](https://eips.ethereum.org/EIPS/eip-712)

## License

Confidential — Internal Use Only

---

**Black Pools v1.2.0** — Built on Fhenix CoFHE with Morpho-aligned architecture.
