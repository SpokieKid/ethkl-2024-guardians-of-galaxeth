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

  const handleSuccess = (proof: ISuccessResult) => {
    console.log("Verification successful:", proof);
    // Use the nullifier_hash as a unique identifier for the user
    const userIdentifier = proof.nullifier_hash;
    onLoginSuccess(userIdentifier);
  };

  return (
    <div>
      <IDKitWidget
        app_id="app_staging_584affc2713e9638173a50808575ec3d"
        action="login"
        verification_level={VerificationLevel.Device}
        handleVerify={handleVerify}
        onSuccess={handleSuccess}
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