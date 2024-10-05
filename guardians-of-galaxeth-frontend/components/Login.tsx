"use client"
import React from 'react';
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';

type LoginProps = {
  onLoginSuccess: (address: string) => void;
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const handleVerify = async (proof: ISuccessResult) => {
    console.log("Proof received:", proof);
    // TODO: Implement server-side verification
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
        // handleVerify={verifyProof}
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