import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface Artifact {
  id: number;
  name: string;
  power: number;
}

interface QFVotingProps {
  artifacts: Artifact[];
  userVotingPower: number;
  onVotingComplete: (selectedArtifact: Artifact) => void;
  contract: ethers.Contract | null;
  userIdentifier: string;
}

const QFVoting: React.FC<QFVotingProps> = ({
  artifacts,
  userVotingPower,
  onVotingComplete,
  contract,
  userIdentifier
}) => {
  const [votes, setVotes] = useState<{ [key: number]: number }>({});
  const [remainingVotingPower, setRemainingVotingPower] = useState(userVotingPower);

  const calculateVotingCost = (votes: number) => {
    return votes ** 2;
  };

  const handleVote = (artifactId: number, voteCount: number) => {
    const newVotes = { ...votes };
    const oldVotes = newVotes[artifactId] || 0;
    const oldCost = calculateVotingCost(oldVotes);
    const newCost = calculateVotingCost(voteCount);
    const costDifference = newCost - oldCost;

    if (remainingVotingPower >= costDifference) {
      newVotes[artifactId] = voteCount;
      setVotes(newVotes);
      setRemainingVotingPower(remainingVotingPower - costDifference);
    } else {
      alert("Not enough voting power!");
    }
  };

  const submitVotes = async () => {
    if (contract) {
      try {
        const votesArray = artifacts.map(artifact => ({
          artifactId: artifact.id,
          votes: votes[artifact.id] || 0
        }));
        await contract.submitVotes(userIdentifier, votesArray);
        const results = await contract.tallyVotes();
        const winningArtifact = artifacts.find(a => a.id === results.winningArtifactId);
        if (winningArtifact) {
          onVotingComplete(winningArtifact);
        }
      } catch (error) {
        console.error("Error submitting votes:", error);
      }
    }
  };

  return (
    <div className="bg-deep-space-blue text-neon-yellow p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Vote for Artifacts</h2>
      <p>Remaining Voting Power: {remainingVotingPower}</p>
      {artifacts.map(artifact => (
        <div key={artifact.id} className="mb-4">
          <p>{artifact.name} (Power: {artifact.power})</p>
          <input
            type="number"
            min="0"
            value={votes[artifact.id] || 0}
            onChange={(e) => handleVote(artifact.id, parseInt(e.target.value))}
            className="bg-gray-700 text-white px-2 py-1 rounded"
          />
          <span className="ml-2">Cost: {calculateVotingCost(votes[artifact.id] || 0)}</span>
        </div>
      ))}
      <button
        onClick={submitVotes}
        className="bg-neon-yellow text-deep-space-blue font-bold py-2 px-4 rounded"
      >
        Submit Votes
      </button>
    </div>
  );
};

export default QFVoting;