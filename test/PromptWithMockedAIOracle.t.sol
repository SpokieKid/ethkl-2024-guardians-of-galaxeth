// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2, Vm} from "forge-std/Test.sol";
import {PromptWithCallbackData} from "../src/PromptWithCallbackData.sol";
import {IAIOracle} from "OAO/contracts/interfaces/IAIOracle.sol";
import {MockOAO} from "../src/test/MockOAO.sol";
import {OraSepoliaAddresses} from "./OraSepoliaAddresses.t.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
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

contract PromptWithMockedAIOracleTest is Test, OraSepoliaAddresses, IERC721Receiver {
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

    MockOAO aiOracle;
    PromptWithCallbackData prompt;
    string rpc;
    uint256 forkId;

    ///@notice implementing this method to be able to receive ERC721 token
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4){
        return IERC721Receiver.onERC721Received.selector;
    }

    function setUp() public {
        rpc = vm.envString("RPC_URL");
        forkId = vm.createSelectFork(rpc);
        aiOracle = new MockOAO();
        prompt = new PromptWithCallbackData(IAIOracle(address(aiOracle)));
    }

    function test_SetUp() public {
        assertNotEq(address(prompt), address(0));
        assertEq(prompt.owner(), address(this));
        assertEq(address(prompt.aiOracle()), address(aiOracle));
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
        // prompt.calculateAIResult(STABLE_DIFFUSION_ID, SD_PROMPT);

        vm.expectEmit(false, false, false, false);
        emit promptRequest(3847, address(this), STABLE_DIFFUSION_ID, SD_PROMPT);
        (uint256 requestId,) = prompt.calculateAIResult{value: prompt.estimateFee(STABLE_DIFFUSION_ID)}(STABLE_DIFFUSION_ID, SD_PROMPT);
        // aiOracle.invokeCallback(requestId, bytes("test"));

        (address sender, uint256 modelId, bytes memory prompt_value, bytes memory output) = prompt.requests(requestId);
        assertEq(modelId, STABLE_DIFFUSION_ID);
        assertEq(sender, address(this));
        assertEq(string(prompt_value), SD_PROMPT);
        assertEq(string(output), "");
    }

    function test_OAOCallback() public {
        vm.expectRevert(); //UnauthorizedCallbackSource
        prompt.aiOracleCallback(3847, "test", "");

        (uint256 requestId, uint256 tokenId) = prompt.calculateAIResult{value: prompt.estimateFee(STABLE_DIFFUSION_ID)}(STABLE_DIFFUSION_ID, SD_PROMPT);
        
        aiOracle.invokeCallback(requestId, "test_output");

        //check the token metadata
        (string memory image, ) = prompt.metadataStorage(requestId);
        assertEq(image, "test_output");
    }

    /// @notice Tests the behaviour of the callback after the update of the on-chain result.
    /// @dev After the challenge period if the result is updated, the callback will be called.
    function test_CallbackAfterUpdate() public {
        (uint256 requestId, uint256 tokenId) = prompt.calculateAIResult{value: prompt.estimateFee(STABLE_DIFFUSION_ID)}(STABLE_DIFFUSION_ID, SD_PROMPT);
        aiOracle.invokeCallback(requestId, "test_output");

        (string memory image, ) = prompt.metadataStorage(tokenId);
        assertEq(image, "test_output");

        aiOracle.invokeCallback(requestId, "result_updated");
        (image, ) = prompt.metadataStorage(requestId);
        assertEq(image, "result_updated");
    }
}
