import React from 'react';

type GETHCollectionProps = {
  geth: number;
};

const GETHCollection: React.FC<GETHCollectionProps> = ({ geth }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">GETH Collection</h2>
      <p className="mb-4">Current GETH Balance: {geth.toFixed(2)}</p>
    </div>
  );
};

export default GETHCollection;