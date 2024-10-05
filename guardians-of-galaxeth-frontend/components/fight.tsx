'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface FightProps {
  userIdentifier: string;
  contract: ethers.Contract | null;
}

interface Artifact {
  id: number;
  name: string;
  power: number;
}

export default function Fight({ userIdentifier, contract }: FightProps) {
  const [communityPower, setCommunityPower] = useState(0);
  const [molochPower, setMolochPower] = useState(0);
  const [selectedArtifact, setSelectedArtifact] = useState<number | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  useEffect(() => {
    const fetchBattleInfo = async () => {
      if (contract) {
        try {
          const communityId = await contract.playerCommunity(userIdentifier);
          const [, , totalStake] = await contract.getCommunityInfo(communityId);
          setCommunityPower(ethers.utils.formatEther(totalStake));

          const moloch = await contract.currentMoloch();
          setMolochPower(moloch.attackPower.toNumber());

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
      setSelectedArtifact(null);
    } catch (error) {
      console.error("Error fighting Moloch:", error);
      alert("Failed to fight Moloch. Please try again.");
    }
  };

  return (
    <div className="p-4 bg-deep-space-blue text-neon-yellow">
      <h2 className="text-2xl font-bold mb-4">Fight Moloch</h2>
      <div className="mb-4">
        <p>Community Power: {communityPower}</p>
        <p>Moloch Power: {molochPower}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Select Artifact:</h3>
        <div className="grid grid-cols-2 gap-2">
          {artifacts.map((artifact) => (
            <button
              key={artifact.id}
              onClick={() => handleSelectArtifact(artifact.id)}
              className={`p-2 rounded ${
                selectedArtifact === artifact.id
                  ? 'bg-neon-yellow text-deep-space-blue'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {artifact.name} (Power: {artifact.power})
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleFightMoloch}
        disabled={selectedArtifact === null}
        className={`w-full py-2 rounded font-bold ${
          selectedArtifact !== null
            ? 'bg-neon-yellow text-deep-space-blue hover:bg-yellow-400'
            : 'bg-gray-500 cursor-not-allowed'
        }`}
      >
        Fight Moloch
      </button>
    </div>
  );
}