import * as nearAPI from "near-api-js"
import {
    config,
    viewMethodsStaking
} from "./config";

let walletAccount;

export const loadContract = async () => {

    let keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    let near = await nearAPI.connect(Object.assign({
        deps: {
            keyStore: keyStore
        }
    }, config));


    walletAccount = new nearAPI.WalletAccount(near);
    // walletAccount = await near.account();

    let contractStaking = await near.loadContract(config.contractName, {
        // NOTE: This configuration only needed while NEAR is still in development
        // View methods are read only. They don't modify the state, but usually return some value.
        viewMethods: viewMethodsStaking,
        // Change methods can modify the state. But you don't receive the returned value when called.
        changeMethods: [],
        // Sender is the account ID to initialize transactions.
        sender: walletAccount
    });

    return contractStaking;

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

// initContract().then(async () => {
//     let totalStaked = await getTotalStaked();
//     let userStaked = await getUserStaked("minimous33.testnet");
//     let sessionInterval = await getSessionInterval();
//     let claimable = await getClaimable("minimous33.testnet");
//     console.log("totalStaked: ", totalStaked);
//     console.log("sessionInterval: ", sessionInterval);
//     console.log("userStaked: ", userStaked);
//     console.log("claimable: ", claimable);
// });