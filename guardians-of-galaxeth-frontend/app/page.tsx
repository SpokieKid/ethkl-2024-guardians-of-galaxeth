'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Login from '../components/login';
import GameBoard from '../components/game-board';
import { useSearchParams } from 'next/navigation';
import { getContract } from '../utils/contracts';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const searchParams = useSearchParams();
  const gameStage = searchParams.get('stage') || 'collect';
  const [pendingMinerals, setPendingMinerals] = useState(0);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [communityMembers, setCommunityMembers] = useState([]);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const [isJoined, setIsJoined] = useState(false);

  const handleJoinGame = async () => {
    if (contract) {
      try {
        const tx = await contract.joinGame({ value: ethers.utils.parseEther("0.00001") });
        await tx.wait();
        setIsJoined(true);
      } catch (error) {
        console.error("Error joining game:", error);
      }
    }
  };

  useEffect(() => {
    const initContract = async () => {
      const guardianContract = await getContract();
      setContract(guardianContract);
    };
    initContract();
  }, []);

  useEffect(() => {
    console.log('isLoggedIn changed:', isLoggedIn);
    console.log('userIdentifier:', userIdentifier);
  }, [isLoggedIn, userIdentifier]);

  const handleLoginSuccess = (worldIdHash: string, walletAddress: string) => {
    console.log('Login success, World ID hash:', worldIdHash);
    console.log('Login success, wallet address:', walletAddress);
    setIsLoggedIn(true);
    setUserIdentifier(walletAddress);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : !isJoined ? (
        <div>
          <p>Welcome! To start playing, you need to join the game by staking 0.00001 ETH.</p>
          <button onClick={handleJoinGame} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Join Game
          </button>
        </div>
      ) : (
        <GameBoard 
          userIdentifier={userIdentifier} 
          initialStage={gameStage} 
          contract={contract}
          pendingMinerals={pendingMinerals}
          setPendingMinerals={setPendingMinerals}
        />
      )}
    </div>
  );
}