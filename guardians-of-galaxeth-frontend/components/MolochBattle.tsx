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
};

const MolochBattle: React.FC<MolochBattleProps> = ({
  molochPower,
  communityPower,
  artifacts,
  onSelectArtifact,
  onFightMoloch
}) => {
  const [selectedArtifact, setSelectedArtifact] = useState<number | null>(null);

  return (
    <div className="bg-red-900 p-4 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Moloch Battle</h2>
      <div className="flex justify-between mb-4">
        <div>
          <p>Moloch Power: {molochPower}</p>
        </div>
        <div>
          <p>Community Power: {communityPower}</p>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Select Artifact:</h3>
        <div className="grid grid-cols-2 gap-2">
          {artifacts.map((artifact) => (
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
          ))}
        </div>
      </div>
      <button
        onClick={onFightMoloch}
        disabled={selectedArtifact === null}
        className={`w-full py-2 rounded font-bold ${
          selectedArtifact !== null
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