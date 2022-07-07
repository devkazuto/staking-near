import logo from "./logo.svg";
import React, { useState, useEffect } from "react";
import "./App.css";
import { loadContract } from "./utils/contract";

function App() {
  const [walletName, setWalletName] = useState("");
  const [tokenId, setTokenId] = useState(0);

  useEffect(() => {
    init();
    console.log(walletName);
    console.log(tokenId);
  }, [walletName, tokenId]);
  
  const init = async () => {
    let contract = await loadContract();
    let totalStaked = await contract.get_total_staked();
    console.log(totalStaked);
  }

  const stake = () => {
    
  };
  
  const claim = () => {
    
  };
  
  const unStake = () => {
    
  };

  return (
    <div className="App">
      <header className="App-header">
        <div class="mb-3">
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
        </div>
      </header>
    </div>
  );
}

export default App;
