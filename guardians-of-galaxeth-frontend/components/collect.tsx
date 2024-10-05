'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface CollectProps {
  userIdentifier: string;
  contract: ethers.Contract | null;
  pendingMinerals: number;
  setPendingMinerals: (value: number) => void;
}

export default function Collect({ userIdentifier, contract, pendingMinerals, setPendingMinerals }: CollectProps) {
  const [spaceshipPosition, setSpaceshipPosition] = useState({ x: 0, y: 0 });
  const [minerals, setMinerals] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    // 生成随机矿物
    const generateMinerals = () => {
      const newMinerals = [];
      for (let i = 0; i < 5; i++) {
        newMinerals.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        });
      }
      setMinerals(newMinerals);
    };

    generateMinerals();
    const interval = setInterval(generateMinerals, 10000); // 每10秒生成新的矿物

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      setSpaceshipPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;
        switch (e.key) {
          case 'ArrowUp': newY = Math.max(0, prev.y - 10); break;
          case 'ArrowDown': newY = Math.min(window.innerHeight, prev.y + 10); break;
          case 'ArrowLeft': newX = Math.max(0, prev.x - 10); break;
          case 'ArrowRight': newX = Math.min(window.innerWidth, prev.x + 10); break;
        }
        return { x: newX, y: newY };
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    // 检查是否收集到矿物
    const collectMinerals = () => {
      const collectedMinerals = minerals.filter(mineral => 
        Math.abs(mineral.x - spaceshipPosition.x) < 20 && 
        Math.abs(mineral.y - spaceshipPosition.y) < 20
      );
      if (collectedMinerals.length > 0) {
        setPendingMinerals(prev => prev + collectedMinerals.length);
        setMinerals(prev => prev.filter(mineral => !collectedMinerals.includes(mineral)));
      }
    };

    collectMinerals();
  }, [spaceshipPosition, minerals, setPendingMinerals]);

  const handleCollectMinerals = async () => {
    if (contract) {
      try {
        const tx = await contract.collectMinerals();
        await tx.wait();
        setPendingMinerals(0);
      } catch (error) {
        console.error("Error collecting minerals:", error);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      {minerals.map((mineral, index) => (
        <div 
          key={index} 
          className="absolute w-4 h-4 bg-yellow-400 rounded-full"
          style={{ left: mineral.x, top: mineral.y }}
        />
      ))}
      <div 
        className="absolute w-10 h-10 bg-blue-500"
        style={{ left: spaceshipPosition.x, top: spaceshipPosition.y }}
      />
    </div>
  );
}