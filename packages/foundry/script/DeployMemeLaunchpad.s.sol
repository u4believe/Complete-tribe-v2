// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/MemeLaunchpad.sol";

/**
 * @title DeployMemeLaunchpad
 * @dev Deployment script for MemeLaunchpad
 */
contract DeployMemeLaunchpad is Script {
    function run() external {
        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Get network URL from environment
        string memory networkUrl = vm.envString("NETWORK_URL");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy MemeLaunchpad with treasury address
        address treasuryAddress = 0xD4F79436a2a69C70127570749dc39Ae5D5C0c646;
        MemeLaunchpad memeLaunchpad = new MemeLaunchpad(treasuryAddress);

        console.log("MemeLaunchpad deployed at:", address(memeLaunchpad));
        console.log("Network URL:", networkUrl);

        vm.stopBroadcast();
    }
}