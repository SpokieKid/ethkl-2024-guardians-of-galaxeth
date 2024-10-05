'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';

interface AllianceProps {
  address: string;
  contract: ethers.Contract | null;
}

export default function Alliance({ address, contract }: AllianceProps) {
  const [allyAddress, setAllyAddress] = useState('');
  const [alliances, setAlliances] = useState<string[]>([]);
  const [communityMembers, setCommunityMembers] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllianceInfo = async () => {
      if (contract && address) {
        try {
          const communityId = await contract.playerCommunity(address);
          const [members, , ] = await contract.getCommunityInfo(communityId);
          setCommunityMembers(members);

          // 获取所有玩家的地址作为潜在盟友
          const playerCount = await contract.getPlayerCount();
          const allPlayers = await Promise.all(
            Array(playerCount.toNumber()).fill(0).map((_, index) => contract.players(index))
          );
          setAlliances(allPlayers.filter(player => player !== address && !members.includes(player)));
        } catch (error) {
          console.error("Error fetching alliance info:", error);
        }
      }
    };
    fetchAllianceInfo();
  }, [contract, address]);

  const handleProposeAlliance = async () => {
    if (!contract || !ethers.utils.isAddress(allyAddress)) return;

    try {
      const tx = await contract.proposeAlliance(allyAddress);
      await tx.wait();
      alert("Alliance proposed successfully!");
      setAllyAddress('');
      // 刷新联盟信息
      const communityId = await contract.playerCommunity(address);
      const [members, , ] = await contract.getCommunityInfo(communityId);
      setCommunityMembers(members);
    } catch (error) {
      console.error("Error proposing alliance:", error);
      alert("Failed to propose alliance. Please try again.");
    }
  };

  const handleAcceptAlliance = async (proposerAddress: string) => {
    if (!contract) return;

    try {
      const tx = await contract.acceptAlliance(proposerAddress);
      await tx.wait();
      alert("Alliance accepted successfully!");
      // 刷新联盟信息
      const communityId = await contract.playerCommunity(address);
      const [members, , ] = await contract.getCommunityInfo(communityId);
      setCommunityMembers(members);
    } catch (error) {
      console.error("Error accepting alliance:", error);
      alert("Failed to accept alliance. Please try again.");
    }
  };

  return (
    <div className="p-4 bg-deep-space-blue text-neon-yellow">
      <h2 className="text-2xl font-bold mb-4">Form Alliances</h2>
      <div className="mb-4">
        <input
          type="text"
          value={allyAddress}
          onChange={(e) => setAllyAddress(e.target.value)}
          placeholder="Enter ally address"
          className="w-full p-2 bg-gray-700 text-white rounded"
        />
        <button
          onClick={handleProposeAlliance}
          className="mt-2 bg-neon-yellow text-deep-space-blue px-4 py-2 rounded"
        >
          Propose Alliance
        </button>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Current Community Members:</h3>
        {communityMembers.map((member, index) => (
          <div key={index} className="mb-2">
            <span>{member}</span>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Potential Allies:</h3>
        <div className="flex flex-wrap gap-4">
          {alliances.map((ally, index) => (
            <div key={index} className="flex flex-col items-center">
              <Image
                src="/ally-ufo.png"
                alt="Ally UFO"
                width={50}
                height={50}
                className="mb-2"
              />
              <span className="text-xs mb-1">{ally.slice(0, 6)}...{ally.slice(-4)}</span>
              <button
                onClick={() => handleAcceptAlliance(ally)}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}