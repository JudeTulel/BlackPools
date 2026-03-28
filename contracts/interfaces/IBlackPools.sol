// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { euint128, ebool, InEuint128 } from "@fhenixprotocol/cofhe-contracts/FHE.sol";

interface IBlackPools {

    // ── Structs ──────────────────────────────────────────────────────────────

    struct MarketParams {
        address loanToken;
        address collateralToken;
        address oracle;
        uint128 lltv;
    }

    struct Market {
        euint128 totalSupplyAssets;
        euint128 totalBorrowAssets;
        euint128 totalSupplyShares;
        euint128 totalBorrowShares;
        uint256  lastUpdate;
        uint128  fee;
    }

    struct Position {
        euint128 supplyShares;
        euint128 borrowShares;
        euint128 collateral;
    }

    // ── Events ────────────────────────────────────────────────────────────────

    event MarketCreated(bytes32 indexed marketId, MarketParams params);
    event Supplied(bytes32 indexed marketId, address indexed user, address indexed onBehalfOf);
    event Withdrawn(bytes32 indexed marketId, address indexed caller, address indexed receiver);
    event CollateralSupplied(bytes32 indexed marketId, address indexed user, uint256 amount);
    event CollateralWithdrawn(bytes32 indexed marketId, address indexed caller, address indexed receiver);
    event Borrowed(bytes32 indexed marketId, address indexed user, address indexed receiver, uint256 amount);
    event Repaid(bytes32 indexed marketId, address indexed user, uint256 amount);
    event Liquidated(bytes32 indexed marketId, address indexed borrower, address indexed liquidator, uint256 seizedAssets);
    event InterestAccrued(bytes32 indexed marketId, uint256 timestamp);

    // ── Functions ─────────────────────────────────────────────────────────────

    function createMarket(MarketParams calldata params) external;

    function supply(
        MarketParams calldata params,
        InEuint128   calldata encryptedAssets,
        uint256               plainAssets,
        address               onBehalfOf
    ) external;

    function withdraw(
        MarketParams calldata params,
        InEuint128   calldata encryptedShares,
        uint256               plainAssets,
        address               user,
        address               receiver
    ) external;

    function supplyCollateral(
        MarketParams calldata params,
        InEuint128   calldata encryptedCollateral,
        uint256               plainCollateral,
        address               user
    ) external;

    function withdrawCollateral(
        MarketParams calldata params,
        InEuint128   calldata encryptedAssets,
        uint256               plainAssets,
        address               onBehalfOf,
        address               receiver
    ) external;

    function borrow(
        MarketParams calldata params,
        InEuint128   calldata encryptedBorrowAmount,
        uint256               plainAmount,
        address               user,
        address               receiver
    ) external;

    function repay(
        MarketParams calldata params,
        InEuint128   calldata encryptedRepayAmount,
        uint256               plainAmount,
        address               user
    ) external;

    function accrueInterest(
        MarketParams calldata params,
        InEuint128   calldata encryptedRate
    ) external;

    function liquidate(
        MarketParams calldata params,
        address               borrower,
        InEuint128   calldata encryptedSeizedAssets,
        uint256               plainSeizedAssets
    ) external;

    function market(bytes32 marketId) external view returns (Market memory);
    function position(bytes32 marketId, address user) external view returns (Position memory);
    function idToMarketParams(bytes32 marketId) external view returns (MarketParams memory);
    function isMarketCreated(bytes32 marketId) external view returns (bool);
}