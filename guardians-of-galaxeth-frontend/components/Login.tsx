"use client";
import React, { useState } from 'react';
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

type LoginProps = {
  onLoginSuccess: (worldIdHash: string, walletAddress: string) => void;
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        console.log("Wallet connected:", address);
        setIsWalletConnected(true);
        return address;
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    } else {
      console.error("Ethereum object not found, do you have MetaMask installed?");
      alert("Please install MetaMask or another Web3 wallet to use this application.");
    }
  };

  const verifyProof = async (proof: any) => {
    console.log("Proof received:", proof);
    return true;
  };

  const handleVerificationSuccess = async (result: any) => {
    if (!isWalletConnected) {
      const address = await connectWallet();
      if (!address) return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    console.log("Login component: Wallet address obtained:", address);
    onLoginSuccess(result.nullifier_hash, address);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative z-10 bg-black bg-opacity-50">
      <h1 className="text-8xl font-bold mb-12 text-neon-yellow font-pixelify-sans">
        Guardian of galaxETH
      </h1>
      <button
        onClick={connectWallet}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        disabled={isWalletConnected}
      >
        {isWalletConnected ? "Wallet Connected" : "Connect Wallet"}
      </button>
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
            disabled={!isWalletConnected}
          >
            Verify with World ID
          </button>
        )}
      </IDKitWidget>
    </div>
  );
}

export default Login;
