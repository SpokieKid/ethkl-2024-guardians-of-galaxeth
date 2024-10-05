import React from 'react';

type MineralCollectionProps = {
  minerals: number;
  onCollect: () => void;
};

const MineralCollection: React.FC<MineralCollectionProps> = ({ minerals, onCollect }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Mineral Collection</h2>
      <p className="mb-4">Current GETH Balance: {minerals}</p>
      <button
        onClick={onCollect}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Collect Minerals
      </button>
    </div>
  );
};

export default MineralCollection;