// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "src/examples/L2Registrar.sol";

/// @dev Deploy L2Registrar contract to Base Sepolia
contract DeployL2Registrar is Script {
    // Registry address for Base Sepolia
    address public constant REGISTRY_ADDRESS = 0x3A4955594818c33D02B3FE0c843f8aA2A706c509;

    function setUp() public {}

    function run() public {
        // Create fork for Base Sepolia
        vm.createSelectFork("base-sepolia");
        
        console.log("Deploying L2Registrar to Base Sepolia...");
        console.log("Registry address:", REGISTRY_ADDRESS);
        
        vm.startBroadcast();

        // Deploy L2Registrar with the registry address
        L2Registrar registrar = new L2Registrar(REGISTRY_ADDRESS);

        vm.stopBroadcast();

        console.log("L2Registrar deployed to:", address(registrar));
        console.log("Chain ID:", block.chainid);
        console.log("Coin Type:", registrar.coinType());
    }
}
