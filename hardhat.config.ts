import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "dotenv/config";
import "solidity-coverage";
import "hardhat-deploy";
import "solidity-coverage";
import {HardhatUserConfig} from "hardhat/config";

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            gas: 2100000,
            gasPrice: 8000000000
        },
        matic: {
            url: "https://rpc-mumbai.maticvigil.com",
            accounts: [PRIVATE_KEY],
            gas: 2100000,
            gasPrice: 8000000000
        }
    },
    solidity: {
        version: "0.8.13",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true
    },
    namedAccounts: {
        deployer: {
            /* Default: the first Account (with Index 0) is taken and named as `deployer` */
            default: 0,
            /* Mainnet with ID 1: the first Account (with Index 0) is taken and named as `deployer` */
            /* Depending on how the Hardhat Network is configured, the Account with Index 0 can be different on one Network than on another */
            1: 0,
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./app/artifacts"
    },
    mocha: {
        /* Timeout after 200 Seconds for running Tests */
        timeout: 200000,
    }
}

export default config;
