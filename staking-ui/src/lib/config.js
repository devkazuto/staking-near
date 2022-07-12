import getConfig from "./near";
let config = getConfig("testnet");
const STAKE_CONTRACT_ID = process.env.STAKE_CONTRACT_ID || 'staking2.minimous34.testnet'
const NFT_CONTRACT_ID = process.env.NFT_CONTRACT_ID || 'gen0.rakkigusu.testnet'
const FT_CONTRACT_ID = process.env.FT_CONTRACT_ID || 'minimous35.testnet'

//token decimals
config.tokenDecimals = 8;

//contract
config.stakecontractName = STAKE_CONTRACT_ID;
config.nftContractName = NFT_CONTRACT_ID;
config.ftContractName = FT_CONTRACT_ID;

//GAS FEE
config.GAS_FEE = `100000000000000`
config.GAS_FEE_150 = `150000000000000`
config.GAS_FEE_200 = `200000000000000`
config.GAS_FEE_300 = `300000000000000`

//view methods
let viewMethodsStaking = {
    "STAKE": ['get_total_staked', 'get_user_staked', 'get_session_interval', 'get_claimable', 'get_claimable_token', 'get_staked'],
    "NFT": ['nft_supply_for_owner'],
    "FT": ['ft_balance_of', 'ft_total_supply', 'ft_metadata'],
};

export {
    config,
    viewMethodsStaking,
};