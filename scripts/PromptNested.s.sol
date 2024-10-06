// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {PromptNestedInference} from "../src/PromptNestedInference.sol";
import {OraSepoliaAddresses} from "../test/OraSepoliaAddresses.t.sol";
import {IAIOracle} from "OAO/contracts/interfaces/IAIOracle.sol";

contract PromptScript is Script, OraSepoliaAddresses {
    function setUp() public {
        // testnet sepolia address
        OAO_PROXY = address(0x0A0f4321214BB6C7811dD8a71cF587bdaF03f0A0);
    }

    function run() public {
        uint privateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(privateKey);
        new PromptNestedInference(IAIOracle(OAO_PROXY));
        vm.stopBroadcast();
    }
}
