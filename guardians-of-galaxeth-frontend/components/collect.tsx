'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Spaceship from './Spaceship';

interface CollectProps {
  userIdentifier: string;
  contract: ethers.Contract | null;
  pendingGETH: number;
  setPendingGETH: (value: number | ((prevValue: number) => number)) => void;
  gethBalance: number;
  setGethBalance: (value: number) => void;
}

export default function Collect({ 
  userIdentifier,
  contract,
  pendingGETH,
  setPendingGETH,
  gethBalance,
  setGethBalance
}: CollectProps) {
  const [spaceshipPosition, setSpaceshipPosition] = useState({ x: 0, y: 0 });
  const [geth, setGETH] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const generateGETH = () => {
      const newGETH = [];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const radius = Math.min(window.innerWidth, window.innerHeight) / 4;

      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const r = Math.sqrt(Math.random()) * radius;
        newGETH.push({
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle),
        });
      }
      setGETH(newGETH);
    };

    generateGETH();
    const interval = setInterval(generateGETH, 15000); // Generate new GETH every 15 seconds

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
    const collectGETH = () => {
      const collectedGETHCount = geth.filter(geth => 
        Math.abs(geth.x - spaceshipPosition.x) < 20 && 
        Math.abs(geth.y - spaceshipPosition.y) < 20
      ).length;
      if (collectedGETHCount > 0) {
        setPendingGETH(prevPendingGETH => prevPendingGETH + collectedGETHCount);
        setGETH(prev => prev.filter(geth => 
          !(Math.abs(geth.x - spaceshipPosition.x) < 20 && 
            Math.abs(geth.y - spaceshipPosition.y) < 20)
        ));
        
        // 如果有合约，调用 addPendingGETH 函数
        if (contract) {
          contract.addPendingGETH(userIdentifier, collectedGETHCount)
            .then(() => console.log("Pending GETH added to contract"))
            .catch(error => console.error("Error adding pending GETH:", error));
        }
      }
    };

    collectGETH();
  }, [spaceshipPosition, geth, setPendingGETH, contract, userIdentifier]);

  return (
    <div className="relative w-full h-full">
      {geth.map((geth, index) => (
        <div 
          key={index} 
          className="absolute w-4 h-4 bg-yellow-400 rounded-full"
          style={{ left: geth.x, top: geth.y }}
        />
      ))}
      <Spaceship position={spaceshipPosition} />
    </div>
  );
}