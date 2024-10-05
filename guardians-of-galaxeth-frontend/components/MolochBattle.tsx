import React, { useState } from 'react';
import Image from 'next/image';

type Artifact = {
  id: number;
  name: string;
  power: number;
  description: string;
};

type MolochBattleProps = {
  molochPower: number;
  communityPower: number;
  artifacts: Artifact[];
  onSelectArtifact: (artifactId: number) => void;
  onFightMoloch: () => void;
  molochHealth: number;
};

const MolochBattle: React.FC<MolochBattleProps> = ({
  molochPower,
  communityPower,
  artifacts,
  onSelectArtifact,
  onFightMoloch,
  molochHealth
}) => {
  const [selectedArtifact, setSelectedArtifact] = useState<number | null>(null);

  // Calculate total community power including the selected artifact's power
  const totalCommunityPower = communityPower + (selectedArtifact !== null ? artifacts[selectedArtifact]?.power || 0 : 0);

  const artifactsList: Artifact[] = [
    {
      id: 1,
      name: "ZK Shield Protocol",
      power: 1000,
      description: "Protect privacy using zero-knowledge proofs, preventing Moloch from exploiting sensitive information."
    },
    {
      id: 2,
      name: "Satoshi's Wisdom Scroll",
      power: 1200,
      description: "Strengthen the consensus mechanism to block Moloch's attack on the network's consensus algorithm."
    },
    {
      id: 3,
      name: "Moodeng's Cute Emojis",
      power: 800,
      description: "Distract Moloch with a barrage of cute emojis and memes, causing confusion and preventing it from focusing on the network's vulnerability."
    }
  ];

  return (
    <div className="bg-red-900 p-4 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Moloch Battle</h2>
      <div className="flex justify-between mb-4">
        <div>
          <p>Moloch Power: {molochPower}</p>
          <p>Moloch Health: {molochHealth}%</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${molochHealth}%` }}></div>
          </div>
        </div>
        <div>
          <p>Community Power: {communityPower}</p>
          {selectedArtifact !== null && (
            <p>Total Power (with artifact): {totalCommunityPower}</p>
          )}
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Select Artifact:</h3>
        <p className="mb-2">Moloch has identified a privacy loophole that threatens the network. Which public good will you and your community choose to stop Moloch's attack?</p>
        <div className="grid grid-cols-1 gap-4">
          {artifactsList.map((artifact) => (
            <button
              key={artifact.id}
              onClick={() => {
                setSelectedArtifact(artifact.id);
                onSelectArtifact(artifact.id);
              }}
              className={`p-4 rounded flex flex-col items-start ${
                selectedArtifact === artifact.id
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center mb-2">
                <Image
                  src={`/artifact-${artifact.id}.png`}
                  alt={artifact.name}
                  width={48}
                  height={48}
                  className="mr-4 pixelated"
                />
                <span className="text-lg font-bold">{artifact.name}</span>
              </div>
              <p className="text-sm">{artifact.description}</p>
              <p className="mt-2 font-semibold">Power: {artifact.power}</p>
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={onFightMoloch}
        disabled={selectedArtifact === null || totalCommunityPower <= molochPower}
        className={`w-full py-2 rounded font-bold ${
          selectedArtifact !== null && totalCommunityPower > molochPower
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-gray-500 cursor-not-allowed'
        }`}
      >
        Fight Moloch
      </button>
    </div>
  );
};

export default MolochBattle;