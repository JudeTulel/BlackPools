// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IBlackPools } from "../interfaces/IBlackPools.sol";

library MarketLib {

    function id(IBlackPools.MarketParams memory params) internal pure returns (bytes32) {
        return keccak256(abi.encode(params));
    }

    function validate(IBlackPools.MarketParams memory params) internal pure {
        require(params.loanToken       != address(0), "MarketLib: zero loan token");
        require(params.collateralToken != address(0), "MarketLib: zero collateral token");
        require(params.lltv >= 1 && params.lltv <= 9999, "MarketLib: invalid lltv");
         require(params.oracle          != address(0), "MarketLib: zero oracle");   
    }

    // Takes storage pointer — avoids copying the whole struct on every existence check
    function isCreated(IBlackPools.Market storage m) internal view returns (bool) {
        return m.lastUpdate != 0;
    }
}