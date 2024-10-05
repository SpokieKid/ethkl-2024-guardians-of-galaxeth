'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Collect from './collect';
import Alliance from './alliance';
import Fight from './fight';
import { useRouter } from 'next/navigation';

interface GameBoardProps {
  userIdentifier: string;
  initialStage: string;
  contract: ethers.Contract | null;
  pendingMinerals: number;
  setPendingMinerals: (value: number) => void;
}

export default function GameBoard({ userIdentifier, initialStage, contract, pendingMinerals, setPendingMinerals }: GameBoardProps) {
  const [stage, setStage] = useState(initialStage);
  const [stakeValue, setStakeValue] = useState(0);
  const [reputation, setReputation] = useState(0);
  const [gethBalance, setGethBalance] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchPlayerInfo = async () => {
      if (contract && userIdentifier) {
        try {
          const playerInfo = await contract.players(userIdentifier);
          setStakeValue(ethers.utils.formatEther(playerInfo.stakedAmount));
          setReputation(playerInfo.reputation.toNumber());
          const balance = await contract.getMinerals(userIdentifier);
          setGethBalance(ethers.utils.formatEther(balance));
          // 移除 setPendingMinerals(pending.toNumber());
        } catch (error) {
          console.error("Error fetching player info:", error);
        }
      }
    };
    fetchPlayerInfo();
  }, [contract, userIdentifier]);

  const handleStageChange = (newStage: string) => {
    setStage(newStage);
    router.push(`?stage=${newStage}`);
  };

  const handleCollectMinerals = async () => {
    if (contract) {
      try {
        const tx = await contract.collectMinerals();
        await tx.wait();
        setPendingMinerals(0);
        // 更新 GETH 余额
        const newBalance = await contract.getMinerals(userIdentifier);
        setGethBalance(ethers.utils.formatEther(newBalance));
      } catch (error) {
        console.error("Error collecting minerals:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex justify-between p-4 bg-gray-800">
        <div>
          <p className="text-lg">Staking Power: {stakeValue} ETH</p>
          <p className="text-lg">Reputation: {reputation}</p>
          <p className="text-lg">GETH Balance: {gethBalance}</p>
          <p className="text-lg">Pending Minerals: {pendingMinerals}</p>
          <button onClick={handleCollectMinerals} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
            Collect Minerals
          </button>
        </div>
        <div className="space-x-4">
          <button onClick={() => handleStageChange('collect')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Collect</button>
          <button onClick={() => handleStageChange('alliance')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Alliance</button>
          <button onClick={() => handleStageChange('fight')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Fight</button>
        </div>
      </div>
      <div className="flex-grow p-4">
        {stage === 'collect' && (
          <Collect 
            userIdentifier={userIdentifier} 
            contract={contract} 
            pendingMinerals={pendingMinerals}
            setPendingMinerals={setPendingMinerals}
          />
        )}
        {stage === 'alliance' && <Alliance userIdentifier={userIdentifier} contract={contract} />}
        {stage === 'fight' && <Fight userIdentifier={userIdentifier} contract={contract} />}
      </div>
    </div>
  );
}