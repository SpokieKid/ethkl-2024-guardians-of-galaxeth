'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Login from '../components/login';
import GameBoard from '../components/game-board';
import { useSearchParams } from 'next/navigation';
import { getContract } from '../utils/contracts';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [address, setAddress] = useState('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const searchParams = useSearchParams();
  const gameStage = searchParams.get('stage') || 'collect';

  useEffect(() => {
    const initContract = async () => {
      const guardianContract = await getContract();
      setContract(guardianContract);
    };
    initContract();
  }, []);

  const handleLoginSuccess = (playerAddress: string) => {
    setIsLoggedIn(true);
    setAddress(playerAddress);
    console.log("Login successful, address:", playerAddress);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <GameBoard address={address} initialStage={gameStage} contract={contract} />
      )}
    </div>
  );
}