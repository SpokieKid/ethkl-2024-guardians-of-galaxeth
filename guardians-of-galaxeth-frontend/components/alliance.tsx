'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AllianceFormation from './AllianceFormation';
import MolochBattle from './MolochBattle';
import Image from 'next/image';
import allyUfoIcon from '../public/ally-ufo.png';

interface AllianceProps {
  userIdentifier: string;
  contract: ethers.Contract | null;
}

export default function Alliance({ userIdentifier, contract }: AllianceProps) {
  const [allies, setAllies] = useState<string[]>([]);
  const [communityPower, setCommunityPower] = useState<number>(0);
  const [artifacts, setArtifacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllies = async () => {
      if (contract) {
        try {
          console.log("Fetching allies for:", userIdentifier);
          // 获取盟友数量
          const allyCount = await contract.getAllyCount(userIdentifier);
          console.log("Ally count:", allyCount.toNumber());

          // 获取所有盟友
          const alliesData = [];
          for (let i = 0; i < allyCount.toNumber(); i++) {
            const ally = await contract.getAlly(userIdentifier, i);
            alliesData.push(ally);
          }

          console.log("Allies data:", alliesData);
          setAllies(alliesData);
        } catch (error: any) {
          console.error("Error fetching allies:", error);
          if (error.reason) {
            console.error("Error reason:", error.reason);
          }
          if (error.code) {
            console.error("Error code:", error.code);
          }
          if (error.data) {
            console.error("Error data:", error.data);
          }
        }
      }
    };
    fetchAllies();
  }, [contract, userIdentifier]);

  const handleProposeAlliance = async (address: string) => {
    if (contract) {
      try {
        const tx = await contract.proposeAlliance(address);
        await tx.wait();
        alert("Alliance proposed successfully!");
      } catch (error: any) {
        console.error("Error proposing alliance:", error);
        alert(`Failed to propose alliance: ${error.message}`);
      }
    }
  };

  const handleAcceptAlliance = async (address: string) => {
    if (contract) {
      try {
        const tx = await contract.acceptAlliance(address);
        await tx.wait();
        alert("Alliance accepted successfully!");
      } catch (error: any) {
        console.error("Error accepting alliance:", error);
        alert(`Failed to accept alliance: ${error.message}`);
      }
    }
  };

  const handleDefeatObstacle = async (address: string) => {
    if (contract) {
      try {
        const tx = await contract.defeatObstacle(address);
        await tx.wait();
        alert("Obstacle defeated successfully!");
      } catch (error: any) {
        console.error("Error defeating obstacle:", error);
        alert(`Failed to defeat obstacle: ${error.message}`);
      }
    }
  };

  const handleSelectArtifact = (artifactId: number) => {
    // This function can be implemented if needed
    console.log("Selected artifact:", artifactId);
  };

  const handleFightMoloch = async (molochId: number, artifactId: number) => {
    if (contract) {
      try {
        const tx = await contract.fightMoloch(molochId, artifactId);
        await tx.wait();
        alert("Moloch defeated successfully!");
      } catch (error: any) {
        console.error("Error fighting Moloch:", error);
        alert(`Failed to fight Moloch: ${error.message}`);
      }
    }
  };

  return (
    <div className="bg-deep-space-blue text-neon-yellow p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Alliance</h2>
      <AllianceFormation 
        onProposeAlliance={handleProposeAlliance}
        onAcceptAlliance={handleAcceptAlliance}
        onDefeatObstacle={handleDefeatObstacle}
      />
      <MolochBattle
        userIdentifier={userIdentifier}
        communityPower={communityPower}
        artifacts={artifacts}
        contract={contract}
        onSelectArtifact={handleSelectArtifact}
        onFightMoloch={handleFightMoloch}
      />
      <h3 className="text-xl font-semibold mt-6 mb-2">Your Allies:</h3>
      <ul className="grid grid-cols-2 gap-4">
        {allies.map((ally, index) => (
          <li key={index} className="flex items-center bg-gray-800 p-2 rounded">
            <Image
              src={allyUfoIcon}
              alt="Ally UFO"
              width={32}
              height={32}
              className="mr-2"
            />
            <span className="truncate">{ally}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}