const nearAPI = require("near-api-js");
const {
    keyStores
} = nearAPI;

const homedir = require("os").homedir();
const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = require("path").join(homedir, CREDENTIALS_DIR);
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

function getConfig(env) {
    const STAKE_CONTRACT_ID = "minimous35.testnet";
    switch (env) {
        case 'production':
        case 'mainnet':
            return {
                networkId: 'mainnet',
                    nodeUrl: 'https://rpc.mainnet.near.org',
                    contractName: STAKE_CONTRACT_ID,
                    walletUrl: 'https://wallet.near.org',
                    helperUrl: 'https://helper.mainnet.near.org',
                    explorerUrl: 'https://explorer.mainnet.near.org',
            }
            case 'development':
            case 'testnet':
                return {
                    networkId: 'testnet',
                        nodeUrl: 'https://rpc.testnet.near.org',
                        contractName: STAKE_CONTRACT_ID,
                        walletUrl: 'https://wallet.testnet.near.org',
                        helperUrl: 'https://helper.testnet.near.org',
                        explorerUrl: 'https://explorer.testnet.near.org',
                }
                case 'devnet':
                    return {
                        networkId: 'devnet',
                            nodeUrl: 'https://rpc.devnet.near.org',
                            contractName: STAKE_CONTRACT_ID,
                            walletUrl: 'https://wallet.devnet.near.org',
                            helperUrl: 'https://helper.devnet.near.org',
                    }
                    case 'betanet':
                        return {
                            networkId: 'betanet',
                                nodeUrl: 'https://rpc.betanet.near.org',
                                contractName: STAKE_CONTRACT_ID,
                                walletUrl: 'https://wallet.betanet.near.org',
                                helperUrl: 'https://helper.betanet.near.org',
                        }
                        case 'local':
                            return {
                                networkId: 'local',
                                    nodeUrl: 'http://localhost:3030',
                                    keyPath: `${process.env.HOME}/.near/validator_key.json`,
                                    walletUrl: 'http://localhost:4000/wallet',
                                    contractName: STAKE_CONTRACT_ID,
                            }
                            case 'test':
                            case 'ci':
                                return {
                                    networkId: 'shared-test',
                                        nodeUrl: 'https://rpc.ci-testnet.near.org',
                                        contractName: STAKE_CONTRACT_ID,
                                        masterAccount: 'test.near',
                                }
                                case 'ci-betanet':
                                    return {
                                        networkId: 'shared-test-staging',
                                            nodeUrl: 'https://rpc.ci-betanet.near.org',
                                            contractName: STAKE_CONTRACT_ID,
                                            masterAccount: 'test.near',
                                    }
                                    default:
                                        throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`)
    }
}

const functionCall = async (account, contractName, methodName, param, deposit) => {

    let res = await account.functionCall(
        contractName,
        methodName,
        param,
        `100000000000000`,
        deposit,
    );

    return res;
}

const ft_transfer = async (account, contractName, receiverId, amount) => {
    let result = await functionCall(account, contractName, "ft_transfer", {
        "receiver_id": receiverId,
        "amount": amount.toString(),
    }, 1);

    return result;
}

const storage_deposit = async (account, contractName, accountId) => {
    let result = await functionCall(account, contractName, "storage_deposit", {
        "account_id": accountId
    }, 1);

    return result;
}

const formatToken = (amount, decimals) => {
    return amount * (10 ** decimals);
}

const main = async () => {
    let config = getConfig("development");
    let near = await nearAPI.connect(Object.assign({
        deps: {
            keyStore: keyStore
        }
    }, config));
    const account = await near.account("minimous34.testnet");
    await storage_deposit(account, "minimous35.testnet", "minimous34.testnet");
    await ft_transfer(account, "minimous35.testnet", "minimous33.testnet", formatToken(1, 8));
}

main();