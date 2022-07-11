import React, { useState, useEffect } from "react";
import "../App.css";
import { Buffer } from "buffer";

// @ts-ignore
window.Buffer = Buffer;

function CreateToken() {
  const [account, setAccount] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  const [decimal, setDecimal] = useState("");
  const [icon, setIcon] = useState("https://images.squarespace-cdn.com/content/v1/58c70bf803596e1ab1be3451/1551732801079-I4T3QWZW74QRZGGCCMQB/Screen+Shot+2019-03-04+at+12.14.27+PM.png");

  useEffect(() => {
    console.log(account);
    console.log(tokenName);
    console.log(tokenSymbol);
    console.log(totalSupply);
    console.log(decimal);
    console.log(icon);
  }, [account, tokenName, tokenSymbol, totalSupply, decimal, icon]);

  const createToken = () => {
     
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
        <button type="button" class="btn btn-light" onClick={createToken}>
          Create
        </button>
      </header>
    </div>
  );
}

export default CreateToken;
