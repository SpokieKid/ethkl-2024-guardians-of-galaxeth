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

  const handleLoginSuccess = (identifier: string) => {
    console.log('Login success, identifier:', identifier);
    setIsLoggedIn(true);
    setUserIdentifier(identifier);
  };

  return (
    <div className="min-h-screen bg-deep-space-blue text-neon-yellow">
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <GameBoard userIdentifier={userIdentifier} initialStage={gameStage} contract={contract} />
      )}
    </div>
  );
}