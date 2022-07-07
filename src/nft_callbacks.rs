use near_contract_standards::non_fungible_token::core::NonFungibleTokenReceiver;
use near_sdk::{serde::Deserialize, PromiseOrValue};
use crate::*;

/// approval callbacks from NFT Contracts

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct StakingArgs {
}

trait NonFungibleTokenApprovalsReceiver {
    fn nft_on_approve(
        &mut self,
        token_id: TokenId,
        owner_id: AccountId,
        approval_id: u64,
        msg: String,
    );
}

//I already adjusted this function and you can see if someone try to approve his nft to this contract,
//This contract consider it as staking and transfer the nft from owner to this contract and register info.

// Receiving NFTs
#[near_bindgen]
impl NonFungibleTokenReceiver for Contract {
    fn nft_on_transfer(
        &mut self,
        sender_id: AccountId,
        previous_owner_id: AccountId,
        token_id: TokenId,
        msg: String,
    ) -> PromiseOrValue<bool> {
        let nft_contract_id = env::predecessor_account_id();
        let signer_id = env::signer_account_id();

        assert_ne!(
            nft_contract_id, signer_id,
            "Paras(farming): nft_on_approve should only be called via cross-contract call"
        );

        assert_eq!(
            previous_owner_id,
            signer_id,
            "Paras(farming): owner_id should be signer_id"
        );

        // log!("{}{}{}{}{}", nft_contract_id, DELIMETER, token_id, DELIMETER, signer_id);
        assert!(
            self.nft_contract_ids.contains(&nft_contract_id),
            "nft_contract not registered"
        );

        self.stake(nft_contract_id, token_id, signer_id);
        PromiseOrValue::Value(false)
    }
}