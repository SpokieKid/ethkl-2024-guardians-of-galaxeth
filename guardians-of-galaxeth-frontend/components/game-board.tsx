'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Collect from './collect';
import Alliance from './alliance';
import Fight from './fight';
import MolochBattle from './MolochBattle';

// Define the Artifact interface
interface Artifact {
  id: number;
  name: string;
  power: number;
  description: string;
}

const PRESET_ARTIFACTS: Artifact[] = [
  { 
    id: 0, 
    name: "ZK Shield Protocol", 
    power: 200, 
    description: "Protect privacy using zero-knowledge proofs, preventing Moloch from exploiting sensitive information." 
  },
  { 
    id: 1, 
    name: "Satoshi's Wisdom Scroll", 
    power: 180, 
    description: "Strengthen the consensus mechanism to block Moloch's attack on the network's consensus algorithm." 
  },
  { 
    id: 2, 
    name: "Moodeng's Cute Emojis", 
    power: 150, 
    description: "Distract Moloch with a barrage of cute emojis and memes, causing confusion and preventing it from focusing on the network's vulnerability." 
  }
];

interface GameBoardProps {
  userIdentifier: string;
  initialStage: string;
  contract: ethers.Contract | null;
  pendingGETH: number;
  setPendingGETH: (value: number | ((prevValue: number) => number)) => void;
}

export default function GameBoard({ userIdentifier, initialStage, contract, pendingGETH, setPendingGETH }: GameBoardProps) {
  const [stage, setStage] = useState(initialStage);
  const [stakeValue, setStakeValue] = useState(0);
  const [reputation, setReputation] = useState(0);
  const [gethBalance, setGethBalance] = useState(0);
  const [allies, setAllies] = useState<string[]>([]);
  const [artifacts] = useState<Artifact[]>(PRESET_ARTIFACTS);

  useEffect(() => {
    const fetchPlayerInfo = async () => {
      if (contract && userIdentifier) {
        try {
          const playerInfo = await contract.players(userIdentifier);
          setStakeValue(parseFloat(ethers.utils.formatEther(playerInfo.stakedAmount)));
          setReputation(playerInfo.reputation.toNumber());
          setGethBalance(playerInfo.gethBalance.toNumber());
          setPendingGETH(playerInfo.pendingGETH.toNumber());
        } catch (error) {
          console.error("Error fetching player info:", error);
        }
      }
    };
    fetchPlayerInfo();
  }, [contract, userIdentifier, setPendingGETH]);

  useEffect(() => {
    const fetchAllies = async () => {
      if (contract && userIdentifier) {
        try {
          const allyCount = await contract.getAllyCount(userIdentifier);
          const alliesData = [];
          for (let i = 0; i < allyCount.toNumber(); i++) {
            const ally = await contract.getAlly(userIdentifier, i);
            alliesData.push(ally);
          }
          setAllies(alliesData);
        } catch (error) {
          console.error("Error fetching allies:", error);
        }
      }
    };
    fetchAllies();
  }, [contract, userIdentifier]);

  const handleStageChange = (newStage: string) => {
    setStage(newStage);
  };

  const handleCollectGETH = async () => {
    if (contract && pendingGETH > 0) {
      try {
        const tx = await contract.collectGETH();
        await tx.wait();
        
        setGethBalance(prevBalance => prevBalance + pendingGETH);
        setPendingGETH(0);

        setTimeout(async () => {
          const playerInfo = await contract.players(userIdentifier);
          setGethBalance(playerInfo.gethBalance.toNumber());
          setPendingGETH(playerInfo.pendingGETH.toNumber());
        }, 2000);

      } catch (error) {
        console.error("Error collecting GETH:", error);
      }
    }
  };

  const updateGethBalance = async () => {
    if (contract && userIdentifier) {
      try {
        const playerInfo = await contract.players(userIdentifier);
        setGethBalance(playerInfo.gethBalance.toNumber());
      } catch (error) {
        console.error("Error updating GETH balance:", error);
      }
    }
  };

  const handleSelectArtifact = (artifactId: number) => {
    console.log("Selected artifact:", artifactId);
  };

  const handleFightMoloch = async (molochId: number, artifactId: number) => {
    if (contract) {
      try {
        const tx = await contract.fightMoloch(molochId, artifactId);
        await tx.wait();
        alert("Moloch defeated successfully!");
        await updateGethBalance();
      } catch (error: any) {
        console.error("Error fighting Moloch:", error);
        alert(`Failed to fight Moloch: ${error.message}`);
      }
    }
  };

  return (
    <div className="w-full h-full bg-transparent relative">
      {/* 状态面板 */}
      <div className="absolute top-0 left-0 z-30 p-4 bg-gray-800 bg-opacity-75 text-white rounded-br-lg">
        <p>Staking Power: {stakeValue.toFixed(5)} ETH</p>
        <p>Reputation: {reputation}</p>
        <p>GETH Balance: {gethBalance}</p>
        <p>Pending GETH: {pendingGETH}</p>
        <button 
          onClick={handleCollectGETH} 
          className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          disabled={pendingGETH === 0}
        >
          Collect GETH
        </button>
      </div>

      {/* 游戏阶段切换按钮 */}
      <div className="absolute top-0 right-0 z-30 p-4 flex space-x-2">
        <button onClick={() => setStage('collect')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Collect</button>
        <button onClick={() => setStage('alliance')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Alliance</button>
        <button onClick={() => setStage('fight')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Fight</button>
      </div>

      {/* 游戏内容 */}
      <div className="w-full h-full">
        {stage === 'collect' && (
          <Collect 
            userIdentifier={userIdentifier} 
            contract={contract} 
            pendingGETH={pendingGETH}
            setPendingGETH={setPendingGETH}
            gethBalance={gethBalance}
            setGethBalance={setGethBalance}
            allies={allies}
          />
        )}
        {stage === 'alliance' && (
          <Alliance 
            userIdentifier={userIdentifier} 
            contract={contract} 
          />
        )}
        {stage === 'fight' && (
          <Fight 
            userIdentifier={userIdentifier} 
            contract={contract} 
            gethBalance={gethBalance}
            updateGethBalance={updateGethBalance}
            artifacts={artifacts}
          />
        )}
        {stage === 'moloch-battle' && (
          <MolochBattle
            userIdentifier={userIdentifier}
            communityPower={gethBalance}
            artifacts={artifacts}
            contract={contract}
            onSelectArtifact={handleSelectArtifact}
            onFightMoloch={handleFightMoloch}
          />
        )}
      </div>
    </div>
  );
}