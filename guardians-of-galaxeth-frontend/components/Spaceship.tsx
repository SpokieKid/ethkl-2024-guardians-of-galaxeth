import React from 'react';

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
        backgroundColor: 'blue',
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
      }}
    />
  );
};

export default Spaceship;