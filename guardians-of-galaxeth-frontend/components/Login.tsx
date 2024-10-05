import React from 'react';
import { IDKitWidget } from '@worldcoin/idkit';

type LoginProps = {
  onSuccess: () => void;
};

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const handleVerify = (proof: any) => {
    console.log('Proof:', proof);
    // Here you would typically send the proof to your backend for verification
    onSuccess();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Welcome to Guardians of GalaxETH</h1>
      <IDKitWidget
        app_id="app_staging_584affc2713e9638173a50808575ec3d" // Replace with your Worldcoin app ID
        action="login"
        onSuccess={handleVerify}
        handleVerify={handleVerify}
        verification_level="device"
        is_staging={true}
      >
        {({ open }) => <button onClick={open} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login with Worldcoin</button>}
      </IDKitWidget>
    </div>
  );
};

export default Login;