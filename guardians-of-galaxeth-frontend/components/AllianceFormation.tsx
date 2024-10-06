import React, { useState } from 'react';
import Image from 'next/image';
import allyUfoIcon from '../public/ally-ufo.png';

type AllianceFormationProps = {
  onProposeAlliance: (address: string) => void;
  onAcceptAlliance: (address: string) => void;
  onDefeatObstacle: (address: string) => void;
  onGenerateMoloch: () => void;
};

const AllianceFormation: React.FC<AllianceFormationProps> = ({
  onProposeAlliance,
  onAcceptAlliance,
  onDefeatObstacle,
  onGenerateMoloch
}) => {
  const [allyAddress, setAllyAddress] = useState('');

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Image
          src={allyUfoIcon}
          alt="Ally UFO"
          width={24}
          height={24}
          className="mr-2"
        />
        Form Alliance
      </h2>
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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <Image
            src={allyUfoIcon}
            alt="Propose Alliance"
            width={20}
            height={20}
            className="mr-2"
          />
          Propose Alliance
        </button>
        <button
          onClick={() => onAcceptAlliance(allyAddress)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <Image
            src={allyUfoIcon}
            alt="Accept Alliance"
            width={20}
            height={20}
            className="mr-2"
          />
          Accept Alliance
        </button>
        <button
          onClick={() => onDefeatObstacle(allyAddress)}
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <Image
            src={allyUfoIcon}
            alt="Defeat Obstacle"
            width={20}
            height={20}
            className="mr-2"
          />
          Defeat Obstacle
        </button>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={onGenerateMoloch}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <Image
            src={allyUfoIcon}
            alt="Generate Moloch"
            width={20}
            height={20}
            className="mr-2"
          />
          Generate Moloch
        </button>
      </div>
    </div>
  );
};

export default AllianceFormation;