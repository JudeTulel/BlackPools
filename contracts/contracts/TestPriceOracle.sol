// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { IPriceOracle } from "../interfaces/IPriceOracle.sol";

/**
 * @title TestPriceOracle
 * @notice Simple Chainlink-compatible price oracle for local and test deployments.
 */
contract TestPriceOracle is IPriceOracle {
    uint8 private immutable _oracleDecimals;
    int256 private _answer;
    uint256 private _updatedAt;

    constructor(uint8 oracleDecimals_, int256 initialAnswer) {
        require(initialAnswer > 0, "TestPriceOracle: invalid answer");
        _oracleDecimals = oracleDecimals_;
        _setPrice(initialAnswer);
    }

    function decimals() external view returns (uint8) {
        return _oracleDecimals;
    }

    function setPrice(int256 newAnswer) external {
        require(newAnswer > 0, "TestPriceOracle: invalid answer");
        _setPrice(newAnswer);
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (0, _answer, _updatedAt, _updatedAt, 0);
    }

    function _setPrice(int256 newAnswer) internal {
        _answer = newAnswer;
        _updatedAt = block.timestamp;
    }
}

