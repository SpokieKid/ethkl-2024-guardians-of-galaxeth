"use client"
import React from 'react';
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';

type LoginProps = {
  onVerificationSuccess: () => void;
};

const Login: React.FC<LoginProps> = ({ onVerificationSuccess }) => {
  // TODO: Implement server-side verification
  const verifyProof = async (proof: any) => {
    console.log("Proof received:", proof);
    // For now, we'll assume the proof is valid
    return true;
  };

  const handleVerificationSuccess = (result: any) => {
    // 假设 result 包含了玩家的地址
    const playerAddress = result.address; // 或者其他方式获取地址
    onLoginSuccess(playerAddress);
  };

  return (
    <div>
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Verify with World ID
          </button>
        )}
      </IDKitWidget>
    </div>
  );
}

export default Login;