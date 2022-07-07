import logo from "./logo.svg";
import React, { useState, useEffect } from "react";
import "./App.css";
import { claimReward, executeMultipleTransactions, getClaimable, getTotalStaked, getUserStaked, getWalletAccount, loadContract, loginNear, stakeNFT, storage_balance_of, unStakeNFT } from "./lib/contract";
import { Buffer } from 'buffer';
import { config } from "./lib/config";
import { parseNearAmount } from "near-api-js/lib/utils/format";

// @ts-ignore
window.Buffer = Buffer;

function App() {
  const [walletName, setWalletName] = useState("");
  const [tokenId, setTokenId] = useState(0);

  //near state
  const [totalStaked, setTotalStaked] = useState(0);
  const [userStaked, setUserStaked] = useState(0);
  const [claimable, setClaimable] = useState(0);
  const [contractStake, setContractStake] = useState(null);
  const [walletAccount, setWalletAccount] = useState(null);

  useEffect(() => {
    initNear();
    console.log(walletName);
    console.log(tokenId);
  }, [walletName, tokenId, claimable]);
  
  const initNear = async () => {
    let walletAccount = await getWalletAccount();
    let contract = await loadContract(config.stakecontractName);
    let totalStaked = await getTotalStaked(contract);
    let userStakeds = await getUserStaked(contract);
    let userStaked = 0;
    for(let staked of userStakeds){
      if(staked.staked > 0) userStaked++;
    }

    
    setContractStake(contract);
    setTotalStaked(totalStaked);
    setWalletAccount(walletAccount);
    setUserStaked(userStaked);
    
    if(walletAccount.isSignedIn()){
      let claimable = await getClaimable(contract, walletAccount.getAccountId());
      setClaimable(claimable);
    }
  }

  const stake = async () => {
      if(walletAccount.isSignedIn()){
        let txs = [];
        let deposited = await storage_balance_of(walletAccount.account(), config.ftContractName, walletAccount.getAccountId());
        if(!deposited){
          txs.push({
            receiverId: config.ftContractName,
            functionCalls: [
              {
                methodName: 'storage_deposit',
                contractId: config.ftContractName,
                args: {
                  account_id: walletAccount.getAccountId(),
                },
                attachedDeposit: parseNearAmount('0.0125'),
                gas: config.GAS_FEE,
              },
            ],
          })
        }
        
        txs.push({
          receiverId: config.nftContractName,
          functionCalls: [
            {
              methodName: 'nft_transfer_call',
              contractId: config.nftContractName,
              args: {
                "receiver_id": config.stakecontractName,
                "token_id": tokenId,
                "msg": ""
              },
              attachedDeposit: 1,
              gas: config.GAS_FEE,
            },
          ],
        })

        let resp = await executeMultipleTransactions(txs);
        // let resp = await stakeNFT(walletAccount.account(), tokenId);
        console.log(resp);
      }
  };
  
  const claim = async () => {
    if(walletAccount.isSignedIn()){
      let resp = await claimReward(walletAccount.account());
      console.log(resp);
    }
  };
  
  const unStake = async () => {
    if(walletAccount.isSignedIn()){
      let resp = await unStakeNFT(walletAccount.account(), tokenId);
      console.log(resp);
    }
  };

  const onLogin = async () => {
    if(walletAccount && walletAccount.isSignedIn()){
      walletAccount.signOut();
      window.location.reload();
    } else {
      loginNear(walletAccount);
    }
  }

  const formatToken = (amount) => {
    return amount / 10 ** config.tokenDecimals;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div class="mb-3">
        <label class="form-label" >Total Staked: {totalStaked}</label>
        <br />
        <label class="form-label" >Total User Staked: {userStaked}</label>
        <br />
        <label class="form-label" >Reward: {formatToken(claimable)}</label>
        <br />
          <label for="exampleFormControlInput1" class="form-label">
            {walletName}
          </label>
          <input
            type="text"
            class="form-control"
            placeholder="user.testnet"
            onChange={(e) => {
              setWalletName(e.target.value);
            }}
          />
        </div>
        <div class="mb-3">
          <label for="exampleFormControlInput1" class="form-label">
            Token ID 0
          </label>
          <input
            type="text"
            class="form-control"
            placeholder="0"
            onChange={(e) => {
              setTokenId(e.target.value);
            }}
          />
        </div>
        <div class="row">
          <div class="col">
            <button type="button" class="btn btn-light" onClick={stake}>
              Stake
            </button>
          </div>
          <div class="col">
            <button type="button" class="btn btn-light" onClick={claim}>
              Claim
            </button>
          </div>
          <div class="col">
            <button type="button" class="btn btn-light" onClick={unStake}>
              Unstake
            </button>
          </div>
          <div class="col">
            <button type="button" class="btn btn-light" onClick={onLogin}>
              { walletAccount ? walletAccount.isSignedIn() ? 'Logout' : 'Login' : 'Login' }
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
