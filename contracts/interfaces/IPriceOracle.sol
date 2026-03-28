// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title IPriceOracle
 * @notice Minimal Chainlink-compatible oracle interface used by BlackPools.
 * The oracle answer is the price of 1 collateral token denominated in loan-token units,
 * scaled by `decimals()`.
 */
interface IPriceOracle {
    function decimals() external view returns (uint8);

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}
