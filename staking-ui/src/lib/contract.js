import * as nearAPI from "near-api-js"
import {
    config,
    viewMethodsStaking
} from "./config";
import {
    base_decode
} from 'near-api-js/lib/utils/serialize'
import {
    PublicKey
} from 'near-api-js/lib/utils'
import {
    createTransaction,
    functionCall
} from 'near-api-js/lib/transaction'

/** 
 * 
 * Begin Utils
 * 
 */

export const loadContract = async (contract_id, type) => {

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
        viewMethods: viewMethodsStaking[type],
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


export const functionCall2 = async (account, contractName, methodName, param, deposit) => {

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

export const loginNearFullAccess = async (walletAccount, accountId) => {
    walletAccount.requestSignIn(
        // The contract name that would be authorized to be called by the user's account.
        accountId,
        // '',
        // This is the app name. It can be anything.
        'App Name',
        // We can also provide URLs to redirect on success and failure.
        // The current URL is used by default.
    );
}

export const createTransaction2 = async ({
    receiverId,
    actions,
    walletAccount,
    nonceOffset = 1
}) => {
    let keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    let near = await nearAPI.connect(Object.assign({
        deps: {
            keyStore: keyStore
        }
    }, config));
    const localKey = await near.connection.signer.getPublicKey(
        walletAccount.account().accountId,
        near.connection.networkId
    )
    const accessKey = await walletAccount
        .account()
        .accessKeyForTransaction(receiverId, actions, localKey)
    if (!accessKey) {
        throw new Error(`Cannot find matching key for transaction sent to ${receiverId}`)
    }

    const block = await near.connection.provider.block({
        finality: 'final'
    })
    const blockHash = base_decode(block.header.hash)
    const publicKey = PublicKey.from(accessKey.public_key)
    const nonce = accessKey.access_key.nonce + nonceOffset

    return createTransaction(
        walletAccount.account().accountId,
        publicKey,
        receiverId,
        nonce,
        actions,
        blockHash
    )
}

export const executeMultipleTransactions = async (transactions, callbackUrl) => {
    let walletAccount = await getWalletAccount();
    const nearTransactions = await Promise.all(
        transactions.map((tx, i) =>
            createTransaction2({
                receiverId: tx.receiverId,
                nonceOffset: i + 1,
                actions: tx.functionCalls.map((fc) =>
                    functionCall(fc.methodName, fc.args, fc.gas, fc.attachedDeposit)
                ),
                walletAccount
            })
        )
    )

    // console.log(nearTransactions);
    return walletAccount.requestSignTransactions({
        transactions: nearTransactions,
        callbackUrl: callbackUrl,
    })
}

export const formatToken = (amount) => {
    return amount / 10 ** config.tokenDecimals;
}

export const parserToken = (amount) => {
    return amount * 10 ** config.tokenDecimals;
}

/**
 * 
 * End Utils
 * 
 */


/**
 * 
 * Begin contract Staking
 * 
 */

//Change Methods
export const stakeNFT = async (account, tokenId) => {

    let result = await functionCall2(account, config.nftContractName, "nft_transfer_call", {
        "receiver_id": config.stakecontractName,
        "token_id": tokenId,
        "msg": ""
    }, 1);

    return result;
}

export const unStakeNFT = async (account, tokenId) => {
    let result = await functionCall2(account, config.stakecontractName, "unstake", {
        "nft_contract_id": config.nftContractName,
        "token_id": tokenId.toString(),
    }, 1);

    return result;
}

export const claimReward = async (account) => {
    let result = await functionCall2(account, config.stakecontractName, "claim", null, 1);

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

export const getClaimableToken = async (contract, contractId, accountId, tokenId) => {
    return await contract.get_claimable_token({
        "nft_contract_id": contractId,
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
 * Begin contract NFT
 * 
 */

//view Methods
export const getSupplyForOwner = async (contract, accountId) => {
    return await contract.nft_supply_for_owner({
        "account_id": accountId
    });
}

/**
 * 
 * End contract NFT
 * 
 */

/**
 * 
 * Begin Contract FT
 * 
 */

export const ft_transfer = async (account, receiverId, amount) => {
    let result = await functionCall2(account, config.ftContractName, "ft_transfer", {
        "receiver_id": receiverId,
        "amount": amount.toString(),
    }, 1);

    return result;
}

//View Methods
export const ftBalanceOf = async (contractFT, accountId) => {
    return await contractFT.ft_balance_of({
        "account_id": accountId
    });
}

export const ftTotalSupply = async (contractFT) => {
    return await contractFT.ft_total_supply();
}

/**
 * 
 * End Contract FT
 * 
 */


/**
 * 
 * Begin Storage
 * 
 */

export const storage_deposit = async (account, contractName, accountId) => {
    let result = await functionCall2(account, contractName, "storage_deposit", {
        "account_id": accountId
    }, 1);

    return result;
}

export const storage_balance_of = async (account, contractName, accountId) => {
    let result = await account.viewFunction(contractName, "storage_balance_of", {
        account_id: accountId,
    });

    return result;
}


/**
 * 
 * End Storage
 * 
 */