// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/TrustToken.sol";

/**
 * @title DeployTrustToken
 * @dev Deployment script for TRUST token
 */
contract DeployTrustToken is Script {
    function run() external {
        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy TRUST token
        TrustToken trustToken = new TrustToken(
            "TRUST",
            "TRUST",
            18,
            1000000000000000000000000, // 1M tokens with 18 decimals
            msg.sender
        );

        console.log("TRUST Token deployed at:", address(trustToken));

        vm.stopBroadcast();
    }
}