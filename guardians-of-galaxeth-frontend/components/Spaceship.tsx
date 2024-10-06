import React from 'react';
import Image from 'next/image';

type SpaceshipProps = {
  position: { x: number; y: number };
};

const Spaceship: React.FC<SpaceshipProps> = ({ position }) => {
  return (
    <div 
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '100px', // 增大到原来的 2 倍
        height: '100px', // 增大到原来的 2 倍
      }}
    >
      <Image
        src="/spaceship.png"
        alt="Spaceship"
        width={100} // 增大到原来的 2 倍
        height={100} // 增大到原来的 2 倍
        priority
      />
    </div>
  );
};

export default Spaceship;