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
  pendingGETH: number;
  setPendingGETH: (value: number | ((prevValue: number) => number)) => void;
}

export default function GameBoard({ userIdentifier, initialStage, contract, pendingGETH, setPendingGETH }: GameBoardProps) {
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
          console.log("Player info from contract:", playerInfo);
          setStakeValue(parseFloat(ethers.utils.formatEther(playerInfo.stakedAmount)));
          setReputation(playerInfo.reputation.toNumber());
          setGethBalance(playerInfo.gethBalance.toNumber());
          setPendingGETH(playerInfo.pendingGETH.toNumber());
          console.log("Updated state:", {
            stakeValue: parseFloat(ethers.utils.formatEther(playerInfo.stakedAmount)),
            reputation: playerInfo.reputation.toNumber(),
            gethBalance: playerInfo.gethBalance.toNumber(),
            pendingGETH: playerInfo.pendingGETH.toNumber()
          });
        } catch (error) {
          console.error("Error fetching player info:", error);
        }
      }
    };
    fetchPlayerInfo();
  }, [contract, userIdentifier, setPendingGETH]);

  const handleStageChange = (newStage: string) => {
    setStage(newStage);
    router.push(`?stage=${newStage}`);
  };

  const handleCollectGETH = async () => {
    if (contract && pendingGETH > 0) {
      try {
        console.log("Before collection - GETH Balance:", gethBalance, "Pending GETH:", pendingGETH);
        const tx = await contract.collectGETH();
        await tx.wait();
        
        // 立即更新前端状态
        setGethBalance(prevBalance => {
          const newBalance = prevBalance + pendingGETH;
          console.log("After collection (frontend) - New GETH Balance:", newBalance);
          return newBalance;
        });
        setPendingGETH(0);

        // 添加小延迟后再次获取最新的链上数据
        setTimeout(async () => {
          const playerInfo = await contract.players(userIdentifier);
          console.log("After collection (blockchain) - GETH Balance:", playerInfo.gethBalance.toNumber(), "Pending GETH:", playerInfo.pendingGETH.toNumber());
          setGethBalance(playerInfo.gethBalance.toNumber());
          setPendingGETH(playerInfo.pendingGETH.toNumber());
        }, 2000); // 2秒延迟

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

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex justify-between p-4 bg-gray-800">
        <div>
          <p className="text-lg">Staking Power: {stakeValue} ETH</p>
          <p className="text-lg">Reputation: {reputation}</p>
          <p className="text-lg">GETH Balance: {gethBalance}</p>
          <p className="text-lg">Pending GETH: {pendingGETH}</p>
          <button onClick={handleCollectGETH} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mt-2">
            Collect GETH
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
            pendingGETH={pendingGETH}
            setPendingGETH={setPendingGETH}
            gethBalance={gethBalance}
            setGethBalance={setGethBalance}
          />
        )}
        {stage === 'alliance' && <Alliance userIdentifier={userIdentifier} contract={contract} />}
        {stage === 'fight' && (
          <Fight 
            userIdentifier={userIdentifier} 
            contract={contract} 
            gethBalance={gethBalance}
            updateGethBalance={updateGethBalance}
          />
        )}
      </div>
    </div>
  );
}