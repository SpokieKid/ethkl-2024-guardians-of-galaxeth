import React, { useState } from 'react';

type AllianceFormationProps = {
  onProposeAlliance: (address: string) => void;
  onAcceptAlliance: (address: string) => void;
};

const AllianceFormation: React.FC<AllianceFormationProps> = ({ onProposeAlliance, onAcceptAlliance }) => {
  const [allyAddress, setAllyAddress] = useState('');

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Form Alliance</h2>
      <input
        type="text"
        value={allyAddress}
        onChange={(e) => setAllyAddress(e.target.value)}
        placeholder="Enter ally address"
        className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
      />
      <div className="flex justify-between">
        <button
          onClick={() => onProposeAlliance(allyAddress)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Propose Alliance
        </button>
        <button
          onClick={() => onAcceptAlliance(allyAddress)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Accept Alliance
        </button>
      </div>
    </div>
  );
};

export default AllianceFormation;