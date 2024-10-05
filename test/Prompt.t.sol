// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2, Vm} from "forge-std/Test.sol";
import {Prompt} from "../src/Prompt.sol";
import {IAIOracle} from "OAO/contracts/interfaces/IAIOracle.sol";
import {OraSepoliaAddresses} from "./OraSepoliaAddresses.t.sol";
import "forge-std/console.sol";

/**
 *  TEST SCENARIOS
 * 1. test the setup (check aiOracle, owner, gasLimits)
 * 2. test the gas limit setting
    - revert if not owner
    - check the state change after the update
 * 3. test OAO request
    - check if PromptRequest is emitted
    - check the event data
    - check state updates (access the requests variable and check values)
 * 4. check if aiOracleCallback is called
    - need to wait few blocks for the OPML to finish computation
    - mock the output and call method directly
    - impersonate the caller and check the modifier (only OAO should be able to call)
 * 5. do all the tests on all the supported models
*/

contract PromptTest is Test, OraSepoliaAddresses {
    event promptRequest(
        uint256 requestId,
        address sender, 
        uint256 modelId,
        string prompt
    );

    event promptsUpdated(
        uint256 requestId,
        uint256 modelId,
        string input,
        string output,
        bytes callbackData
    );

    Prompt prompt;
    string rpc;
    uint256 forkId;

    function setUp() public {
        rpc = vm.envString("RPC_URL");
        forkId = vm.createSelectFork(rpc);
        prompt = new Prompt(IAIOracle(OAO_PROXY));
    }

    function test_SetUp() public {
        assertNotEq(address(prompt), address(0));
        assertEq(prompt.owner(), address(this));
        assertEq(address(prompt.aiOracle()), OAO_PROXY);
        assertEq(prompt.callbackGasLimit(STABLE_DIFFUSION_ID), 500_000);
        assertEq(prompt.callbackGasLimit(LLAMA_ID), 5_000_000);
    }

    function test_CallbackGasLimit() public {
        vm.startPrank(address(123));
        vm.expectRevert("Only owner");
        prompt.setCallbackGasLimit(11, 3_000_000);
        vm.stopPrank();

        prompt.setCallbackGasLimit(50, 3_000_000);
        assertEq(prompt.callbackGasLimit(50), 3_000_000);

        prompt.setCallbackGasLimit(11, 3_000_000);
        assertEq(prompt.callbackGasLimit(11), 3_000_000);
    }

    function test_OAOInteraction() public {
        vm.expectRevert("insufficient fee");
        prompt.calculateAIResult(11, "What is a good use case for on-chain AI?");

        vm.expectEmit(false, false, false, false);
        emit promptRequest(3847, address(this), 11,  "What is a good use case for on-chain AI?");
        uint256 requestId = prompt.calculateAIResult{value: prompt.estimateFee(11)}(11, "What is a good use case for on-chain AI?");
        
        (address sender, uint256 modelId, bytes memory prompt_value, bytes memory output) = prompt.requests(requestId);
        assertEq(modelId, 11);
        assertEq(sender, address(this));
        assertEq(prompt_value, "What is a good use case for on-chain AI?");
        assertEq(string(output), "");
    }

    function test_OAOCallback() public {
        vm.expectRevert(); //UnauthorizedCallbackSource
        prompt.aiOracleCallback(3847, "test", "");

        uint256 requestId = prompt.calculateAIResult{value: prompt.estimateFee(11)}(11, "What is a good use case for on-chain AI?");

        vm.startPrank(OAO_PROXY);
        prompt.aiOracleCallback(requestId, "test", "");
        vm.stopPrank();
    }
}
