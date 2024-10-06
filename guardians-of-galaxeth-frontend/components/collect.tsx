'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Spaceship from './Spaceship';
import Obstacle from './Obstacle';
import Image from 'next/image';
import gethIcon from '../public/geth-icon.png';
import spaceBackground from '../public/space-background.png'; // 导入背景图片

interface CollectProps {
  userIdentifier: string;
  contract: ethers.Contract | null;
  pendingGETH: number;
  setPendingGETH: (value: number | ((prevValue: number) => number)) => void;
  gethBalance: number;
  setGethBalance: (value: number) => void;
  allies?: string[];
}

export default function Collect({ 
  userIdentifier,
  contract,
  pendingGETH,
  setPendingGETH,
  gethBalance,
  setGethBalance,
  allies
}: CollectProps) {
  const [spaceshipPosition, setSpaceshipPosition] = useState({ x: 250, y: 250 });
  const [geth, setGETH] = useState<{ x: number; y: number }[]>([]);
  const [obstacles, setObstacles] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const generateGETH = () => {
      const newGETH = Array(5).fill(null).map(() => ({
        x: Math.random() * 500,
        y: Math.random() * 500
      }));
      setGETH(newGETH);
    };

    const generateObstacles = () => {
      const newObstacles = Array(3).fill(null).map(() => ({
        x: Math.random() * 500,
        y: Math.random() * 500
      }));
      setObstacles(newObstacles);
    };

    generateGETH();
    generateObstacles();

    const interval = setInterval(() => {
      generateGETH();
      generateObstacles();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      setSpaceshipPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;
        switch (e.key) {
          case 'ArrowUp': newY = Math.max(0, prev.y - 10); break;
          case 'ArrowDown': newY = Math.min(500, prev.y + 10); break;
          case 'ArrowLeft': newX = Math.max(0, prev.x - 10); break;
          case 'ArrowRight': newX = Math.min(500, prev.x + 10); break;
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
        
        if (contract) {
          contract.addPendingGETH(userIdentifier, collectedGETHCount)
            .then(() => console.log("Pending GETH added to contract"))
            .catch((error: Error) => console.error("Error adding pending GETH:", error));
        }
      }
    };

    collectGETH();
  }, [spaceshipPosition, geth, setPendingGETH, contract, userIdentifier]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image
        src={spaceBackground}
        alt="Space Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
      />
      <div className="relative z-10 w-full h-full">
        {geth.map((geth, index) => (
          <div 
            key={index} 
            className="absolute"
            style={{ left: geth.x, top: geth.y, transform: 'translate(-50%, -50%)' }}
          >
            <Image
              src={gethIcon}
              alt="GETH"
              width={32}
              height={32}
            />
          </div>
        ))}
        {obstacles.map((obstacle, index) => (
          <Obstacle key={`obstacle-${index}`} position={obstacle} />
        ))}
        <Spaceship position={spaceshipPosition} />
      </div>
    </div>
  );
}