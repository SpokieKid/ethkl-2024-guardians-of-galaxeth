import React from 'react';
import Image from 'next/image';

type ObstacleProps = {
  position: { x: number; y: number };
};

const Obstacle: React.FC<ObstacleProps> = ({ position }) => {
  return (
    <div 
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '50px',
        height: '50px',
      }}
    >
      <Image
        src="/obstacle.png"
        alt="Obstacle"
        width={50}
        height={50}
        className="pixelated"
        priority
      />
    </div>
  );
};

export default Obstacle;