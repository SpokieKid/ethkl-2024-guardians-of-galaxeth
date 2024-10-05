// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

abstract contract OraSepoliaAddresses {
    address internal OAO_PROXY = 0x0A0f4321214BB6C7811dD8a71cF587bdaF03f0A0;
    uint8 internal STABLE_DIFFUSION_ID = 50;
    uint8 internal LLAMA_ID = 11;
    string internal SD_PROMPT = "Generate image of bitcoin";
    string internal LLAMA_PROMPT = "What is a good use case for on-chain AI?";
}