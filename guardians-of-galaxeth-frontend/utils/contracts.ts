import { ethers } from 'ethers';

const contractABI = [
  // Add your contract ABI here
];

const contractAddress = '0x...'; // Add your deployed contract address on Scroll testnet

export function getContract() {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  } else {
    throw new Error('Please install MetaMask!');
  }
}