// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2, Vm} from "forge-std/Test.sol";
import {PromptNestedInference} from "../src/PromptNestedInference.sol";
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
 * 5. check the nested inference
    - pass the fee for the second inference to the callback
    - check that the result is non-zero value
*/

contract PromptNestedInferenceTest is Test, OraSepoliaAddresses {
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

    PromptNestedInference prompt;
    string rpc;
    uint256 forkId;

    function setUp() public {
        rpc = vm.envString("RPC_URL");
        forkId = vm.createSelectFork(rpc);
        prompt = new PromptNestedInference(IAIOracle(OAO_PROXY));
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
        // vm.expectRevert("insufficient fee");
        // prompt.calculateAIResult(STABLE_DIFFUSION_ID, LLAMA_ID, SD_PROMPT);

        uint256 stableDiffusionFee = prompt.estimateFee(STABLE_DIFFUSION_ID);
        uint256 llamaFee = prompt.estimateFee(LLAMA_ID);

        vm.expectEmit(false, false, false, false);
        emit promptRequest(3847, address(this), STABLE_DIFFUSION_ID, SD_PROMPT);
        uint256 requestId = prompt.calculateAIResult{value: ((stableDiffusionFee + llamaFee)*11/10)}(STABLE_DIFFUSION_ID, LLAMA_ID, SD_PROMPT);
        
        (address sender, uint256 modelId, bytes memory prompt_value, bytes memory output) = prompt.requests(requestId);
        assertEq(modelId, STABLE_DIFFUSION_ID);
        assertEq(sender, address(this));
        assertEq(string(prompt_value), SD_PROMPT);
        assertEq(string(output), "");
    }

    function test_OAOCallback() public {
        vm.expectRevert(); //UnauthorizedCallbackSource
        prompt.aiOracleCallback(3847, "test", "");

        uint256 stableDiffusionFee = prompt.estimateFee(STABLE_DIFFUSION_ID);
        uint256 llamaFee = prompt.estimateFee(LLAMA_ID);

        uint256 requestId = prompt.calculateAIResult{value: (stableDiffusionFee + llamaFee)}(LLAMA_ID, STABLE_DIFFUSION_ID, LLAMA_PROMPT);

        vm.startPrank(OAO_PROXY);
        prompt.aiOracleCallback{value: ((stableDiffusionFee + llamaFee)*11/10)}(requestId, "test", abi.encode(STABLE_DIFFUSION_ID, address(prompt)));
        vm.stopPrank();

        (,,,bytes memory output) = prompt.requests(requestId);
        assertNotEq(output, "");
    }
}
