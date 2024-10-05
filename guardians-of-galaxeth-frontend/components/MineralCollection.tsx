import React from 'react';

type MineralCollectionProps = {
  minerals: number;
};

const MineralCollection: React.FC<MineralCollectionProps> = ({ minerals }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Mineral Collection</h2>
      <p className="mb-4">Current GETH Balance: {minerals.toFixed(2)}</p>
    </div>
  );
};

export default MineralCollection;