# Black Pools v1.2.0 — Implementation Notes

## Overview

This document outlines the implementation status of Black Pools v1.2.0 and identifies areas marked with TODO for future development.

## Project Status

**Version**: 1.2.0 (DRAFT)  
**Architecture**: Morpho-aligned isolated markets with FHE encryption  
**Network**: Arbitrum Sepolia (Fhenix CoFHE testnet)  
**Status**: Core structure implemented with TODOs for FHE integration

## Implemented Features

### Smart Contracts ✓

- **BlackPools.sol**: Main protocol contract with isolated market architecture
  - Market creation (permissionless)
  - Supply, borrow, repay, liquidate functions
  - Share-based accounting structure
  - FHE access control helpers (_allow function)

- **IBlackPools.sol**: Complete interface definition
  - MarketParams, Market, Position structs
  - All function signatures
  - Event definitions

- **MarketLib.sol**: Market utilities
  - Market ID derivation (keccak256 of encoded params)
  - Parameter validation
  - Market existence checks

- **TaskManager.sol**: EIP-712 permit delegation
  - Permit issuance structure
  - Revocation mechanism
  - Permit validation helpers

- **MockPool.sol**: Aave V3 IPool simulation
  - Supply, borrow, withdraw, repay functions
  - Testnet-only guard (onlyTestnet modifier)
  - Reserve and user account data tracking

- **TestERC20.sol**: Mintable test tokens
  - USDC and WETH stand-ins
  - Owner-controlled minting and burning

- **Counter.sol**: FHE reference contract
  - euint32 encrypted counter
  - Increment, decrement, reset operations
  - FHE access control pattern demonstration

### Frontend (Next.js) ✓

- **Providers Setup**: wagmi + ConnectKit + React Query configuration
- **Wallet Integration**: useWallet hook with FHE SDK initialization
- **Components**:
  - ConnectButton: Wallet connection + FHE readiness badge
  - SupplyForm: Approval → Encryption → Supply flow
  - BorrowForm: Collateral supply → Borrow flow
  - RepayForm: Approval → Repay flow
  - PositionCard: Encrypted position display with Reveal button

- **Hooks**:
  - useWallet: Wallet state + FHE initialization
  - usePosition: Fetch encrypted position + local decryption
  - useSupply: Supply flow orchestration
  - useBorrow: Borrow flow orchestration
  - useRepay: Repay flow orchestration

- **Pages**:
  - Landing page: Hero, features, tech stack
  - Vaults dashboard: Market info, position management, tab-based UI

- **Utilities**:
  - fhe.ts: FHE SDK wrapper (placeholder for cofhejs integration)
  - contracts.ts: Contract addresses and ABIs
  - markets.ts: Market ID derivation, formatting utilities

## TODO / Unimplemented Features

### Smart Contracts

#### BlackPools.sol
- [ ] **FHE.div circuit**: Currently using 1:1 ratio for testnet. Production requires fixed-point FHE division or lookup table approximation.
- [ ] **Collateral check implementation**: Need to implement FHE.gte + FHE.mul + FHE.select for collateral sufficiency check in borrow().
- [ ] **Interest calculation**: Implement proper interest = totalBorrowAssets * rate * elapsed formula.
- [ ] **Withdraw function**: Implement full withdraw logic with share-to-asset conversion.
- [ ] **Liquidation health check**: Implement on-chain ZK attestation or oracle-backed health proof (currently trusts off-chain verification).
- [ ] **Stale oracle pause**: Implement 1-hour freshness threshold and pause mechanism.
- [ ] **Commit-reveal scheme**: Replace plainAssets parameter with commit-reveal or ZK proof that plainAssets == decrypt(encryptedAssets).

#### MarketLib.sol
- [ ] **Oracle validation**: Enable oracle address validation in production (currently allows address(0) for testnet).

#### TaskManager.sol
- [ ] **EIP-712 signature validation**: Implement full ECDSA.recover() and signature verification.
- [ ] **Permit storage and enforcement**: Integrate permits with BlackPools for third-party access delegation.
- [ ] **Nonce management**: Implement proper nonce tracking for replay protection.

#### MockPool.sol
- [ ] **Collateral check**: Implement health factor calculation and collateral sufficiency validation.
- [ ] **Interest rate model**: Add interest accrual to reserve data.
- [ ] **Full Aave V3 compatibility**: Implement remaining Aave V3 functions (flashLoan, setConfiguration, etc.).

### Frontend

#### FHE Integration
- [ ] **cofhejs.encrypt()**: Integrate real FHE encryption in useSupply, useBorrow, useRepay hooks.
- [ ] **cofhejs.unseal()**: Implement local decryption in usePosition hook and PositionCard component.
- [ ] **FHE SDK initialization**: Complete initFhe() implementation with proper environment detection.
- [ ] **Encryption latency handling**: Add 600ms timeout handling for encryption operations.

#### UI/UX
- [ ] **Market discovery**: Implement market listing, filtering, and search functionality.
- [ ] **Advanced liquidation dashboard**: Create liquidator-specific interface for monitoring and executing liquidations.
- [ ] **Historical transaction log**: Implement transaction history with filtering and export.
- [ ] **Portfolio analytics**: Add risk metrics, health factor tracking, and position aggregation.
- [ ] **Multi-market support**: Enable users to manage positions across multiple markets simultaneously.
- [ ] **Gas estimation**: Display estimated gas costs for each operation.
- [ ] **Slippage protection**: Add slippage tolerance settings for borrow operations.

#### Components
- [ ] **Error boundaries**: Implement error boundary components for graceful error handling.
- [ ] **Loading states**: Add skeleton loaders for better UX during data fetching.
- [ ] **Notifications**: Implement toast notifications for transaction status updates.
- [ ] **Mobile responsiveness**: Optimize all components for mobile devices.

#### Hooks
- [ ] **useMarkets**: Fetch and cache available markets.
- [ ] **useMarketData**: Real-time market data (rates, TVL, utilization).
- [ ] **useHealthFactor**: Calculate and track position health factor.
- [ ] **useLiquidationPrice**: Calculate liquidation price for positions.

### Testing

#### Unit Tests
- [ ] **BlackPools.sol tests**: Full coverage of all functions with FHE mocking.
- [ ] **MarketLib.sol tests**: Market ID derivation, validation edge cases.
- [ ] **TaskManager.sol tests**: EIP-712 signature validation, permit lifecycle.
- [ ] **Counter.sol tests**: FHE operations (increment, decrement, reset).

#### Integration Tests
- [ ] **E2E supply flow**: Token approval → encryption → supply → position tracking.
- [ ] **E2E borrow flow**: Collateral supply → borrow → collateral check.
- [ ] **E2E liquidation**: Position monitoring → liquidation execution.
- [ ] **Interest accrual**: Verify O(1) accrual and share value increase.

#### Frontend Tests
- [ ] **Component tests**: useWallet, usePosition, useSupply with mocked contracts.
- [ ] **Hook tests**: Verify state management and side effects.
- [ ] **Integration tests**: Full user flows (connect → supply → borrow → repay).

### Deployment & DevOps

- [ ] **Hardhat tasks**: Implement deploy-counter and increment-counter tasks.
- [ ] **Deployment scripts**: Automated deployment to Arbitrum Sepolia with address saving.
- [ ] **Verification**: Contract verification on Arbiscan.
- [ ] **Frontend deployment**: Setup for Vercel or similar hosting.
- [ ] **Environment configuration**: Automated env var setup for different networks.

### Documentation

- [ ] **API documentation**: Generate TypeDoc for all contracts and frontend utilities.
- [ ] **Integration guide**: Step-by-step guide for integrating Black Pools into other dApps.
- [ ] **Security audit checklist**: Comprehensive security review checklist.
- [ ] **Troubleshooting guide**: Common issues and solutions.

### Security & Auditing

- [ ] **Access control audit**: Verify _allow() calls on all euint128 writes (NFR-02).
- [ ] **Reentrancy analysis**: Confirm ReentrancyGuard coverage on all external functions.
- [ ] **FHE operation verification**: Ensure all FHE operations are correctly implemented.
- [ ] **Gas optimization**: Optimize FHE operations to meet gas budgets (NFR-04).

## Known Limitations

1. **FHE.div unavailable**: Share-to-asset conversion uses 1:1 ratio for testnet. Production requires alternative approach.

2. **Plaintext ERC-20 amounts**: The plainAssets parameter exposes token amounts at ERC-20 layer. Production should use commit-reveal or ZK proofs.

3. **Off-chain liquidation verification**: Liquidation health checks are performed off-chain. Production requires on-chain verification.

4. **Keeper-supplied interest rate**: Interest rate is supplied by keeper bot. Production should use on-chain rate model or fixed parameters.

5. **No share redemption**: Withdraw function not yet implemented. Users cannot currently withdraw supplied tokens.

## Integration Checklist

Before production deployment:

- [ ] Complete all TODO items in smart contracts
- [ ] Implement full FHE encryption/decryption in frontend
- [ ] Add comprehensive test coverage (unit + integration + e2e)
- [ ] Security audit by professional firm
- [ ] Gas optimization and benchmarking
- [ ] Mainnet deployment strategy
- [ ] User documentation and tutorials
- [ ] Community feedback and iteration

## Development Workflow

### Local Development

```bash
# Install dependencies
pnpm install

# Compile contracts
pnpm compile

# Run tests
pnpm test

# Start local Hardhat node
pnpm hardhat node

# Deploy to local network (in another terminal)
pnpm hardhat deploy-vault --network localhost

# Start frontend dev server
cd frontend && pnpm dev
```

### Testnet Deployment

```bash
# Deploy to Arbitrum Sepolia
PRIVATE_KEY=your_key pnpm hardhat deploy-vault --network arbitrumSepolia

# Run E2E demo
pnpm hardhat demo-vault --network arbitrumSepolia
```

## References

- [Morpho Blue Whitepaper](https://whitepaper.morpho.org)
- [Fhenix CoFHE Docs](https://cofhe-docs.fhenix.zone)
- [cofhejs SDK](https://github.com/FhenixProtocol/cofhejs)
- [wagmi v2 Docs](https://wagmi.sh)
- [ConnectKit Docs](https://docs.family.co/connectkit)
- [EIP-712 Specification](https://eips.ethereum.org/EIPS/eip-712)

---

**Last Updated**: March 2026  
**Maintainer**: Fhenix Protocol Team
