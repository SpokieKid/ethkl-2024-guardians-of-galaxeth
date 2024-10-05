'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Spaceship from './Spaceship';

interface CollectProps {
  userIdentifier: string;
  contract: ethers.Contract | null;
}

export default function Collect({ userIdentifier, contract }: CollectProps) {
  const [spaceshipPosition, setSpaceshipPosition] = useState({ x: 0, y: 0 });
  const [minerals, setMinerals] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    const fetchPlayerInfo = async () => {
      if (contract && userIdentifier) {
        try {
          const playerInfo = await contract.players(userIdentifier);
          setMinerals(ethers.utils.formatEther(playerInfo.gethBalance));
          const lastCollectTime = playerInfo.lastCollectTime.toNumber();
          const currentTime = Math.floor(Date.now() / 1000);
          const cooldownTime = 60; // 假设冷却时间为60秒
          const remainingCooldown = Math.max(0, cooldownTime - (currentTime - lastCollectTime));
          setCooldownRemaining(remainingCooldown);
        } catch (error) {
          console.error("Error fetching player info:", error);
        }
      }
    };
    fetchPlayerInfo();

    const timer = setInterval(fetchPlayerInfo, 5000); // 每5秒更新一次
    return () => clearInterval(timer);
  }, [contract, userIdentifier]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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
  }, []);

  const handleCollectMinerals = async () => {
    if (cooldownRemaining > 0 || !contract) {
      return;
    }

    try {
      const tx = await contract.collectMinerals();
      await tx.wait();
      const playerInfo = await contract.players(userIdentifier);
      setMinerals(ethers.utils.formatEther(playerInfo.gethBalance));
      setCooldownRemaining(60); // 重置冷却时间
    } catch (error) {
      console.error("Error collecting minerals:", error);
      alert("Failed to collect minerals. Please try again.");
    }
  };

  return (
    <div className="relative w-full h-full bg-deep-space-blue">
      <div className="absolute top-4 left-4 text-neon-yellow">
        <p>Minerals: {minerals} GETH</p>
        <p>Cooldown: {cooldownRemaining}s</p>
      </div>
      <Spaceship position={spaceshipPosition} />
      <button
        onClick={handleCollectMinerals}
        className="absolute bottom-4 right-4 bg-neon-yellow text-deep-space-blue px-4 py-2 rounded"
        disabled={cooldownRemaining > 0}
      >
        Collect Minerals
      </button>
    </div>
  );
}