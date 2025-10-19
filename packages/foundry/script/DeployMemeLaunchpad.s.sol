// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/TrustToken.sol";
import "../contracts/MemeLaunchpad.sol";

/**
 * @title DeployMemeLaunchpad
 * @dev Deployment script for MemeLaunchpad and TrustToken
 */
contract DeployMemeLaunchpad is Script {
    function run() external {
        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Get network URL from environment
        string memory networkUrl = vm.envString("NETWORK_URL");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy TRUST token first
        TrustToken trustToken = new TrustToken(
            "TRUST",
            "TRUST",
            18,
            1000000000000000000000000, // 1M tokens with 18 decimals
            msg.sender
        );

        console.log("TRUST Token deployed at:", address(trustToken));

        // Deploy MemeLaunchpad with TRUST token address
        MemeLaunchpad memeLaunchpad = new MemeLaunchpad(address(trustToken));

        console.log("MemeLaunchpad deployed at:", address(memeLaunchpad));
        console.log("Network URL:", networkUrl);

        vm.stopBroadcast();
    }
}