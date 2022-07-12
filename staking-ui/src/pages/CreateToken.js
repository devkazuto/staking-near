import React, { useState, useEffect } from "react";
import "../App.css";
import { Buffer } from "buffer";
import { checkAccount, getBase64FromUrl, parserTokenCustom } from "../lib/utils";
import { executeMultipleTransactions, functionCall2, getWalletAccount, loadContract, loginNear, loginNearFullAccess } from "../lib/contract";
import * as nearAPI from "near-api-js"
import { config } from "../lib/config";
import WASM_FT_TOKEN from "./../storage/fungible_token.wasm";
import { sendMultipleNear, sendMultipleToken } from "../utils/sendToken";

// @ts-ignore
window.Buffer = Buffer;

// const WASM_FT_TOKEN = require("./../storage/fungible_token.wasm");

function CreateToken() {
  const [account, setAccount] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  const [decimal, setDecimal] = useState(0);
  const [icon, setIcon] = useState("https://images.squarespace-cdn.com/content/v1/58c70bf803596e1ab1be3451/1551732801079-I4T3QWZW74QRZGGCCMQB/Screen+Shot+2019-03-04+at+12.14.27+PM.png");

  useEffect(() => {
    initNear();
    console.log(account);
    console.log(tokenName);
    console.log(tokenSymbol);
    console.log(totalSupply);
    console.log(decimal);
    console.log(icon);
  }, [account, tokenName, tokenSymbol, totalSupply, decimal, icon]);

  const initNear = async () => {
  }

  const createToken = async () => {
    //  let resp = await checkAccount(walletAccount.getAccountId()); 
    //  console.log(resp);

    let icon_base64 = await getBase64FromUrl(icon);
    console.log(icon_base64);

    const data = await fetch("https://bafkreiblr7jjj5vwq2xjww6klqgr2oubjyyce7idby4jmnbvuoff2fmz5a.ipfs.nftstorage.link");
    const blob = await data.blob();
    const buffer = await blob.arrayBuffer();
    var uint8View = new Uint8Array(buffer);
    console.log(uint8View);

    const txs = [];
    let keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    const keyPair = nearAPI.KeyPair.fromRandom("ed25519");
    const publicKey = keyPair.publicKey.toString();
    await keyStore.setKey(config.networkId, account, keyPair);
    let nearNew = await nearAPI.connect(Object.assign({
      deps: {
        keyStore: keyStore
      }
    }, config));

    //create account
    await window.walletAccount.account().createAccount(
      account, // new account name
      publicKey, // public key for new account
      "10000000000000000000000000" // initial balance for new account in yoctoNEAR
    );

    const accountFt = await nearNew.account(account);
    let res = await accountFt.deployContract(uint8View);
    console.log(res);

    // let contractFt = await loadContract(account, "FT");
    let resp = await functionCall2(accountFt,
      account,
      "new", {
      "owner_id": window.walletAccount.getAccountId(),
      "total_supply": parserTokenCustom(totalSupply, decimal).toString(),
      "metadata": {
        "spec": "ft-1.0.0",
        "name": tokenName.toString(),
        "symbol": tokenSymbol.toString(),
        "decimals": parseInt(decimal),
        "icon": icon_base64.toString()
      }
    }, 0);

    console.log(resp);

  };

  const loadFile = (filePath) => {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
      result = xmlhttp.responseText;
    }
    return result;
  }

  const onLogin = async () => {
    if (window.walletAccount && window.walletAccount.isSignedIn()) {
      window.walletAccount.signOut();
      window.location.reload();
    } else {
      loginNear(window.walletAccount);
    }
  }

  const onLoginFullAccess = async () => {
    if (window.walletAccount && window.walletAccount.isSignedIn()) {
      let accountId = window.walletAccount.getAccountId();
      window.walletAccount.signOut();
      loginNearFullAccess(window.walletAccount, accountId);
    } else {
      alert("Please sign in to your NEAR account");
    }
  }

  const sendToken = async () => {
    if (window.walletAccount.isSignedIn()) {
      let data = [
        {
          wallet_id: "minimous36.testnet",
          amount: 1,
        },
        {
          wallet_id: "minimous35.testnet",
          amount: 1,
        },
      ];

      let resp = await sendMultipleNear(data);
      console.log(resp);
    } else {
      alert("Please login first");
    }
  };


  return (
    <div className="App">
      <header className="App-header">
        <div class="mb-4">
          <label for="exampleFormControlInput1" class="form-label">
            Owner Id
          </label>
          <input
            type="text"
            class="form-control"
            onChange={(e) => {
              setAccount(e.target.value);
            }}
          />
        </div>
        <div class="mb-4">
          <label for="exampleFormControlInput1" class="form-label">
            Token Name
          </label>
          <input
            type="text"
            class="form-control"
            onChange={(e) => {
              setTokenName(e.target.value);
            }}
          />
        </div>
        <div class="mb-4">
          <label for="exampleFormControlInput1" class="form-label">
            Token Symbol
          </label>
          <input
            type="text"
            class="form-control"
            onChange={(e) => {
              setTokenSymbol(e.target.value);
            }}
          />
        </div>
        <div class="mb-4">
          <label for="exampleFormControlInput1" class="form-label">
            Total Supply
          </label>
          <input
            type="text"
            class="form-control"
            onChange={(e) => {
              setTotalSupply(e.target.value);
            }}
          />
        </div>
        <div class="mb-4">
          <label for="exampleFormControlInput1" class="form-label">
            Decimal
          </label>
          <input
            type="text"
            class="form-control"
            onChange={(e) => {
              setDecimal(e.target.value);
            }}
          />
        </div>
        <div class="mb-4">
          <label for="exampleFormControlInput1" class="form-label">
            Icon
          </label>
          <input
            type="text"
            class="form-control"
            placeholder="https://images.squarespace-cdn.com/content/v1/58c70bf803596e1ab1be3451/1551732801079-I4T3QWZW74QRZGGCCMQB/Screen+Shot+2019-03-04+at+12.14.27+PM.png"
            onChange={(e) => {
              setIcon(e.target.value);
            }}
          />
        </div>
        <div class="col">
          <button type="button" class="btn btn-light" onClick={createToken}>
            Create
          </button>
          <button type="button" class="btn btn-light" onClick={onLogin}>
            {window.walletAccount ? window.walletAccount.isSignedIn() ? 'Logout' : 'Login' : 'Login'}
          </button>
          <button type="button" class="btn btn-light" onClick={onLoginFullAccess}>
            Full Access
          </button>
          <button type="button" class="btn btn-light" onClick={sendToken}>
            Send Near
          </button>
        </div>
      </header>
    </div>
  );
}

export default CreateToken;
