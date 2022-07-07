import * as nearAPI from "near-api-js"
import {
    config,
    viewMethodsStaking
} from "./config";

export const loadContract = async (contract_id) => {

    let keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    let near = await nearAPI.connect(Object.assign({
        deps: {
            keyStore: keyStore
        }
    }, config));


    let walletAccount = new nearAPI.WalletAccount(near);
    // walletAccount = await near.account();

    let contractStaking = await near.loadContract(contract_id, {
        // NOTE: This configuration only needed while NEAR is still in development
        // View methods are read only. They don't modify the state, but usually return some value.
        viewMethods: viewMethodsStaking[contract_id],
        // Change methods can modify the state. But you don't receive the returned value when called.
        changeMethods: [],
        // Sender is the account ID to initialize transactions.
        sender: walletAccount
    });

    return contractStaking;
}

export const getWalletAccount = async () => {
    let keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    let near = await nearAPI.connect(Object.assign({
        deps: {
            keyStore: keyStore
        }
    }, config));
    let walletAccount = new nearAPI.WalletAccount(near);
    
    return walletAccount;
}


export const functionCall = async (account, contractName, methodName, param, deposit) => {

    let res = await account.functionCall(
        contractName,
        methodName,
        param,
        config.GAS_FEE,
        deposit,
    );

    return res;
}

export const loginNear = async (walletAccount) => {
    walletAccount.requestSignIn(
        // The contract name that would be authorized to be called by the user's account.
        config.stakecontractName,
        // '',
        // This is the app name. It can be anything.
        'App Name',
        // We can also provide URLs to redirect on success and failure.
        // The current URL is used by default.
    );
}


/**
 * 
 * Begin contract Staking
 * 
 */

//Change Methods
export const stakeNFT = async (account, tokenId) => {

    let result = await functionCall(account, config.nftContractName, "nft_transfer_call", {
        "receiver_id": config.stakecontractName,
        "token_id": tokenId,
        "msg": ""
    }, 1);

    return result;
}

export const unStakeNFT = async (account, tokenId) => {
    let result = await functionCall(account, config.stakecontractName, "unstake", {
        "nft_contract_id": config.nftContractName,
        "token_id": tokenId
    }, 1);

    return result;
}

export const claimReward = async (account) => {
    let result = await functionCall(account, config.stakecontractName, "claim", null, 1);

    return result;
}


//View Methods
export const getTotalStaked = async (contract) => {
    return await contract.get_total_staked();
}

export const getUserStaked = async (contract) => {
    return await contract.get_user_staked();
}

export const getSessionInterval = async (contract) => {
    return await contract.get_session_interval();
}

export const getClaimable = async (contract, accountId) => {
    return await contract.get_claimable({
        "owner_id": accountId
    });
}

export const getClaimableToken = async (contract, accountId, tokenId) => {
    return await contract.get_claimable_token({
        "owner_id": accountId,
        "token_id": tokenId
    });
}

export const getStaked = async (contract, accountId) => {
    return await contract.get_staked({
        "owner_id": accountId
    });
}

/**
 * 
 * End contract Staking
 * 
 */


/**
 * 
 * Begin Contract FT
 * 
 */

//Change Methods 
export const ft_transfer = async (account, receiverId, amount) => {
    let result = await functionCall(account, config.ftContractName, "ft_transfer", {
        "receiver_id": receiverId,
        "amount": amount.toString(),
    }, 1);

    return result;
}

//View Methods
export const ftBalanceOf = async (contract, accountId) => {
    return await contract.ft_balance_of({
        "account_id": accountId
    });
}

export const ftTotalSupply = async (contract) => {
    return await contract.ft_total_supply();
}

/**
 * 
 * End Contract FT
 * 
 */