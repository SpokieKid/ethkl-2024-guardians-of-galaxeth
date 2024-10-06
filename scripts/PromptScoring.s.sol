// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {PromptScoring} from "../src/PromptScoring.sol";
import {OraSepoliaAddresses} from "../test/OraSepoliaAddresses.t.sol";
import {IAIOracle} from "OAO/contracts/interfaces/IAIOracle.sol";

contract PromptScoringScript is Script, OraSepoliaAddresses {
    function setUp() public {}

    function run() public {
        uint privateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(privateKey);
        new PromptScoring(IAIOracle(OAO_PROXY));
        vm.stopBroadcast();
    }
}
