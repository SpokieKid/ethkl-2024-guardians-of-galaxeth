import React, { useState } from 'react';
import Image from 'next/image';

// 更新 Artifact 接口
interface Artifact {
  id: number;
  name: string;
  power: number;
  description: string;
  icon?: string; // 新增 icon 属性
}

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
      description: "Protect privacy using zero-knowledge proofs, preventing Moloch from exploiting sensitive information.",
      icon: "/artifact-sword.png" // 添加图标路径
    },
    {
      id: 2,
      name: "Satoshi's Wisdom Scroll",
      power: 1200,
      description: "Strengthen the consensus mechanism to block Moloch's attack on the network's consensus algorithm.",
      icon: "/scroll-icon.png" // 添加新的图标
    },
    {
      id: 3,
      name: "Moodeng's Cute Emojis",
      power: 800,
      description: "Distract Moloch with a barrage of cute emojis and memes, causing confusion and preventing it from focusing on the network's vulnerability.",
      icon: "/moodeng-hippo.png" // 添加新的图标路径
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
              className={`p-2 rounded flex items-center ${
                selectedArtifact === artifact.id
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {artifact.icon && (
                <Image
                  src={artifact.icon}
                  alt={artifact.name}
                  width={32}
                  height={32}
                  className="mr-2 pixelated"
                />
              )}
              <div>
                <p className="font-bold">{artifact.name}</p>
                <p className="text-sm">Power: {artifact.power}</p>
                <p className="text-xs">{artifact.description}</p>
              </div>
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