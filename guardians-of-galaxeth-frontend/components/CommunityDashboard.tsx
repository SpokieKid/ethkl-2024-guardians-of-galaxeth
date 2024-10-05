import React from 'react';

type CommunityMember = {
  address: string;
  gethBalance: number;
};

type CommunityDashboardProps = {
  communityId: string;
  members: CommunityMember[];
  totalStake: number;
  onStartVoting: () => void;
};

const CommunityDashboard: React.FC<CommunityDashboardProps> = ({ communityId, members, totalStake, onStartVoting }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Community Dashboard</h2>
      <p>Community ID: {communityId || 'Not part of a community'}</p>
      <p>Total Stake: {totalStake} ETH</p>
      <h3 className="text-lg font-semibold mt-4 mb-2">Members:</h3>
      <ul>
        {members.map((member, index) => (
          <li key={index} className="mb-2">
            Address: {member.address.slice(0, 6)}...{member.address.slice(-4)}
            <br />
            GETH Balance: {member.gethBalance}
          </li>
        ))}
      </ul>
      <button
        onClick={onStartVoting}
        className="mt-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >
        Start Voting
      </button>
    </div>
  );
};

export default CommunityDashboard;