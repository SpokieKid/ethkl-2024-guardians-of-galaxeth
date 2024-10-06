'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Login from '../components/login';
import GameBoard from '../components/game-board';
import { useSearchParams } from 'next/navigation';
import { getContract } from '../utils/contracts';
import Image from 'next/image';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const searchParams = useSearchParams();
  const gameStage = searchParams.get('stage') || 'collect';
  const [pendingGETH, setPendingGETH] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [isInCommunity, setIsInCommunity] = useState(false);

  useEffect(() => {
    const initContract = async () => {
      const guardianContract = await getContract();
      setContract(guardianContract);
    };
    initContract();
  }, []);

  useEffect(() => {
    const checkPlayerStatus = async () => {
      if (contract && userIdentifier) {
        try {
          const playerInfo = await contract.players(userIdentifier);
          setIsJoined(playerInfo.isActive);
          const inCommunity = await contract.isPlayerInCommunity(userIdentifier);
          setIsInCommunity(inCommunity);
        } catch (error) {
          console.error("Error checking player status:", error);
        }
      }
    };
    checkPlayerStatus();
  }, [contract, userIdentifier]);

  const handleLoginSuccess = (worldIdHash: string, walletAddress: string) => {
    setIsLoggedIn(true);
    setUserIdentifier(walletAddress); // 使用钱包地址
  };

  const handleJoinGame = async () => {
    if (contract && !isJoined) {
      try {
        const tx = await contract.joinGame({ value: ethers.utils.parseEther("0.00001") });
        await tx.wait();
        setIsJoined(true);
      } catch (error: any) {
        console.error("Error joining game:", error);
        // Check if the error is because the player is already in the game
        if (error.message.includes("Player already in game")) {
          console.log("Player is already in the game. Proceeding to game board.");
          setIsJoined(true);
        } else {
          alert("Failed to join the game. Please try again.");
        }
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-transparent">
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : !isJoined ? (
        <div className="text-center">
          <p className="mb-4">Welcome! To start playing, you need to join the game by staking 0.00001 ETH.</p>
          <button onClick={handleJoinGame} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Join Game
          </button>
        </div>
      ) : (
        <div className="w-full h-screen">
          <GameBoard 
            userIdentifier={userIdentifier} 
            initialStage={gameStage} 
            contract={contract}
            pendingGETH={pendingGETH}
            setPendingGETH={setPendingGETH}
            isInCommunity={isInCommunity}
          />
        </div>
      )}
    </div>
  );
}