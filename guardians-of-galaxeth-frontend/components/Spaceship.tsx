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
        width: '50px',
        height: '50px',
      }}
    >
      <Image
        src="/spaceship.png"  // 假设您将图像保存为 public/spaceship.png
        alt="Spaceship"
        width={50}
        height={50}
        priority
      />
    </div>
  );
};

export default Spaceship;