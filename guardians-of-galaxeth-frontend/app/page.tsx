'use client';

import React, { useState, useEffect } from 'react';
import Login from '../components/Login';
import Spaceship from '../components/Spaceship';
import MineralCollection from '../components/MineralCollection';
import AllianceFormation from '../components/AllianceFormation';
import CommunityDashboard from '../components/CommunityDashboard';
import MolochBattle from '../components/MolochBattle';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [spaceshipPosition, setSpaceshipPosition] = useState({ x: 0, y: 0 });
  const [minerals, setMinerals] = useState(0);
  const [communityId, setCommunityId] = useState('community-123');
  const [communityMembers, setCommunityMembers] = useState([
    { address: '0x1234...5678', gethBalance: 100 },
    { address: '0xabcd...efgh', gethBalance: 150 },
  ]);
  const [totalStake, setTotalStake] = useState(1000);
  const [molochPower, setMolochPower] = useState(500);
  const [communityPower, setCommunityPower] = useState(600);
  const [artifacts] = useState([
    { id: 1, name: 'Excalibur', power: 100 },
    { id: 2, name: 'Mjolnir', power: 120 },
    { id: 3, name: 'Aegis', power: 80 },
    { id: 4, name: 'Gae Bolg', power: 90 },
  ]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleCollectMinerals = () => {
    setMinerals(prev => prev + 10);
  };

  const handleProposeAlliance = (address: string) => {
    console.log(`Proposing alliance to ${address}`);
  };

  const handleAcceptAlliance = (address: string) => {
    console.log(`Accepting alliance from ${address}`);
  };

  const handleStartVoting = () => {
    console.log('Starting voting for community');
  };

  const handleSelectArtifact = (artifactId: number) => {
    console.log(`Selected artifact: ${artifactId}`);
  };

  const handleFightMoloch = () => {
    console.log('Fighting Moloch');
    // Here you would call the smart contract function to fight Moloch
    // For now, let's just update the state to simulate a battle
    const battleOutcome = Math.random() > 0.5;
    if (battleOutcome) {
      setMolochPower(prev => Math.max(0, prev - 100));
      setCommunityPower(prev => prev + 50);
      setMinerals(prev => prev + 200);
      alert('Victory! You defeated Moloch and gained 200 GETH!');
    } else {
      setCommunityPower(prev => Math.max(0, prev - 50));
      alert('Defeat! Moloch was too strong this time. Try again!');
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isLoggedIn) return;

      setSpaceshipPosition(prev => {
        switch (e.key) {
          case 'ArrowUp':
            return { ...prev, y: Math.max(0, prev.y - 10) };
          case 'ArrowDown':
            return { ...prev, y: Math.min(window.innerHeight - 50, prev.y + 10) };
          case 'ArrowLeft':
            return { ...prev, x: Math.max(0, prev.x - 10) };
          case 'ArrowRight':
            return { ...prev, x: Math.min(window.innerWidth - 50, prev.x + 10) };
          default:
            return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLoggedIn]);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white p-4">
      {!isLoggedIn ? (
        <Login onSuccess={handleLoginSuccess} />
      ) : (
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-8">Guardians of GalaxETH</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
            <div className="space-y-8">
              <MineralCollection minerals={minerals} onCollect={handleCollectMinerals} />
              <AllianceFormation
                onProposeAlliance={handleProposeAlliance}
                onAcceptAlliance={handleAcceptAlliance}
              />
            </div>
            <div className="space-y-8">
              <CommunityDashboard
                communityId={communityId}
                members={communityMembers}
                totalStake={totalStake}
                onStartVoting={handleStartVoting}
              />
              <MolochBattle
                molochPower={molochPower}
                communityPower={communityPower}
                artifacts={artifacts}
                onSelectArtifact={handleSelectArtifact}
                onFightMoloch={handleFightMoloch}
              />
            </div>
          </div>
          <div className="mt-8 relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden">
            <Spaceship position={spaceshipPosition} />
          </div>
        </div>
      )}
    </div>
  );
}