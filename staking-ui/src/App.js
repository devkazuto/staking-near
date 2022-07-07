import logo from "./logo.svg";
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [walletName, setWalletName] = useState("");
  const [tokenId, setTokenId] = useState(0);

  useEffect(() => {
    console.log(walletName);
    console.log(tokenId);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div class="mb-3">
          <label for="exampleFormControlInput1" class="form-label">
            Wallet User
          </label>
          <input
            type="text"
            class="form-control"
            id="exampleFormControlInput1"
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
            id="exampleFormControlInput1"
            placeholder="0"
            onChange={(e) => {
              setTokenId(e.target.value);
            }}
          />
        </div>
        <div class="row">
          <div class="col">
            <button type="button" class="btn btn-light">
              Stake
            </button>
          </div>
          <div class="col">
            <button type="button" class="btn btn-light">
              Claim
            </button>
          </div>
          <div class="col">
            <button type="button" class="btn btn-light">
              Unstake
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
