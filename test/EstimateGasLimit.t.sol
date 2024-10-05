// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2, Vm} from "forge-std/Test.sol";
import {Prompt} from "../src/Prompt.sol";
import {IAIOracle} from "OAO/contracts/interfaces/IAIOracle.sol";
import {OraSepoliaAddresses} from "./OraSepoliaAddresses.t.sol";
import "forge-std/console.sol";

contract EstimateGasLimitTest is Test, OraSepoliaAddresses {
    Prompt prompt;
    string rpc;
    uint256 forkId;
    uint256 modelId;
    string result;

    function setUp() public {
        rpc = vm.envString("RPC_URL");
        forkId = vm.createSelectFork(rpc);
        prompt = new Prompt(IAIOracle(OAO_PROXY));
        modelId = 50;
        result = "Qmd3xWJVRao8AfgRTuXLCWBYj6VdVV8HFuKygk9FLTW5bi";
    }

    function test_estimateGasLimit() public {
        uint256 requestId = prompt.calculateAIResult{value: prompt.estimateFee(modelId)}(modelId, "test generation");
        uint256 before = gasleft();
        vm.prank(OAO_PROXY);
        prompt.aiOracleCallback(requestId, bytes(result), "");
        uint256 afterCall = gasleft();
        console.log(before - afterCall);
    }
}
