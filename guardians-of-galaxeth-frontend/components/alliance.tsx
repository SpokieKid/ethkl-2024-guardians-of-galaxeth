'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AllianceFormation from './AllianceFormation';

interface AllianceProps {
  userIdentifier: string;
  contract: ethers.Contract | null;
}

export default function Alliance({ userIdentifier, contract }: AllianceProps) {
  const [allies, setAllies] = useState<string[]>([]);

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

  return (
    <div>
      <h2>Alliance</h2>
      <AllianceFormation 
        onProposeAlliance={handleProposeAlliance}
        onAcceptAlliance={handleAcceptAlliance}
        onDefeatObstacle={handleDefeatObstacle}
      />
      <h3>Your Allies:</h3>
      <ul>
        {allies.map((ally, index) => (
          <li key={index}>{ally}</li>
        ))}
      </ul>
    </div>
  );
}