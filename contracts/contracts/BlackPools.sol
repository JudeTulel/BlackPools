// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20, SafeERC20 }           from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard }             from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { euint128, ebool, InEuint128 } from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import { FHE }                         from "@fhenixprotocol/cofhe-contracts/FHE.sol";

import { IBlackPools } from "../interfaces/IBlackPools.sol";
import { MarketLib }   from "../libraries/MarketLib.sol";

contract BlackPools is IBlackPools, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using MarketLib for IBlackPools.MarketParams;

    mapping(bytes32 => Market)                       private _markets;
    mapping(bytes32 => mapping(address => Position)) private _positions;
    mapping(bytes32 => MarketParams)                 private _marketParams;

    constructor() {}

    // ── Internal helpers ─────────────────────────────────────────────────────

    /// @dev Derive an encrypted zero from a valid encrypted uint128 handle.
    ///      The mock TaskManager mis-tags FHE.asEuint128(0), so we build zero
    ///      from a typed seed instead.
    function _initZeroFrom(euint128 seed) internal returns (euint128 z) {
        z = FHE.sub(seed, seed);
        FHE.allowThis(z);
    }

    /// @dev Grant this contract and msg.sender access, plus an optional
    ///      third address. Call after every euint128 write.
    function _allow(euint128 value, address user) internal {
        FHE.allowThis(value);
        FHE.allowSender(value);
        if (user != address(0) && user != msg.sender) {
            FHE.allow(value, user);
        }
    }

    /// @dev Initialise market totals from a typed encrypted seed before the
    ///      first FHE operation touches them.
    function _initMarketIfNeeded(bytes32 marketId, euint128 seed) internal {
        Market storage m = _markets[marketId];
        if (euint128.unwrap(m.totalSupplyAssets) == 0) {
            m.totalSupplyAssets = _initZeroFrom(seed);
            _allow(m.totalSupplyAssets, address(0));
        }
        if (euint128.unwrap(m.totalBorrowAssets) == 0) {
            m.totalBorrowAssets = _initZeroFrom(seed);
            _allow(m.totalBorrowAssets, address(0));
        }
        if (euint128.unwrap(m.totalSupplyShares) == 0) {
            m.totalSupplyShares = _initZeroFrom(seed);
            _allow(m.totalSupplyShares, address(0));
        }
        if (euint128.unwrap(m.totalBorrowShares) == 0) {
            m.totalBorrowShares = _initZeroFrom(seed);
            _allow(m.totalBorrowShares, address(0));
        }
    }

    /// @dev New users have storage-zero euint128 fields (not valid FHE
    ///      handles). Initialise them before the first FHE operation.
    function _initPositionIfNeeded(bytes32 marketId, address user, euint128 seed) internal {
        Position storage p = _positions[marketId][user];
        if (euint128.unwrap(p.supplyShares) == 0) {
            p.supplyShares = _initZeroFrom(seed);
            _allow(p.supplyShares, user);
        }
        if (euint128.unwrap(p.borrowShares) == 0) {
            p.borrowShares = _initZeroFrom(seed);
            _allow(p.borrowShares, user);
        }
        if (euint128.unwrap(p.collateral) == 0) {
            p.collateral = _initZeroFrom(seed);
            _allow(p.collateral, user);
        }
    }

    // ── Market creation ──────────────────────────────────────────────────────

    function createMarket(MarketParams calldata params) external nonReentrant {
        params.validate();
        bytes32 marketId = params.id();
        require(!MarketLib.isCreated(_markets[marketId]), "BlackPools: market exists");

        // Encrypted totals are lazily initialised from the first typed euint128
        // that touches the market. This avoids the mock TaskManager bug around
        // FHE.asEuint128(0) metadata.
        _markets[marketId].lastUpdate        = block.timestamp;
        _markets[marketId].fee               = 0;
        _marketParams[marketId]              = params;

        emit MarketCreated(marketId, params);
    }

    // ── Supply ───────────────────────────────────────────────────────────────

    function supply(
        MarketParams calldata params,
        InEuint128   calldata encryptedAssets,
        uint256               plainAssets,
        address               onBehalfOf
    ) external nonReentrant {
        bytes32 marketId = params.id();
        require(MarketLib.isCreated(_markets[marketId]), "BlackPools: market not found");

        IERC20(params.loanToken).safeTransferFrom(msg.sender, address(this), plainAssets);

        euint128 assets = FHE.asEuint128(encryptedAssets);
        FHE.allowThis(assets);
        FHE.allowSender(assets);

        euint128 shares = assets; // 1:1 for testnet

        _initMarketIfNeeded(marketId, assets);
        _initPositionIfNeeded(marketId, onBehalfOf, assets);

        _markets[marketId].totalSupplyAssets =
            FHE.add(_markets[marketId].totalSupplyAssets, assets);
        _markets[marketId].totalSupplyShares =
            FHE.add(_markets[marketId].totalSupplyShares, shares);
        _positions[marketId][onBehalfOf].supplyShares =
            FHE.add(_positions[marketId][onBehalfOf].supplyShares, shares);

        _allow(_markets[marketId].totalSupplyAssets, address(0));
        _allow(_markets[marketId].totalSupplyShares, address(0));
        _allow(_positions[marketId][onBehalfOf].supplyShares, onBehalfOf);

        emit Supplied(marketId, msg.sender, onBehalfOf);
    }

    // ── Withdraw ─────────────────────────────────────────────────────────────

    function withdraw(
        MarketParams calldata params,
        InEuint128   calldata encryptedShares,
        uint256               plainAssets,
        address               user,
        address               receiver
    ) external nonReentrant {
        bytes32 marketId = params.id();
        require(MarketLib.isCreated(_markets[marketId]), "BlackPools: market not found");
        require(user == msg.sender, "BlackPools: not authorized");

        euint128 shares = FHE.asEuint128(encryptedShares);
        FHE.allowThis(shares);
        FHE.allowSender(shares);

        euint128 assets = shares; // 1:1 for testnet

        _positions[marketId][user].supplyShares =
            FHE.sub(_positions[marketId][user].supplyShares, shares);
        _markets[marketId].totalSupplyShares =
            FHE.sub(_markets[marketId].totalSupplyShares, shares);
        _markets[marketId].totalSupplyAssets =
            FHE.sub(_markets[marketId].totalSupplyAssets, assets);

        _allow(_positions[marketId][user].supplyShares, user);
        _allow(_markets[marketId].totalSupplyShares, address(0));
        _allow(_markets[marketId].totalSupplyAssets, address(0));

        IERC20(params.loanToken).safeTransfer(receiver, plainAssets);
        emit Withdrawn(marketId, msg.sender, receiver);
    }

    // ── supplyCollateral ─────────────────────────────────────────────────────

    function supplyCollateral(
        MarketParams calldata params,
        InEuint128   calldata encryptedCollateral,
        uint256               plainCollateral,
        address               user
    ) external nonReentrant {
        bytes32 marketId = params.id();
        require(MarketLib.isCreated(_markets[marketId]), "BlackPools: market not found");

        IERC20(params.collateralToken).safeTransferFrom(msg.sender, address(this), plainCollateral);

        euint128 collateral = FHE.asEuint128(encryptedCollateral);
        FHE.allowThis(collateral);
        FHE.allowSender(collateral);

        _initPositionIfNeeded(marketId, user, collateral);

        _positions[marketId][user].collateral =
            FHE.add(_positions[marketId][user].collateral, collateral);
        _allow(_positions[marketId][user].collateral, user);

        emit CollateralSupplied(marketId, msg.sender, plainCollateral);
    }

    // ── withdrawCollateral ───────────────────────────────────────────────────

    function withdrawCollateral(
        MarketParams calldata params,
        InEuint128   calldata encryptedAssets,
        uint256               plainAssets,
        address               onBehalfOf,
        address               receiver
    ) external nonReentrant {
        bytes32 marketId = params.id();
        require(MarketLib.isCreated(_markets[marketId]), "BlackPools: market not found");
        require(onBehalfOf == msg.sender, "BlackPools: not authorized");

        euint128 assets = FHE.asEuint128(encryptedAssets);
        FHE.allowThis(assets);
        FHE.allowSender(assets);

        _positions[marketId][onBehalfOf].collateral =
            FHE.sub(_positions[marketId][onBehalfOf].collateral, assets);
        _allow(_positions[marketId][onBehalfOf].collateral, onBehalfOf);

        IERC20(params.collateralToken).safeTransfer(receiver, plainAssets);
        emit CollateralWithdrawn(marketId, msg.sender, receiver);
    }

    // ── borrow ───────────────────────────────────────────────────────────────

    function borrow(
        MarketParams calldata params,
        InEuint128   calldata encryptedBorrowAmount,
        uint256               plainAmount,
        address               user,
        address               receiver
    ) external nonReentrant {
        bytes32 marketId = params.id();
        require(MarketLib.isCreated(_markets[marketId]), "BlackPools: market not found");
        require(user == msg.sender, "BlackPools: not authorized");

        euint128 borrowAmount = FHE.asEuint128(encryptedBorrowAmount);
        FHE.allowThis(borrowAmount);
        FHE.allowSender(borrowAmount);

        _initMarketIfNeeded(marketId, borrowAmount);
        _initPositionIfNeeded(marketId, user, borrowAmount);

        euint128 newBorrowShares = FHE.add(_positions[marketId][user].borrowShares, borrowAmount);
        FHE.allowThis(newBorrowShares);
        euint128 lltvEnc = FHE.asEuint128(uint128(params.lltv));
        FHE.allowThis(lltvEnc);
        euint128 required = FHE.mul(newBorrowShares, lltvEnc);
        FHE.allowThis(required);
        ebool isSafe = FHE.gte(_positions[marketId][user].collateral, required);
        FHE.allowThis(isSafe);
        euint128 zero = _initZeroFrom(borrowAmount);
        euint128 sharesToAdd = FHE.select(isSafe, borrowAmount, zero);
        FHE.allowThis(sharesToAdd);

        _markets[marketId].totalBorrowShares =
            FHE.add(_markets[marketId].totalBorrowShares, sharesToAdd);
        _markets[marketId].totalBorrowAssets =
            FHE.add(_markets[marketId].totalBorrowAssets, sharesToAdd);
        _positions[marketId][user].borrowShares =
            FHE.add(_positions[marketId][user].borrowShares, sharesToAdd);

        _allow(_markets[marketId].totalBorrowShares, address(0));
        _allow(_markets[marketId].totalBorrowAssets, address(0));
        _allow(_positions[marketId][user].borrowShares, user);

        IERC20(params.loanToken).safeTransfer(receiver, plainAmount);
        emit Borrowed(marketId, user, receiver, plainAmount);
    }

    // ── Repay ────────────────────────────────────────────────────────────────

    function repay(
        MarketParams calldata params,
        InEuint128   calldata encryptedRepayAmount,
        uint256               plainAmount,
        address               user
    ) external nonReentrant {
        bytes32 marketId = params.id();
        require(MarketLib.isCreated(_markets[marketId]), "BlackPools: market not found");

        IERC20(params.loanToken).safeTransferFrom(msg.sender, address(this), plainAmount);

        euint128 repayAmount = FHE.asEuint128(encryptedRepayAmount);
        FHE.allowThis(repayAmount);
        FHE.allowSender(repayAmount);

        _initMarketIfNeeded(marketId, repayAmount);
        _initPositionIfNeeded(marketId, user, repayAmount);

        _markets[marketId].totalBorrowAssets =
            FHE.sub(_markets[marketId].totalBorrowAssets, repayAmount);
        _markets[marketId].totalBorrowShares =
            FHE.sub(_markets[marketId].totalBorrowShares, repayAmount);
        _positions[marketId][user].borrowShares =
            FHE.sub(_positions[marketId][user].borrowShares, repayAmount);

        _allow(_markets[marketId].totalBorrowAssets, address(0));
        _allow(_markets[marketId].totalBorrowShares, address(0));
        _allow(_positions[marketId][user].borrowShares, user);

        emit Repaid(marketId, user, plainAmount);
    }

    // ── Interest accrual ─────────────────────────────────────────────────────

    function accrueInterest(
        MarketParams calldata params,
        InEuint128   calldata encryptedRate
    ) external nonReentrant {
        bytes32 marketId = params.id();
        require(MarketLib.isCreated(_markets[marketId]), "BlackPools: market not found");

        uint256 elapsed = block.timestamp - _markets[marketId].lastUpdate;
        require(elapsed > 0, "BlackPools: no time elapsed");

        euint128 rate = FHE.asEuint128(encryptedRate);
        FHE.allowThis(rate);
        _initMarketIfNeeded(marketId, rate);
        euint128 elapsedEnc = FHE.asEuint128(uint128(elapsed));
        FHE.allowThis(elapsedEnc);
        euint128 interest = FHE.mul(_markets[marketId].totalBorrowAssets, FHE.mul(rate, elapsedEnc));
        FHE.allowThis(interest);

        _markets[marketId].totalBorrowAssets =
            FHE.add(_markets[marketId].totalBorrowAssets, interest);
        _markets[marketId].totalSupplyAssets =
            FHE.add(_markets[marketId].totalSupplyAssets, interest);
        _markets[marketId].lastUpdate = block.timestamp;

        _allow(_markets[marketId].totalBorrowAssets, address(0));
        _allow(_markets[marketId].totalSupplyAssets, address(0));

        emit InterestAccrued(marketId, block.timestamp);
    }

    // ── Liquidation ──────────────────────────────────────────────────────────

    function liquidate(
        MarketParams calldata params,
        address               borrower,
        InEuint128   calldata encryptedSeizedAssets,
        uint256               plainSeizedAssets
    ) external nonReentrant {
        bytes32 marketId = params.id();
        require(MarketLib.isCreated(_markets[marketId]), "BlackPools: market not found");

        euint128 seizedAssets = FHE.asEuint128(encryptedSeizedAssets);
        FHE.allowThis(seizedAssets);
        FHE.allowSender(seizedAssets);
        _initMarketIfNeeded(marketId, seizedAssets);
        _initPositionIfNeeded(marketId, borrower, seizedAssets);

        euint128 repaid = seizedAssets; // 1:1 for testnet

        _positions[marketId][borrower].collateral =
            FHE.sub(_positions[marketId][borrower].collateral, seizedAssets);
        _markets[marketId].totalBorrowShares =
            FHE.sub(_markets[marketId].totalBorrowShares, repaid);
        _markets[marketId].totalBorrowAssets =
            FHE.sub(_markets[marketId].totalBorrowAssets, repaid);
        _positions[marketId][borrower].borrowShares =
            FHE.sub(_positions[marketId][borrower].borrowShares, repaid);

        _allow(_positions[marketId][borrower].collateral,   borrower);
        _allow(_markets[marketId].totalBorrowShares,        address(0));
        _allow(_markets[marketId].totalBorrowAssets,        address(0));
        _allow(_positions[marketId][borrower].borrowShares, borrower);

        IERC20(params.collateralToken).safeTransfer(msg.sender, plainSeizedAssets);
        emit Liquidated(marketId, borrower, msg.sender, plainSeizedAssets);
    }

    // ── Views ────────────────────────────────────────────────────────────────

    function market(bytes32 marketId) external view returns (Market memory) {
        return _markets[marketId];
    }

    function position(bytes32 marketId, address user) external view returns (Position memory) {
        return _positions[marketId][user];
    }

    function idToMarketParams(bytes32 marketId) external view returns (MarketParams memory) {
        return _marketParams[marketId];
    }

    function isMarketCreated(bytes32 marketId) external view returns (bool) {
        return MarketLib.isCreated(_markets[marketId]);
    }
}



