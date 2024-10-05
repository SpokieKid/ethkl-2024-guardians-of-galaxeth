import React, { useState } from 'react';

type Artifact = {
  id: number;
  name: string;
  power: number;
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
        <div className="grid grid-cols-2 gap-2">
          {artifacts.length > 0 ? (
            artifacts.map((artifact) => (
              <button
                key={artifact.id}
                onClick={() => {
                  setSelectedArtifact(artifact.id);
                  onSelectArtifact(artifact.id);
                }}
                className={`p-2 rounded ${
                  selectedArtifact === artifact.id
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {artifact.name} (Power: {artifact.power})
              </button>
            ))
          ) : (
            <p>No artifacts available</p>
          )}
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