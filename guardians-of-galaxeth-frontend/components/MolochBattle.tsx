import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface Artifact {
  id: number;
  name: string;
  power: number;
  description: string;
}

interface Moloch {
  id: number;
  creator: string;
  attackPower: number;
  isDefeated: boolean;
}

type MolochBattleProps = {
  userIdentifier: string;
  communityPower: number;
  artifacts: Artifact[];
  contract: ethers.Contract | null;
  onSelectArtifact: (artifactId: number) => void;
  onFightMoloch: (molochId: number, artifactId: number) => void;
};

const MolochBattle: React.FC<MolochBattleProps> = ({
  userIdentifier,
  communityPower,
  artifacts,
  contract,
  onSelectArtifact,
  onFightMoloch
}) => {
  const [activeMolochs, setActiveMolochs] = useState<Moloch[]>([]);
  const [selectedMoloch, setSelectedMoloch] = useState<number | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<number | null>(null);

  useEffect(() => {
    const fetchActiveMolochs = async () => {
      if (contract) {
        try {
          const molochIds = await contract.getActiveMolochs();
          const molochs = await Promise.all(
            molochIds.map(async (id: ethers.BigNumber) => {
              const moloch = await contract.molochs(id);
              return {
                id: id.toNumber(),
                creator: moloch.creator,
                attackPower: moloch.attackPower.toNumber(),
                isDefeated: moloch.isDefeated
              };
            })
          );
          setActiveMolochs(molochs);
        } catch (error) {
          console.error("Error fetching active Molochs:", error);
        }
      }
    };

    fetchActiveMolochs();
  }, [contract]);

  const handleSelectMoloch = (molochId: number) => {
    setSelectedMoloch(molochId);
  };

  const handleSelectArtifact = (artifactId: number) => {
    setSelectedArtifact(artifactId);
    onSelectArtifact(artifactId);
  };

  return (
    <div className="bg-deep-space-blue p-4 rounded-lg text-neon-yellow">
      <h2 className="text-2xl font-bold mb-4">Moloch Battle</h2>
      <p className="mb-4">
        Moloch Threat: Moloch has discovered a privacy vulnerability within the Ethereum network and is attempting to exploit it to compromise security. The community must collectively choose the right public good to counter this threat.
      </p>
      <p className="mb-4">
        Question: Moloch has identified a privacy loophole that threatens the network. Which public good will you and your community choose to stop Moloch's attack?
      </p>
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">Select a Moloch to fight</h3>
        <select onChange={(e) => handleSelectMoloch(Number(e.target.value))} value={selectedMoloch || ''}>
          <option value="">Select a Moloch</option>
          {activeMolochs.map((moloch) => (
            <option key={moloch.id} value={moloch.id}>
              Moloch {moloch.id} (Power: {moloch.attackPower})
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">Select an Artifact</h3>
        <div className="grid grid-cols-1 gap-4">
          {artifacts.map((artifact) => (
            <button
              key={artifact.id}
              onClick={() => handleSelectArtifact(artifact.id)}
              className={`p-2 rounded ${selectedArtifact === artifact.id ? 'bg-blue-500' : 'bg-gray-700'}`}
            >
              <p className="font-bold">{artifact.name}</p>
              <p>Power: {artifact.power}</p>
              <p>{artifact.description}</p>
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => selectedMoloch !== null && selectedArtifact !== null && onFightMoloch(selectedMoloch, selectedArtifact)}
        disabled={selectedMoloch === null || selectedArtifact === null}
        className="w-full py-2 rounded font-bold bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        Fight Moloch
      </button>
    </div>
  );
};

export default MolochBattle;