import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.27",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    scrollSepolia: {
      url: `https://scroll-sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY || ""]
    },
    mantaTestnet: {
      url: "https://manta-testnet.calderachain.xyz/http",
      accounts: [process.env.PRIVATE_KEY || ""],
      chainId: 3441005, // Manta 测试网的 chainId
      gasPrice: 1000000000,  // 1 gwei
      gas: 2100000,
      timeout: 60000,  // 增加超时时间到60秒
      httpHeaders: {
        "Content-Type": "application/json"
      }
    }
  }
};

export default config;
