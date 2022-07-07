use std::collections::HashMap;

use near_contract_standards::non_fungible_token::TokenId;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::Serialize;
use near_sdk::{collections::*, Gas};
use near_sdk::{
    env, ext_contract, json_types::U128, log, near_bindgen, AccountId, PanicOnDefault, Promise,
    Timestamp,
};

mod nft_callbacks;

pub const GAS_FOR_FT_TRANSFER: Gas = 10_000_000_000_000;
pub const GAS_FOR_NFT_TRANSFER: Gas = 20_000_000_000_000;

// pub const DENOM: u128 = 1_000_000_000_000_000_000_000_000;
pub const DENOM: u128 = 100_000_000;
pub type TimestampSec = u32;
pub const DELIMETER: &str = "||";
pub const NFT_DELIMETER: &str = "@";

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    owner_id: AccountId,
    nft_account: AccountId,
    ft_account: AccountId,
    session_interval: TimestampSec,
    nft_balance: Option<HashMap<String, U128>>,
    nft_contract_ids: UnorderedSet<AccountId>,
    user_staked: HashMap<AccountId, u64>,
    staked: UnorderedMap<AccountId, Vector<Stake>>,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct NftBalance {
    token_id: TokenId,
    balance: U128,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct UserStaked {
    account_id: AccountId,
    staked: u64,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Clone)]
// #[derive(Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Stake {
    timestamp: u64,
    nft_contract_id: AccountId,
    token_id: TokenId,
    staked_id: String,
    owner_id: AccountId,
}

#[derive(BorshSerialize)]
pub enum StorageKey {
    Stakedkey,
    NewVec,
    NftContractIds,
    NftBalanceKey,
    NftUserStakedKey,
}

pub trait From<T> {
    /// Performs the conversion.
    #[must_use]
    fn from_cross_str(_: T) -> Self;
}

impl From<&str> for near_sdk::AccountId {
    /// Converts a `&mut str` into a [`String`].
    ///
    /// The result is allocated on the heap.
    #[inline]
    fn from_cross_str(s: &str) -> near_sdk::AccountId {
        s.parse().unwrap()
    }
}

// impl Default for near_sdk::AccountId {
//     /// Creates an empty `String`.
//     #[inline]
//     fn default() -> near_sdk::AccountId {
//         near_sdk::AccountId::from_cross_str("")
//     }
// }

// One can provide a name, e.g. `ext` to use for generated methods.
#[ext_contract(nftext)]
pub trait NFTCrossContract {
    fn nft_transfer(
        &self,
        sender_id: AccountId,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: Option<u64>,
        memo: Option<String>,
    ) -> (AccountId, Option<HashMap<AccountId, u64>>);
}

#[ext_contract(ftext)]
pub trait FTCrossContract {
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
}

#[near_bindgen]
impl Contract {
    // Default Constructor
    #[init]
    pub fn new(
        owner_id: AccountId,
        ft_account: AccountId,
        nft_account: AccountId,
        session_interval: TimestampSec,
        nft_balance: Option<HashMap<String, U128>>,
    ) -> Self {
        Self {
            owner_id: owner_id.into(),
            ft_account: ft_account.into(),
            nft_account: nft_account.into(),
            session_interval: session_interval.into(),
            nft_balance: nft_balance.into(),
            nft_contract_ids: UnorderedSet::new(StorageKey::NftContractIds.try_to_vec().unwrap()),
            user_staked: HashMap::new(),
            staked: UnorderedMap::new(StorageKey::Stakedkey.try_to_vec().unwrap()),
        }
    }

    //setter
    #[payable]
    pub fn set_session_interval(&mut self, session_interval: TimestampSec) {
        self.assert_owner();
        self.claim_all();
        self.session_interval = session_interval.into();
    }

    #[payable]
    pub fn set_ft_account(&mut self, ft_account: AccountId) {
        self.assert_owner();
        self.ft_account = ft_account.into();
    }

    #[payable]
    pub fn set_nft_account(&mut self, nft_account: AccountId) {
        self.assert_owner();
        self.nft_account = nft_account.into();
    }

    #[payable]
    pub fn add_nft_contract_ids(&mut self, nft_contract_id: AccountId) {
        self.assert_owner();
        self.nft_contract_ids.insert(&nft_contract_id);
    }

    #[payable]
    pub fn remove_nft_contract_ids(&mut self, nft_contract_id: AccountId) {
        self.assert_owner();
        self.nft_contract_ids.remove(&nft_contract_id);
    }

    #[payable]
    pub fn set_owner_id(&mut self, owner_id: AccountId) {
        self.assert_owner();
        self.owner_id = owner_id.into();
    }

    pub fn add_nft_balance(&mut self, nft_contract_and_token_id: String, balance: U128) {
        self.assert_owner();
        self.nft_balance
            .as_mut()
            .unwrap()
            .insert(nft_contract_and_token_id, balance);
    }

    //getter
    pub fn get_session_interval(&self) -> TimestampSec {
        return self.session_interval.clone();
    }

    pub fn get_ft_account(&self) -> AccountId {
        return self.ft_account.clone();
    }

    pub fn get_nft_account(&self) -> AccountId {
        return self.nft_account.clone();
    }

    pub fn get_nft_contract_ids(&self) -> Vec<AccountId> {
        self.nft_contract_ids.to_vec()
    }

    pub fn get_owner_id(&self) -> AccountId {
        return self.owner_id.clone();
    }

    pub fn get_nft_balance(&self) -> Vec<NftBalance> {
        let mut tmp: Vec<NftBalance> = vec![];

        for (k, v) in self.nft_balance.clone().unwrap() {
            tmp.push(NftBalance {
                token_id: k.to_string(),
                balance: v,
            });
        }

        return tmp.to_vec();
    }

    //utils
    pub(crate) fn to_sec(timestamp: Timestamp) -> TimestampSec {
        (timestamp / 10u64.pow(9)) as u32
    }

    //staking
    // pub(crate)
    pub(crate) fn stake(
        &mut self,
        nft_contract_id: AccountId,
        token_id: TokenId,
        owner_id: AccountId,
    )
    /*  -> PromiseOrValue<TokenId>  */
    {
        //nftext::nft_transfer_call(&self, tokenId, "Stake NFT");
        // let caller = env::predecessor_account_id();
        let caller = owner_id.into();
        let current_timestamp = env::block_timestamp();
        //let mut _staked = self.staked.get(&caller).unwrap().clone();
        let contract_and_token_id = format!("{}{}{}", nft_contract_id, DELIMETER, token_id);
        match self.staked.get(&caller) {
            Some(mut _staked) => {
                _staked.push(&Stake {
                    timestamp: current_timestamp,
                    nft_contract_id: nft_contract_id.clone(),
                    token_id: token_id.clone(),
                    staked_id: contract_and_token_id.clone(),
                    owner_id: caller.clone(),
                });
                self.staked.insert(&caller, &_staked);
                self.user_staked.insert(caller, _staked.len());
            }
            None => {
                let mut new_vec: Vector<Stake> =
                    Vector::new(StorageKey::NewVec.try_to_vec().unwrap());
                new_vec.push(&Stake {
                    timestamp: current_timestamp,
                    nft_contract_id: nft_contract_id.clone(),
                    token_id: token_id.clone(),
                    staked_id: contract_and_token_id.clone(),
                    owner_id: caller.clone(),
                });
                self.staked.insert(&caller, &new_vec);
                self.user_staked.insert(caller, new_vec.len());
            }
        }
        // -----------------------------------------------------
    }

    #[payable]
    pub fn unstake(&mut self, nft_contract_id: AccountId, token_id: TokenId) {
        // let owner = env::current_account_id();
        let caller = env::predecessor_account_id();
        let prev_owner = caller.clone();
        let contract_and_token_id = format!("{}{}{}", nft_contract_id, DELIMETER, token_id);

        //claim all reward before unstake
        self.claim();

        match self.staked.get(&caller) {
            Some(mut _staked) => {
                let end = _staked.len();
                let mut new_vec: Vector<Stake> =
                    Vector::new(StorageKey::NewVec.try_to_vec().unwrap());
                for i in 0..end {
                    let _ele = _staked.get(i).unwrap();
                    if _ele.staked_id != contract_and_token_id {
                        new_vec.push(&_ele);
                    }
                }

                self.staked.insert(&caller, &new_vec);
                self.user_staked.insert(caller, new_vec.len());

                nftext::nft_transfer(
                    self.nft_account.clone(),
                    prev_owner,
                    token_id.into(),
                    Some(1u64),
                    Some(String::from("Unstake NFT")),
                    &self.nft_account.clone(),   // contract account id
                    1,                           // yocto NEAR to attach
                    GAS_FOR_NFT_TRANSFER.into(), // gas to attach
                );
            }

            None => {
                log!("You didn't stake any token at all.");
            }
        }
    }

    #[payable]
    #[result_serializer(borsh)]
    pub fn claim(&mut self) {
        let caller = env::predecessor_account_id();
        let current_timestamp = env::block_timestamp();
        match self.staked.get(&caller) {
            Some(mut _staked) => {
                let end = _staked.len();
                let mut reward = 0;
                let mut new_vec: Vector<Stake> =
                    Vector::new(StorageKey::NewVec.try_to_vec().unwrap());
                for i in 0..end {
                    let mut ele = _staked.get(i).unwrap();
                    let nft_contract_and_token_id =
                        format!("{}{}{}", ele.nft_contract_id, NFT_DELIMETER, ele.token_id);
                    let amount = self
                        .nft_balance
                        .as_ref()
                        .unwrap()
                        .get(&nft_contract_and_token_id)
                        .unwrap()
                        .to_owned();
                    reward += u128::from(
                        (Contract::to_sec(current_timestamp) - Contract::to_sec(ele.timestamp))
                            / self.session_interval,
                    ) * u128::from(amount);

                    ele.timestamp = current_timestamp;
                    new_vec.push(&ele);
                }

                self.staked.insert(&caller, &new_vec);
                // log!("{}", reward);

                ftext::ft_transfer(
                    env::predecessor_account_id().clone(),
                    reward.into(),
                    Some(String::from("claim reward")),
                    &self.ft_account.clone(), // contract account id
                    1,                        // yocto NEAR to attach
                    GAS_FOR_FT_TRANSFER.into(),      // gas to attach
                );
            }
            None => {
                log!("You are not valid claimer.");
            }
        }
    }

    #[private]
    #[result_serializer(borsh)]
    pub fn claim_all(&mut self) {
        // let caller = env::predecessor_account_id();
        let user_staked = self.user_staked.clone();
        for caller in user_staked.into_keys() {
            let current_timestamp = env::block_timestamp();
            match self.staked.get(&caller) {
                Some(mut _staked) => {
                    let end = _staked.len();
                    let mut reward = 0;
                    let mut new_vec: Vector<Stake> =
                        Vector::new(StorageKey::NewVec.try_to_vec().unwrap());
                    for i in 0..end {
                        let mut ele = _staked.get(i).unwrap();
                        let nft_contract_and_token_id =
                            format!("{}{}{}", ele.nft_contract_id, NFT_DELIMETER, ele.token_id);
                        let amount = self
                            .nft_balance
                            .as_ref()
                            .unwrap()
                            .get(&nft_contract_and_token_id)
                            .unwrap()
                            .to_owned();
                        reward += u128::from(
                            (Contract::to_sec(current_timestamp) - Contract::to_sec(ele.timestamp))
                                / self.session_interval,
                        ) * u128::from(amount);

                        ele.timestamp = current_timestamp;
                        new_vec.push(&ele);
                    }

                    self.staked.insert(&caller, &new_vec);
                    log!("{}", reward);

                    // ftext::ft_transfer(
                    //     env::predecessor_account_id().clone(),
                    //     reward.into(),
                    //     Some(String::from("claim reward")),
                    //     self.ft_account.clone(),           // contract account id
                    //     1,                                 // yocto NEAR to attach
                    //     near_sdk::Gas(10_000_000_000_000), // gas to attach
                    // );
                }
                None => {
                    log!("You are not valid claimer.");
                }
            }
        }
    }

    //view

    pub fn get_claimable_token(
        &self,
        nft_contract_id: AccountId,
        token_id: TokenId,
        owner_id: AccountId,
    ) -> u128 {
        // let caller = env::predecessor_account_id();
        let contract_and_token_id = format!("{}{}{}", nft_contract_id, DELIMETER, token_id);
        let current_timestamp = env::block_timestamp();
        let mut reward = 0;
        match self.staked.get(&owner_id) {
            Some(mut _staked) => {
                let end = _staked.len();
                for i in 0..end {
                    let _ele = _staked.get(i).unwrap();
                    if _ele.staked_id == contract_and_token_id {
                        let nft_contract_and_token_id =
                            format!("{}{}{}", _ele.nft_contract_id, NFT_DELIMETER, _ele.token_id);
                        let amount = self
                            .nft_balance
                            .as_ref()
                            .unwrap()
                            .get(&nft_contract_and_token_id)
                            .unwrap()
                            .to_owned();

                        reward += u128::from(
                            (Contract::to_sec(current_timestamp)
                                - Contract::to_sec(_ele.timestamp))
                                / self.session_interval,
                        ) * u128::from(amount);
                    }
                }

                if reward == 0 {
                    return 0;
                }

                return (reward).into();
            }
            None => {
                log!("{}", "Cannot get claimable amount");
                return 0;
            }
        }
    }

    pub fn get_claimable(&self, owner_id: AccountId) -> u128 {
        // let caller = env::predecessor_account_id();
        let current_timestamp = env::block_timestamp();
        let mut reward = 0;
        match self.staked.get(&owner_id) {
            Some(mut _staked) => {
                let end = _staked.len();
                for i in 0..end {
                    let _ele = _staked.get(i).unwrap();
                    let nft_contract_and_token_id =
                        format!("{}{}{}", _ele.nft_contract_id, NFT_DELIMETER, _ele.token_id);
                    let amount = self
                        .nft_balance
                        .as_ref()
                        .unwrap()
                        .get(&nft_contract_and_token_id)
                        .unwrap()
                        .to_owned();

                    reward += u128::from(
                        (Contract::to_sec(current_timestamp) - Contract::to_sec(_ele.timestamp))
                            / self.session_interval,
                    ) * u128::from(amount);
                }

                if reward == 0 {
                    return 0;
                }

                return (reward).into();
            }
            None => {
                log!("{}", "Cannot get claimable amount");
                return 0;
            }
        }
    }

    pub fn get_staked(&self, owner_id: AccountId) -> Vec<Stake> {
        // return self.staked.get(&owner_id).unwrap().to_vec();

        match self.staked.get(&owner_id) {
            Some(mut _staked) => {
                return _staked.to_vec();
            }

            None => {
                return vec![];
            }
        }
    }

    pub fn get_user_staked(&self) -> Vec<UserStaked> {
        let mut tmp: Vec<UserStaked> = vec![];

        for (k, v) in self.user_staked.clone() {
            tmp.push(UserStaked {
                account_id: k,
                staked: v,
            });
        }

        return tmp.to_vec();
    }

    pub fn get_total_staked(&self) -> u64 {
        let mut total_staked = 0;

        for v in self.user_staked.clone().into_values() {
            total_staked += v;
        }

        return total_staked;
    }

    pub fn get_total_user_staked(&self, owner_id: AccountId) -> u64 {
        for (k, v) in self.user_staked.clone() {
            if k == owner_id {
                return v;
            }
        }

        return 0;
    }

    pub(crate) fn assert_owner(&self) {
        assert_eq!(
            &env::predecessor_account_id(),
            &self.owner_id,
            "Owner's method"
        );
    }

    pub fn transfer_money(&mut self, account_id: AccountId, amount: u64) {
        Promise::new(account_id).transfer(amount as u128);
    }
}
