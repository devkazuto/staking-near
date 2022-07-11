let STAKE_CONTRACT_ID = process.env.STAKE_CONTRACT_ID || 'staking2.minimous34.testnet'
let API_URL_PARAS = process.env.API_URL_PARAS || 'https://api-v2-mainnet.paras.id'
export default function getConfig(env) {
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
				apiUrl: API_URL_PARAS,
			}
		case 'development':
		case 'testnet':
			API_URL_PARAS = process.env.API_URL_PARAS || 'https://api-v3-marketplace-develop.paras.id'
			return {
				networkId: 'testnet',
				nodeUrl: 'https://rpc.testnet.near.org',
				contractName: STAKE_CONTRACT_ID,
				walletUrl: 'https://wallet.testnet.near.org',
				helperUrl: 'https://helper.testnet.near.org',
				explorerUrl: 'https://explorer.testnet.near.org',
				apiUrl: API_URL_PARAS,
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

// module.exports = getConfig
