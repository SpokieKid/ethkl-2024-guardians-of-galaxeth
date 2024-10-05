'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Login from '../components/Login';
import Spaceship from '../components/Spaceship';
import MineralCollection from '../components/MineralCollection';
import AllianceFormation from '../components/AllianceFormation';
import CommunityDashboard from '../components/CommunityDashboard';
import MolochBattle from '../components/MolochBattle';
import { getContract } from '../utils/contracts';

const joinGame = async (signer: ethers.Signer) => {
  const contract = getContract();
  const stakeAmount = ethers.utils.parseEther("0.00001");
  const tx = await contract.joinGame({ value: stakeAmount, gasLimit: 500000 });
  console.log("Transaction sent:", tx.hash);
  await tx.wait();
  console.log("Join game transaction confirmed");
  await updateGameState();
};

export default function Home() {
  const [isWorldIDVerified, setIsWorldIDVerified] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [spaceshipPosition, setSpaceshipPosition] = useState({ x: 0, y: 0 });
  const [minerals, setMinerals] = useState(0);
  const [communityId, setCommunityId] = useState('');
  const [communityMembers, setCommunityMembers] = useState([]);
  const [totalStake, setTotalStake] = useState(0);
  const [molochPower, setMolochPower] = useState(0);
  const [communityPower, setCommunityPower] = useState(0);
  const [artifacts, setArtifacts] = useState([]);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [mineralRate, setMineralRate] = useState(1); // 1 GETH per second

  const handleWorldIDVerification = () => {
    setIsWorldIDVerified(true);
  };

  const connectWalletAndJoinGame = async () => {
    if (!isWorldIDVerified) {
      alert("Please verify with WorldID first");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAddress(address);
      setIsWalletConnected(true);

      const contract = getContract();
      console.log("Checking if player is already in game...");
      const playerInfo = await contract.players(address);

      if (playerInfo.isActive) {
        console.log("Player already in game. Updating game state...");
        await updateGameState(address);
      } else {
        console.log("Player not in game. Joining...");
        const stakeAmount = prompt("Enter the amount of ETH you want to stake (minimum 0.00001 ETH):");
        if (!stakeAmount) return;

        const stakeAmountWei = ethers.utils.parseEther(stakeAmount);
        if (stakeAmountWei.lt(ethers.utils.parseEther("0.00001"))) {
          alert("Stake amount must be at least 0.00001 ETH");
          return;
        }

        const tx = await contract.joinGame({ value: stakeAmountWei, gasLimit: 500000 });
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("Join game transaction confirmed");
        await updateGameState(address);
      }
    } catch (error) {
      console.error("Failed to connect wallet or join game:", error);
      alert("Failed to connect wallet or join game. Please check the console for more details.");
    }
  };

  const handleLoginSuccess = async (address: string) => {
    if (isJoining) return;
    setIsJoining(true);
    setIsLoggedIn(true);
    setAddress(address);
    const contract = getContract();
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      console.log("Checking balance...");
      const balance = await provider.getBalance(address);
      console.log("ETH Balance:", ethers.utils.formatEther(balance));

      // 让用户入质押数量
      const stakeAmount = prompt("Enter the amount of ETH you want to stake (minimum 0.00001 ETH):");
      if (!stakeAmount) {
        setIsJoining(false);
        return;
      }

      const stakeAmountWei = ethers.utils.parseEther(stakeAmount);
      if (stakeAmountWei.lt(ethers.utils.parseEther("0.00001"))) {
        alert("Stake amount must be at least 0.00001 ETH");
        setIsJoining(false);
        return;
      }

      console.log("Joining game...");
      const joinTx = await contract.joinGame({ value: stakeAmountWei, gasLimit: 500000 });
      console.log("Transaction sent:", joinTx.hash);
      await joinTx.wait();
      console.log("Transaction confirmed");
      
      updateGameState();
    } catch (error) {
      console.error("Failed to join game:", error);
      if (error.data) {
        console.error("Error data:", error.data);
      }
      alert("Failed to join game. Please check the console for more details.");
    } finally {
      setIsJoining(false);
    }
  };

  const updateGameState = async (playerAddress?: string) => {
    const addressToUse = playerAddress || address;
    if (!addressToUse) {
      console.log("Address not set, skipping game state update");
      return;
    }

    const contract = getContract();
    try {
      const playerInfo = await contract.players(addressToUse);
      if (playerInfo.isActive) {
        const currentMinerals = await contract.getMinerals(addressToUse);
        setMinerals(currentMinerals.toNumber());
        setLastUpdateTime(Math.floor(Date.now() / 1000));
        const rate = await contract.MINERAL_RATE();
        setMineralRate(rate.toNumber() / 1e18); // Convert from wei to GETH
        // Add more state updates here as needed
      } else {
        console.log("Player not active in the game");
      }
    } catch (error) {
      console.error("Failed to update game state:", error);
      // Handle the error gracefully, perhaps set some default state
      setMinerals(0);
    }
  };

  const handleCollectMinerals = async () => {
    if (cooldownRemaining > 0) {
      alert(`You need to wait ${cooldownRemaining} seconds before collecting again.`);
      return;
    }

    const contract = getContract();
    try {
      await contract.collectMinerals();
      updateGameState(address);
    } catch (error) {
      console.error("Failed to collect minerals:", error);
      alert("Failed to collect minerals. Please try again.");
    }
  };

  const handleProposeAlliance = async (allyAddress: string) => {
    const contract = getContract();
    try {
      await contract.proposeAlliance(allyAddress);
      console.log(`Proposed alliance to ${allyAddress}`);
    } catch (error) {
      console.error("Failed to propose alliance:", error);
      alert("Failed to propose alliance. Please try again.");
    }
  };

  const handleAcceptAlliance = async (allyAddress: string) => {
    const contract = getContract();
    try {
      await contract.acceptAlliance(allyAddress);
      console.log(`Accepted alliance from ${allyAddress}`);
    } catch (error) {
      console.error("Failed to accept alliance:", error);
      alert("Failed to accept alliance. Please try again.");
    }
  };

  const handleStartVoting = async () => {
    const contract = getContract();
    try {
      await contract.startVoting(communityId);
      console.log('Started voting for community');
    } catch (error) {
      console.error("Failed to start voting:", error);
      alert("Failed to start voting. Please try again.");
    }
  };

  const handleSelectArtifact = async (artifactId: number) => {
    console.log(`Selected artifact: ${artifactId}`);
    // Implement artifact selection logic
  };

  const handleFightMoloch = async () => {
    const contract = getContract();
    try {
      await contract.fightMoloch(communityId);
      console.log('Fighting Moloch');
      updateGameState();
    } catch (error) {
      console.error("Failed to fight Moloch:", error);
      alert("Failed to fight Moloch. Please try again.");
    }
  };

  useEffect(() => {
    if (isLoggedIn && address) {
      updateGameState(address);
    }
  }, [isLoggedIn, address]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isLoggedIn) return;

      setSpaceshipPosition(prev => {
        switch (e.key) {
          case 'ArrowUp':
            return { ...prev, y: Math.max(0, prev.y - 10) };
          case 'ArrowDown':
            return { ...prev, y: Math.min(window.innerHeight - 50, prev.y + 10) };
          case 'ArrowLeft':
            return { ...prev, x: Math.max(0, prev.x - 10) };
          case 'ArrowRight':
            return { ...prev, x: Math.min(window.innerWidth - 50, prev.x + 10) };
          default:
            return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLoggedIn]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownRemaining > 0) {
      timer = setInterval(() => {
        setCooldownRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownRemaining]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoggedIn && address) {
      timer = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const elapsedTime = now - lastUpdateTime;
        setMinerals(prev => prev + elapsedTime * mineralRate);
        setLastUpdateTime(now);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoggedIn, address, lastUpdateTime, mineralRate]);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white p-4">
      {!isWorldIDVerified ? (
        <Login onVerificationSuccess={handleWorldIDVerification} />
      ) : !isWalletConnected ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl mb-4">WorldID Verified!</h2>
          <button
            onClick={connectWalletAndJoinGame}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Connect Wallet and Join Game
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-8">Guardians of GalaxETH</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
            <div className="space-y-8">
              <MineralCollection
                minerals={minerals}
                onCollect={handleCollectMinerals}
                cooldownRemaining={cooldownRemaining}
              />
              <AllianceFormation
                onProposeAlliance={handleProposeAlliance}
                onAcceptAlliance={handleAcceptAlliance}
              />
            </div>
            <div className="space-y-8">
              <CommunityDashboard
                communityId={communityId}
                members={communityMembers}
                totalStake={totalStake}
                onStartVoting={handleStartVoting}
              />
              <MolochBattle
                molochPower={molochPower}
                communityPower={communityPower}
                artifacts={artifacts}
                onSelectArtifact={handleSelectArtifact}
                onFightMoloch={handleFightMoloch}
              />
            </div>
          </div>
          <div className="mt-8 relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden">
            <Spaceship position={spaceshipPosition} />
          </div>
        </div>
      )}
    </div>
  );
}