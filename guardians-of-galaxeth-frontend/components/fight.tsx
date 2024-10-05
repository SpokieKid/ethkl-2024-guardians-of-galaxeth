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
}

type Artifact = {
  id: number;
  name: string;
  power: number;
};

export default function Fight({ userIdentifier, contract, gethBalance, updateGethBalance }: FightProps) {
  const [communityPower, setCommunityPower] = useState(0);
  const [molochPower, setMolochPower] = useState(0);
  const [selectedArtifact, setSelectedArtifact] = useState<number | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [molochHealth, setMolochHealth] = useState(100);

  useEffect(() => {
    const fetchBattleInfo = async () => {
      if (contract) {
        try {
          const communityId = await contract.playerCommunity(userIdentifier);
          const communityInfo = await contract.getCommunityInfo(communityId);
          const communityMembers = communityInfo[0];
          
          let totalGETH = 0;
          for (const member of communityMembers) {
            const playerInfo = await contract.players(member);
            totalGETH += playerInfo.gethBalance.toNumber();
          }
          setCommunityPower(totalGETH);

          const moloch = await contract.currentMoloch();
          setMolochPower(moloch.attackPower.toNumber());
          setMolochHealth(100); // Reset Moloch health to 100%

          const artifactCount = await contract.getArtifactCount();
          const artifactsData = await Promise.all(
            Array(artifactCount.toNumber()).fill(0).map(async (_, index) => {
              const artifact = await contract.artifacts(index);
              return {
                id: index,
                name: artifact.name,
                power: artifact.power.toNumber()
              };
            })
          );
          setArtifacts(artifactsData);
        } catch (error) {
          console.error("Error fetching battle info:", error);
        }
      }
    };
    fetchBattleInfo();
  }, [contract, userIdentifier]);

  const handleSelectArtifact = (artifactId: number) => {
    setSelectedArtifact(artifactId);
  };

  const handleFightMoloch = async () => {
    if (selectedArtifact === null || !contract) return;

    try {
      const tx = await contract.fightMoloch(selectedArtifact);
      await tx.wait();
      alert("Battle completed! Check your updated balance and reputation.");
      // Refresh battle info after fight
      const moloch = await contract.currentMoloch();
      setMolochPower(moloch.attackPower.toNumber());
      setMolochHealth(prevHealth => Math.max(0, prevHealth - 20)); // Reduce Moloch health by 20%
      setSelectedArtifact(null);
      await updateGethBalance(); // Update GETH balance after fight
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
        molochPower={molochPower}
        communityPower={communityPower}
        artifacts={artifacts}
        onSelectArtifact={handleSelectArtifact}
        onFightMoloch={handleFightMoloch}
        molochHealth={molochHealth}
      />
    </div>
  );
}