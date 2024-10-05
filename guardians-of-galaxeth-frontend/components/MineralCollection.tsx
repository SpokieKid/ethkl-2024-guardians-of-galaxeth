import React from 'react';

type MineralCollectionProps = {
  minerals: number;
  onCollect: () => void;
};

const MineralCollection: React.FC<MineralCollectionProps> = ({ minerals, onCollect }) => {
  return (
    <div className="flex flex-col items-center">
      <p className="text-xl mb-2">GETH: {minerals}</p>
      <button 
        onClick={onCollect}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Collect Minerals
      </button>
    </div>
  );
};

export default MineralCollection;