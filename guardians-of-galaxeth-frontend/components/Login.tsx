"use client";
import React, { useState } from 'react';
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';
import { ethers } from 'ethers';

type LoginProps = {
  onLoginSuccess: (worldIdHash: string, walletAddress: string) => void;
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [worldIdHash, setWorldIdHash] = useState<string | null>(null);

  const handleVerify = async (proof: ISuccessResult) => {
    console.log("Proof received:", proof);
    // TODO: Implement server-side verification
    return true;
  };

  const handleVerificationSuccess = async (result: any) => {
    const hash = result.nullifier_hash;
    setWorldIdHash(hash);
    
    // Automatically connect wallet after WorldID verification
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        onLoginSuccess(hash, address);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet. Please try again.');
      }
    } else {
      alert('Please install MetaMask to use this app');
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
        onSuccess={handleVerificationSuccess}
      >
        {({ open }) => (
          <button
            onClick={open}
            className="bg-neon-yellow text-deep-space-blue font-bold py-3 px-6 rounded-lg text-xl hover:bg-yellow-400 transition duration-300"
          >
            Login with World ID
          </button>
        )}
      </IDKitWidget>
    </div>
  );
}

export default Login;