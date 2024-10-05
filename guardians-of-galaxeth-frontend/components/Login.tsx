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

  return (
    <div>
      <IDKitWidget
        app_id="app_staging_584affc2713e9638173a50808575ec3d"
        action="login"
        verification_level={VerificationLevel.Device}
        handleVerify={verifyProof}
        onSuccess={onVerificationSuccess}
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