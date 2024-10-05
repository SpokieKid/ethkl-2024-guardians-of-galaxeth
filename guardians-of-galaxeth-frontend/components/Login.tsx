"use client";
import React from 'react';
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';

type LoginProps = {
  onLoginSuccess: (playerAddress: string) => void;
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const verifyProof = async (proof: any) => {
    console.log("Proof received:", proof);
    return true;
  };

  const handleVerificationSuccess = (result: any) => {
    const playerAddress = result.nullifier_hash;
    if (onLoginSuccess) {
      onLoginSuccess(playerAddress);
    } else {
      console.error("onLoginSuccess is not defined");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative z-10 bg-black bg-opacity-50">
      <h1 className="text-8xl font-bold mb-12 text-neon-yellow font-pixelify-sans">
        Guardian of galaxETH
      </h1>
      <IDKitWidget
        app_id="app_staging_0cad0a5d4c2f7c2a7d6f1c7c5f1e8d3b"
        action="login"
        verification_level={VerificationLevel.Device}
        handleVerify={verifyProof}
        onSuccess={handleVerificationSuccess}
      >
        {({ open }) => (
          <button
            onClick={open}
            className="bg-neon-yellow text-deep-space-blue font-bold py-3 px-6 rounded-lg text-xl hover:bg-yellow-400 transition duration-300"
          >
            Verify with World ID
          </button>
        )}
      </IDKitWidget>
    </div>
  );
}

export default Login;