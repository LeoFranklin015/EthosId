// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import { SelfStructs } from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import { IIdentityVerificationHubV2 } from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";

import {IL2Registry} from "./interfaces/IL2Registry.sol";


/**
 * @title TestSelfVerificationRoot
 * @notice Test implementation of SelfVerificationRoot for testing purposes
 * @dev This contract provides a concrete implementation of the abstract SelfVerificationRoot
 */
contract ProofOfHuman is SelfVerificationRoot {
    // Storage for testing purposes
    bool public verificationSuccessful;
    ISelfVerificationRoot.GenericDiscloseOutputV2 public lastOutput;
    bytes public lastUserData;
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;
    address public lastUserAddress;

    // Events for testing
    event VerificationCompleted(ISelfVerificationRoot.GenericDiscloseOutputV2 output, bytes userData, string country);

      // Doing this because Reverse Lookup isnt achieved in the L2 registry.
     mapping(address => mapping(string => bool)) public userCountryVerification;


  /// @notice Maps nullifiers to user identifiers for registration tracking
    mapping(uint256 nullifier => uint256 userIdentifier) internal _nullifierToUserIdentifier;

 /// @notice Reverts when a nullifier has already been registered
    error AlreadyRegistered();
    /// @notice The chainId for the current chain
    uint256 public chainId;

    /// @notice The coinType for the current chain (ENSIP-11)
    uint256 public immutable coinType;

    mapping (string => address) registryAddress;


    /**
     * @notice Constructor for the test contract
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     */
    constructor(
        address identityVerificationHubV2Address,
        string memory scope, 
        SelfUtils.UnformattedVerificationConfigV2 memory _verificationConfig
    )
        SelfVerificationRoot(identityVerificationHubV2Address, scope)
    {
        verificationConfig = SelfUtils.formatVerificationConfigV2(_verificationConfig);
        verificationConfigId =
            IIdentityVerificationHubV2(identityVerificationHubV2Address).setVerificationConfigV2(verificationConfig);

        assembly {
            sstore(chainId.slot, chainid())
        }

        // Calculate the coinType for the current chain according to ENSIP-11
        coinType = (0x80000000 | chainId) >> 0;
    }

    /**
     * @notice Implementation of customVerificationHook for testing
     * @dev This function is called by onVerificationSuccess after hub address validation
     * @param output The verification output from the hub
     * @param userData The user data passed through verification
     */

    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    )
        internal
        override
    {
        verificationSuccessful = true;
        lastOutput = output;
        lastUserData = userData;
        lastUserAddress = address(uint160(output.userIdentifier));
        string memory country = output.nationality;
        bytes memory addr = abi.encodePacked(lastUserAddress); // Convert address to bytes

      
       address registryAddr = registryAddress[country];
        require(registryAddr != address(0), "No registry set for this country");
        IL2Registry registry = IL2Registry(registryAddr);
        bytes32 node = _labelToNode(string(lastUserData), registryAddr);
      // Set the forward address for the current chain. This is needed for reverse resolution.
        // E.g. if this contract is deployed to Base, set an address for chainId 8453 which is
        // coinType 2147492101 according to ENSIP-11.
     registry.setAddr(node, coinType, addr);

        // Set the forward address for mainnet ETH (coinType 60) for easier debugging.
        registry.setAddr(node, 60, addr);

        
        // Register the name in the L2 registry
        registry.createSubnode(
            registry.baseNode(),
            string(lastUserData),
            lastUserAddress,
            new bytes[](0)
        );


        emit VerificationCompleted(output, userData , country );
    }

    function setConfigId(bytes32 configId) external {
        verificationConfigId = configId;
    }

    function getConfigId(
        bytes32, /* destinationChainId */
        bytes32, /* userIdentifier */
        bytes memory /* userDefinedData */
    )
        public
        view
        override
        returns (bytes32)
    {
        return verificationConfigId;
    }


        /// @notice Checks if a given label is available for registration
    /// @dev Uses try-catch to handle the ERC721NonexistentToken error
    /// @param label The label to check availability for
    /// @return available True if the label can be registered, false if already taken
    function available(string calldata label , address _registry) external view returns (bool) {
        bytes32 node = _labelToNode(label, _registry);
        uint256 tokenId = uint256(node);
        IL2Registry registry = IL2Registry(_registry);
        try registry.ownerOf(tokenId) {
            return false;
        } catch {
            return true;
        }
    }

    function _labelToNode(
        string memory label,
        address _registryAddress
    ) private view returns (bytes32) {
        IL2Registry _registry = IL2Registry(_registryAddress);
        return _registry.makeNode(_registry.baseNode(), label);
    }

  function _setRegistry(string memory country, address _registryAddress) external {
    require(_registryAddress != address(0), "Invalid registry address"); 
    require(bytes(country).length > 0, "Country cannot be empty");
    registryAddress[country] = _registryAddress;
}

function getRegistryAddress(string memory country) external view returns (address) {
    return registryAddress[country];
}

/**
 * @notice Sets a text record for a verified user's ENS name
 * @param country The country code for the registry
 * @param label The ENS label/name
 * @param key The text record key (e.g., "email", "url", "description")
 * @param value The text record value
 */
function setTextRecord(
    string memory country,
    string memory label,
    string memory key,
    string memory value
) external {
    address registryAddr = registryAddress[country];
    require(registryAddr != address(0), "No registry set for this country");
    
    IL2Registry registry = IL2Registry(registryAddr);
    bytes32 node = _labelToNode(label, registryAddr);
    
    // Verify that the caller owns this ENS name
    uint256 tokenId = uint256(node);
    require(registry.ownerOf(tokenId) == msg.sender, "Not the owner of this ENS name");
    
    // Set the text record
    registry.setText(node, key, value);
}

/**
 * @notice Sets multiple text records for a verified user's ENS name in a single transaction
 * @param country The country code for the registry
 * @param label The ENS label/name
 * @param keys Array of text record keys
 * @param values Array of text record values (must match keys array length)
 */
function setMultipleTextRecords(
    string memory country,
    string memory label,
    string[] memory keys,
    string[] memory values
) external {
    require(keys.length == values.length, "Keys and values arrays must have the same length");
    
    address registryAddr = registryAddress[country];
    require(registryAddr != address(0), "No registry set for this country");
    
    IL2Registry registry = IL2Registry(registryAddr);
    bytes32 node = _labelToNode(label, registryAddr);
    
    // Verify that the caller owns this ENS name
    uint256 tokenId = uint256(node);
    require(registry.ownerOf(tokenId) == msg.sender, "Not the owner of this ENS name");
    
    // Set all text records
    for (uint256 i = 0; i < keys.length; i++) {
        registry.setText(node, keys[i], values[i]);
    }
}
}
