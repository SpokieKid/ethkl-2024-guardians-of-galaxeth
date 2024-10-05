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
    <div className="flex flex-col h-screen">
      <div className="flex justify-between p-4">
        <div>
          <p>Staking Power: {stakeValue} ETH</p>
          <p>Reputation: {reputation}</p>
        </div>
        <div>
          <button onClick={() => handleStageChange('collect')}>Collect</button>
          <button onClick={() => handleStageChange('alliance')}>Alliance</button>
          <button onClick={() => handleStageChange('fight')}>Fight</button>
        </div>
      </div>
      <div className="flex-grow">
        {stage === 'collect' && <Collect address={address} contract={contract} />}
        {stage === 'alliance' && <Alliance address={address} contract={contract} />}
        {stage === 'fight' && <Fight address={address} contract={contract} />}
      </div>
    </div>
  );
}