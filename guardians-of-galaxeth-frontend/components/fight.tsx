'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MolochBattle from './MolochBattle';
import Image from 'next/image';

interface FightProps {
  userIdentifier: string;
  contract: ethers.Contract | null;
  gethBalance: number;
  updateGethBalance: () => Promise<void>;
  artifacts: Artifact[]; // 添加这一行
}

interface Artifact {
  id: number;
  name: string;
  power: number;
  description: string;
}

export default function Fight({ userIdentifier, contract, gethBalance, updateGethBalance, artifacts }: FightProps) {
  const [communityPower, setCommunityPower] = useState(0);

  useEffect(() => {
    const fetchBattleInfo = async () => {
      if (contract && userIdentifier) {
        try {
          // Fetch community power (assuming it's equal to the player's GETH balance for simplicity)
          setCommunityPower(Number(gethBalance));
        } catch (error) {
          console.error("Error fetching battle info:", error);
          alert("Error fetching battle information. Please try again.");
        }
      }
    };
    fetchBattleInfo();
  }, [contract, userIdentifier, gethBalance]);

  const handleSelectArtifact = (artifactId: number) => {
    console.log("Selected artifact:", artifactId);
    // You can add more logic here if needed
  };

  const handleFightMoloch = async (molochId: number, artifactId: number) => {
    if (!contract) return;

    try {
      const tx = await contract.fightMoloch(molochId, artifactId);
      await tx.wait();
      alert("Battle completed! Check your updated balance and reputation.");
      await updateGethBalance();
    } catch (error) {
      console.error("Error fighting Moloch:", error);
      alert("Failed to fight Moloch. Please try again.");
    }
  };

  return (
    <div className="p-4 bg-deep-space-blue text-neon-yellow">
      <h2 className="text-2xl font-bold mb-4">Fight Moloch</h2>
      <p className="mb-2">Your GETH Balance: {gethBalance}</p>
      <div className="flex justify-center mb-4">
        <Image
          src="/moloch.png"
          alt="Moloch"
          width={100}
          height={100}
          className="pixelated moloch-animation"
        />
      </div>
      <MolochBattle
        userIdentifier={userIdentifier}
        communityPower={Number(communityPower)}
        artifacts={artifacts}
        contract={contract}
        onSelectArtifact={handleSelectArtifact}
        onFightMoloch={handleFightMoloch}
      />
    </div>
  );
}