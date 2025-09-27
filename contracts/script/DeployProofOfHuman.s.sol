// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { ProofOfHuman } from "../src/ProofOfHuman.sol";
import { BaseScript } from "./Base.s.sol";
import { CountryCodes } from "@selfxyz/contracts/contracts/libraries/CountryCode.sol";
import { console } from "forge-std/console.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";

/// @title DeployProofOfHuman
/// @notice Deployment script for ProofOfHuman contract using standard deployment
contract DeployProofOfHuman is BaseScript {
    // Custom errors for deployment verification
    error DeploymentFailed();

    /// @notice Main deployment function using standard deployment
    /// @return proofOfHuman The deployed ProofOfHuman contract instance
    /// @dev Requires the following environment variables:
    ///      - IDENTITY_VERIFICATION_HUB_ADDRESS: Address of the Self Protocol verification hub
    ///      - PLACEHOLDER_SCOPE: Placeholder scope value (defaults to 1)

    function run() public broadcast returns (ProofOfHuman proofOfHuman) {
        address hubAddress = vm.envAddress("IDENTITY_VERIFICATION_HUB_ADDRESS");
        string[] memory forbiddenCountries = new string[](1);
        
        // Make sure this is the same as frontend config
        forbiddenCountries[0] = CountryCodes.UNITED_STATES;
        SelfUtils.UnformattedVerificationConfigV2 memory verificationConfig = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 18,
            forbiddenCountries: forbiddenCountries,
            ofacEnabled: false
        });

        // Deploy the contract using standard deployment with placeholder scope
        proofOfHuman = new ProofOfHuman(hubAddress, "test-scope", verificationConfig);

        // Log deployment information
        console.log("ProofOfHuman deployed to:", address(proofOfHuman));
        console.log("Identity Verification Hub:", hubAddress);
        console.log("Scope Value:", proofOfHuman.scope());

        // Verify deployment was successful
        if (address(proofOfHuman) == address(0)) revert DeploymentFailed();

        console.log("Deployment verification completed successfully!");
        console.log("Next step: Calculate actual scope using deployed address and call setScope()");

        // Set registry addresses for different countries
        proofOfHuman._setRegistry("IND", 0xc3a4eB979e9035486b54Fe8b57D36aEF9519eAc6);
        proofOfHuman._setRegistry("ARG", 0x7B923b2948F41993c194eC8F761Fb2eE294A55Fa);
        proofOfHuman._setRegistry("FRA", 0xf9D7aBb40ff5943B0bb53D584e72daFC7A5c79DB);
    }
}
