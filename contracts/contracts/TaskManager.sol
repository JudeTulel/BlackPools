// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title BlackPoolsTaskManager
 * @notice EIP-712 permit delegation for third-party access to encrypted positions.
 *
 * Allows users to issue signed permits to auditors, lenders, and liquidators,
 * granting them temporary access to decrypt their positions.
 *
 * TODO: Full implementation of permit validation and revocation.
 */
contract BlackPoolsTaskManager is EIP712 {
    // ============ Constants ============

    bytes32 public constant PERMIT_TYPEHASH =
        keccak256("Permit(address grantee,uint8 role,uint256 expiresAt,uint256 nonce,bytes granteePublicKey)");

    enum Role {
        LENDER,
        AUDITOR,
        LIQUIDATOR
    }

    // ============ State ============

    /// @notice User => nonce for replay protection.
    mapping(address => uint256) public nonces;

    /// @notice User => grantee => permit data.
    mapping(address => mapping(address => Permit)) public permits;

    struct Permit {
        Role role;
        uint256 expiresAt;
        bytes granteePublicKey;
        bool revoked;
    }

    // ============ Events ============

    event PermitIssued(address indexed user, address indexed grantee, Role role, uint256 expiresAt);
    event PermitRevoked(address indexed user, address indexed grantee);

    // ============ Constructor ============

    constructor() EIP712("BlackPools", "1") {}

    // ============ Core Functions ============

    /**
     * @notice Issue a permit for third-party access.
     * @param grantee Address receiving access.
     * @param role Role (LENDER, AUDITOR, LIQUIDATOR).
     * @param expiresAt Expiration timestamp.
     * @param granteePublicKey Public key for decryption (optional).
     * @param v ECDSA signature component.
     * @param r ECDSA signature component.
     * @param s ECDSA signature component.
     * @dev TODO: Validate signature and store permit.
     */
    function permit(
        address grantee,
        Role role,
        uint256 expiresAt,
        bytes calldata granteePublicKey,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        uint256 nonce = nonces[msg.sender];
        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, grantee, role, expiresAt, nonce, keccak256(granteePublicKey))
        );
        address signer = ECDSA.recover(_hashTypedDataV4(structHash), v, r, s);
        require(signer == msg.sender, "TaskManager: invalid signature");

        unchecked {
            nonces[msg.sender] = nonce + 1;
        }
        permits[msg.sender][grantee] = Permit({
            role: role,
            expiresAt: expiresAt,
            granteePublicKey: granteePublicKey,
            revoked: false
        });

        emit PermitIssued(msg.sender, grantee, role, expiresAt);
    }

    /**
     * @notice Revoke a permit immediately.
     * @param grantee Address to revoke access from.
     */
    function revoke(address grantee) external {
        require(permits[msg.sender][grantee].expiresAt > 0, "TaskManager: permit not found");
        permits[msg.sender][grantee].revoked = true;
        emit PermitRevoked(msg.sender, grantee);
    }

    /**
     * @notice Check if a permit is valid.
     * @param user User who issued the permit.
     * @param grantee Address to check.
     * @return valid True if permit is valid and not expired/revoked.
     */
    function isPermitValid(address user, address grantee) external view returns (bool) {
        Permit memory p = permits[user][grantee];
        return p.expiresAt > block.timestamp && !p.revoked;
    }

    /**
     * @notice Get permit details.
     * @param user User who issued the permit.
     * @param grantee Address to check.
     * @return permit Permit struct.
     */
    function getPermit(address user, address grantee) external view returns (Permit memory) {
        return permits[user][grantee];
    }
}


