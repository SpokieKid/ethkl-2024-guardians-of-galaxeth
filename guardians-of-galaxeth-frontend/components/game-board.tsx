'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Collect from './collect';
import Alliance from './alliance';
import Fight from './fight';
import { useRouter } from 'next/navigation';
import { getContract } from '../utils/contracts';

interface GameBoardProps {
  address: string;
  initialStage: string;
}

export default function GameBoard({ address, initialStage }: GameBoardProps) {
  const [stage, setStage] = useState(initialStage);
  const [stakeValue, setStakeValue] = useState(0);
  const [reputation, setReputation] = useState(0);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initContract = async () => {
      const guardianContract = await getContract();
      setContract(guardianContract);
    };
    initContract();
  }, []);

  useEffect(() => {
    const fetchPlayerInfo = async () => {
      if (contract && address) {
        try {
          const playerInfo = await contract.players(address);
          setStakeValue(ethers.utils.formatEther(playerInfo.stakedAmount));
          setReputation(playerInfo.reputation.toNumber());
        } catch (error) {
          console.error("Error fetching player info:", error);
        }
      }
    };
    fetchPlayerInfo();
  }, [contract, address]);

  const handleStageChange = (newStage: string) => {
    setStage(newStage);
    router.push(`?stage=${newStage}`);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex justify-between p-4 bg-gray-800">
        <div>
          <p className="text-lg">Staking Power: {stakeValue} ETH</p>
          <p className="text-lg">Reputation: {reputation}</p>
        </div>
        <div className="space-x-4">
          <button onClick={() => handleStageChange('collect')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Collect</button>
          <button onClick={() => handleStageChange('alliance')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Alliance</button>
          <button onClick={() => handleStageChange('fight')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Fight</button>
        </div>
      </div>
      <div className="flex-grow p-4">
        {stage === 'collect' && <Collect address={address} contract={contract} />}
        {stage === 'alliance' && <Alliance address={address} contract={contract} />}
        {stage === 'fight' && <Fight address={address} contract={contract} />}
      </div>
    </div>
  );
}