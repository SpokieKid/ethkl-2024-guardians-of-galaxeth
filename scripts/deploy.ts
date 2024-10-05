import { ethers } from "hardhat";

async function main() {
  // Deploy GuardianOfGalaxETH
  const GuardianOfGalaxETH = await ethers.getContractFactory("GuardianOfGalaxETH");
  const guardianOfGalaxETH = await GuardianOfGalaxETH.deploy();
  await guardianOfGalaxETH.waitForDeployment();
  console.log("GuardianOfGalaxETH deployed to:", await guardianOfGalaxETH.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});