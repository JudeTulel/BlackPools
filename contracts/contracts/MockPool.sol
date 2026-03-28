// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MockPool
 * @notice Aave V3 IPool simulation for testnet.
 *
 * Implements core Aave V3 functions (supply, borrow, withdraw, repay, getReserveData, getUserAccountData)
 * to allow testing and integration with existing Aave-compatible frontends.
 *
 * Testnet only — onlyTestnet guard prevents mainnet deployment.
 * TODO: Full implementation of all Aave V3 features.
 */
contract MockPool {
    using SafeERC20 for IERC20;

    // ============ Constants ============

    /// @notice Mainnet chain IDs (to prevent deployment on mainnet).
    uint256 private constant MAINNET_CHAIN_ID = 1;
    uint256 private constant ARBITRUM_MAINNET_CHAIN_ID = 42161;
    uint256 private constant BASE_MAINNET_CHAIN_ID = 8453;
    uint256 private constant OPTIMISM_MAINNET_CHAIN_ID = 10;
    uint256 private constant POLYGON_MAINNET_CHAIN_ID = 137;

    // ============ State ============

    /// @notice Reserve data per token.
    mapping(address => ReserveData) public reserves;

    /// @notice User account data per token.
    mapping(address => mapping(address => UserAccountData)) public userAccounts;

    struct ReserveData {
        address underlyingAsset;
        uint256 totalSupply;
        uint256 totalBorrow;
        uint256 liquidityRate;
        uint256 variableBorrowRate;
    }

    struct UserAccountData {
        uint256 totalCollateral;
        uint256 totalDebt;
        uint256 availableBorrows;
        uint256 currentLiquidationThreshold;
        uint256 ltv;
        uint256 healthFactor;
    }

    // ============ Events ============

    event Supply(address indexed asset, address indexed user, uint256 amount);
    event Borrow(address indexed asset, address indexed user, uint256 amount);
    event Withdraw(address indexed asset, address indexed user, uint256 amount);
    event Repay(address indexed asset, address indexed user, uint256 amount);

    // ============ Modifiers ============

    modifier onlyTestnet() {
        require(
            block.chainid != MAINNET_CHAIN_ID &&
            block.chainid != ARBITRUM_MAINNET_CHAIN_ID &&
            block.chainid != BASE_MAINNET_CHAIN_ID &&
            block.chainid != OPTIMISM_MAINNET_CHAIN_ID &&
            block.chainid != POLYGON_MAINNET_CHAIN_ID,
            "MockPool: testnet only"
        );
        _;
    }

    // ============ Core Functions ============

    /**
     * @notice Supply tokens to the pool.
     * @param asset Token address.
     * @param amount Amount to supply.
     * @param onBehalfOf Beneficiary address.
     * @param referralCode Referral code (unused).
     */
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external onlyTestnet {
        require(asset != address(0), "MockPool: zero asset");
        require(amount > 0, "MockPool: zero amount");

        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);

        reserves[asset].totalSupply += amount;
        userAccounts[onBehalfOf][asset].totalCollateral += amount;

        emit Supply(asset, onBehalfOf, amount);
    }

    /**
     * @notice Borrow tokens from the pool.
     * @param asset Token address.
     * @param amount Amount to borrow.
     * @param interestRateMode Interest rate mode (1 = stable, 2 = variable).
     * @param referralCode Referral code (unused).
     * @param onBehalfOf Beneficiary address.
     */
    function borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    ) external onlyTestnet {
        require(asset != address(0), "MockPool: zero asset");
        require(amount > 0, "MockPool: zero amount");

        // TODO: Implement collateral check
        // For now, allowing any borrow

        IERC20(asset).safeTransfer(msg.sender, amount);

        reserves[asset].totalBorrow += amount;
        userAccounts[onBehalfOf][asset].totalDebt += amount;

        emit Borrow(asset, onBehalfOf, amount);
    }

    /**
     * @notice Withdraw tokens from the pool.
     * @param asset Token address.
     * @param amount Amount to withdraw.
     * @param to Receiver address.
     * @return actualAmount Actual amount withdrawn.
     */
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external onlyTestnet returns (uint256) {
        require(asset != address(0), "MockPool: zero asset");
        require(amount > 0, "MockPool: zero amount");

        uint256 actualAmount = amount;
        if (actualAmount > userAccounts[msg.sender][asset].totalCollateral) {
            actualAmount = userAccounts[msg.sender][asset].totalCollateral;
        }

        IERC20(asset).safeTransfer(to, actualAmount);

        reserves[asset].totalSupply -= actualAmount;
        userAccounts[msg.sender][asset].totalCollateral -= actualAmount;

        emit Withdraw(asset, msg.sender, actualAmount);

        return actualAmount;
    }

    /**
     * @notice Repay borrowed tokens.
     * @param asset Token address.
     * @param amount Amount to repay.
     * @param interestRateMode Interest rate mode (1 = stable, 2 = variable).
     * @param onBehalfOf Beneficiary address.
     * @return actualAmount Actual amount repaid.
     */
    function repay(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        address onBehalfOf
    ) external onlyTestnet returns (uint256) {
        require(asset != address(0), "MockPool: zero asset");
        require(amount > 0, "MockPool: zero amount");

        uint256 actualAmount = amount;
        if (actualAmount > userAccounts[onBehalfOf][asset].totalDebt) {
            actualAmount = userAccounts[onBehalfOf][asset].totalDebt;
        }

        IERC20(asset).safeTransferFrom(msg.sender, address(this), actualAmount);

        reserves[asset].totalBorrow -= actualAmount;
        userAccounts[onBehalfOf][asset].totalDebt -= actualAmount;

        emit Repay(asset, onBehalfOf, actualAmount);

        return actualAmount;
    }

    // ============ View Functions ============

    /**
     * @notice Get reserve data for a token.
     * @param asset Token address.
     * @return reserve Reserve data struct.
     */
    function getReserveData(address asset) external view returns (ReserveData memory) {
        return reserves[asset];
    }

    /**
     * @notice Get user account data.
     * @param user User address.
     * @param asset Token address.
     * @return totalCollateral Total collateral.
     * @return totalDebt Total debt.
     * @return availableBorrows Available borrow amount.
     * @return currentLiquidationThreshold Liquidation threshold.
     * @return ltv Loan-to-value ratio.
     * @return healthFactor Health factor.
     */
    function getUserAccountData(address user, address asset)
        external
        view
        returns (
            uint256 totalCollateral,
            uint256 totalDebt,
            uint256 availableBorrows,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        UserAccountData memory data = userAccounts[user][asset];
        return (
            data.totalCollateral,
            data.totalDebt,
            data.availableBorrows,
            data.currentLiquidationThreshold,
            data.ltv,
            data.healthFactor
        );
    }
}
