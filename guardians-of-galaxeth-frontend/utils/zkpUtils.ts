// utils/zkpUtils.ts

import { groth16 } from 'snarkjs';
import { MantaZkProvider } from '@manta-network/manta-zk';

const mantaZkProvider = new MantaZkProvider();

export async function generateProof(mineralCount: number) {
  const input = {
    mineralCount: mineralCount,
    playerSecret: Math.floor(Math.random() * 1000000) // This should be a persistent secret per player
  };

  const { proof, publicSignals } = await mantaZkProvider.generateProof(
    'mineralCollection',
    input
  );

  return { proof, publicSignals };
}