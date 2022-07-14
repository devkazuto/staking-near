import logo from "./logo.svg";
import React, { useState, useEffect } from "react";
import "./App.css";
import {
  claimReward,
  executeMultipleTransactions,
  ftBalanceOf,
  getClaimable,
  getStaked,
  getNftsForOwner,
  getTokenContract,
  getTotalStaked,
  getUserStaked,
  getWalletAccount,
  loadContract,
  loginNear,
  stakeNFT,
  storage_balance_of,
  unStakeNFT,
} from "./lib/contract";
import { Buffer } from "buffer";
import { config } from "./lib/config";
import { parseNearAmount } from "near-api-js/lib/utils/format";
import { sendMultipleToken } from "./utils/sendToken";
import axios from "axios";

// @ts-ignore
window.Buffer = Buffer;

function App() {
  const [walletName, setWalletName] = useState("");
  const [tokenId, setTokenId] = useState("0");

  //near state
  const [totalStaked, setTotalStaked] = useState(0);
  const [totalUserStaked, setUserStaked] = useState(0);
  const [userNftStaked, setUserNftStaked] = useState(null);
  const [claimable, setClaimable] = useState(0);
  const [contractStake, setContractStake] = useState(null);
  const [contractFt, setContractFt] = useState(null);
  const [listData, setListData] = useState();
  const [stakeData, setStakeData] = useState();
  const [walletData, setWalletData] = useState();

  useEffect(() => {
    initNear();
    // checkNft();
    // console.log(walletName);
    // console.log(tokenId);
  }, [walletName, tokenId, claimable]);

  const prepareData = async (stake) => {
    let data = await checkNft();
    let dataStake = await getStakeNft(stake);
    // var fullWordList = ["1", "2", "3", "4", "5"];
    // var wordsToRemove = ["1", "2", "3"];

    // var filteredKeywords = data.filter(
    //   (word) => !dataStake.includes(word)
    // );
    // console.log(data);
    // console.log(stake);
    // var stake = [
    //   {
    //     tokenId: "470",
    //   },
    // ];

    var result = data.filter(function (o1) {
      return !stake.some(function (o2) {
        return o1.tokenId === o2.token_id; // return the ones with equal id
      });
    });

    setWalletData(result);

    // console.log(result);
  };

  const getNft = async (res) => {
    let data = [];
    // for (let i = 0; i < res.data.data.results.length; i++) {
    //   data.push({
    //     tokenId: res.data.data.results[i].token_id,
    //     title: res.data.data.results[i].metadata.title,
    //     imageMedia: res.data.data.results[i].metadata.media,
    //   });
    // }
    for (let i = 0; i < res.length; i++) {
        data.push({
          tokenId: res[i].token_id,
          title: res[i].metadata.title,
          imageMedia: res[i].metadata.media,
        });
      }
    return data;
  };

  const getAllNft = async () => {
    let valid = true;
    let page = 0;
    let result = [];
    let contractNft = await loadContract(config.nftContractName, "NFT");
    while(valid){
      let skip = page * config.limit;
      let res = await getNftsForOwner(contractNft, window.walletAccount.getAccountId(), skip, config.limit);
      // console.log("data", res);
      for(let data of res){
        result.push(data);
      }

      if(res.length < config.limit){
        valid = false;
      }
      page++;
    }

    // console.log(result);

    return result;
  }

  const checkNft = async () => {
    let dataImage = [];
    // let res = await axios.get(
    //   `${config.apiUrl}/token?contract_id=gen0.rakkigusu.testnet&owner_id=` +
    //     "akun009.testnet"
    // );
    let res = await getAllNft();
    // console.log(res.data.data.results);
    dataImage = await getNft(res);
    setListData([dataImage]);
    return dataImage;

    // .then(async (res) => {
    //   // console.log(res.data.data.results);
    //   console.log(listData);
    //   // console.log(listData);
    // })
    // .catch((err) => {
    //   console.log(err);
    // });
  };

  const getNftMedia = async (res) => {
    let data = [];
    for (let i = 0; i < res.data.data.results.length; i++) {
      data.push({
        tokenId: res.data.data.results[i].token_id,
        title: res.data.data.results[i].metadata.title,
        imageMedia: config.base_url + res.data.data.results[i].metadata.media,
      });
    }
    // console.log(data);
    return data;
  };

  const getStakeNft = async (stake) => {
    let dataImage = [];
    // console.log(stake.length);
    // if (userNftStaked.length !== 0) {
    let contractNft = await loadContract(config.nftContractName, "NFT");
    for (let data of stake) {
      // console.log(data);
      // let res = await axios.get(
      //   `${config.apiUrl}/token?contract_id=${data.nft_contract_id}&token_id=` +
      //     data.token_id
      // );

      let res = await getTokenContract(contractNft, data.token_id);
      // console.log(res);
      dataImage.push(await getNftMedia(res));
      // console.log(dataImage);
      // return dataImage;
      // .then(async (res) => {
      //   console.log(res.data.data.results);
      //   dataImage = await getNftMedia(res);
      //   setStakeData([dataImage]);
      //   // console.log(stakeData);
      // })
      // .catch((err) => {
      //   console.log(err);
      // });
    }
    setStakeData(dataImage);
    // console.log(dataImage);
    // }
  };

  const initNear = async () => {
    let contract = await loadContract(config.stakecontractName, "STAKE");
    let contractFt = await loadContract(config.ftContractName, "FT");
    let totalStaked = await getTotalStaked(contract);
    let totalUserStakeds = await getUserStaked(contract);
    let totalUserStaked = 0;
    for (let staked of totalUserStakeds) {
      if (staked.staked > 0) totalUserStaked++;
    }

    setContractFt(contractFt);
    setContractStake(contract);
    setTotalStaked(totalStaked);
    setUserStaked(totalUserStaked);

    if (window.walletAccount.isSignedIn()) {
      let userNftStaked = await getStaked(
        contract,
        window.walletAccount.getAccountId()
      );
      let claimable = await getClaimable(
        contract,
        window.walletAccount.getAccountId()
      );

      // console.log("userNftStaked: ", userNftStaked);
      setUserNftStaked(userNftStaked);
      setClaimable(claimable);
      prepareData(userNftStaked);
    }
  };

  const stakeAll = async () => {
    // for (let i = 0; i < walletData.length; i++) {
    //   console.log(walletData[i].tokenId);
    // }
    if (window.walletAccount.isSignedIn()) {
      let txs = [];
      let deposited = await storage_balance_of(
        window.walletAccount.account(),
        config.ftContractName,
        window.walletAccount.getAccountId()
      );
      if (!deposited) {
        txs.push({
          receiverId: config.ftContractName,
          functionCalls: [
            {
              methodName: "storage_deposit",
              contractId: config.ftContractName,
              args: {
                account_id: window.walletAccount.getAccountId(),
              },
              attachedDeposit: parseNearAmount("0.0125"),
              gas: config.GAS_FEE,
            },
          ],
        });
      }

      for (let i = 0; i < walletData.length; i++) {
        txs.push({
          receiverId: config.nftContractName,
          functionCalls: [
            {
              methodName: "nft_transfer_call",
              contractId: config.nftContractName,
              args: {
                receiver_id: config.stakecontractName,
                token_id: walletData[i].tokenId,
                msg: "",
              },
              attachedDeposit: 1,
              gas: config.GAS_FEE,
            },
          ],
        });
      }

      let resp = await executeMultipleTransactions(txs);
      // let resp = await stakeNFT(walletAccount.account(), tokenId);
      console.log(resp);
    }
  };

  const stake = async (e, i) => {
    if (window.walletAccount.isSignedIn()) {
      let txs = [];
      let deposited = await storage_balance_of(
        window.walletAccount.account(),
        config.ftContractName,
        window.walletAccount.getAccountId()
      );
      if (!deposited) {
        txs.push({
          receiverId: config.ftContractName,
          functionCalls: [
            {
              methodName: "storage_deposit",
              contractId: config.ftContractName,
              args: {
                account_id: window.walletAccount.getAccountId(),
              },
              attachedDeposit: parseNearAmount("0.0125"),
              gas: config.GAS_FEE,
            },
          ],
        });
      }

      txs.push({
        receiverId: config.nftContractName,
        functionCalls: [
          {
            methodName: "nft_transfer_call",
            contractId: config.nftContractName,
            args: {
              receiver_id: config.stakecontractName,
              token_id: i,
              msg: "",
            },
            attachedDeposit: 1,
            gas: config.GAS_FEE,
          },
        ],
      });

      let resp = await executeMultipleTransactions(txs);
      // let resp = await stakeNFT(walletAccount.account(), tokenId);
      console.log(resp);
    }
  };

  const claim = async () => {
    if (window.walletAccount.isSignedIn()) {
      let balanceMaster = await ftBalanceOf(
        contractFt,
        config.stakecontractName
      );
      let claimable = await getClaimable(
        contractStake,
        window.walletAccount.getAccountId()
      );

      if (claimable > balanceMaster) {
        alert("You don't have enough tokens to claim");
        return;
      }

      let resp = await claimReward(window.walletAccount.account());
      console.log(resp);
    }
  };

  const unStake = async (e, i) => {
    if (window.walletAccount.isSignedIn()) {
      let resp = await unStakeNFT(window.walletAccount.account(), i);
      console.log(resp);
    }
  };

  const unStakeAll = async (e, i) => {
    if (window.walletAccount.isSignedIn()) {
      let txs = [];
      for (let i = 0; i < stakeData.length; i++) {
        txs.push({
          receiverId: config.stakecontractName,
          functionCalls: [
            {
              methodName: "unstake",
              contractId: config.stakecontractName,
              args: {
                nft_contract_id: config.nftContractName,
                token_id: stakeData[i][0].tokenId,
              },
              attachedDeposit: 1,
              gas: config.GAS_FEE,
            },
          ],
        });
      }

      let resp = await executeMultipleTransactions(txs);
      console.log(resp);
    }
  };

  const onLogin = async () => {
    if (window.walletAccount && window.walletAccount.isSignedIn()) {
      window.walletAccount.signOut();
      window.location.reload();
    } else {
      loginNear(window.walletAccount);
    }
  };

  const formatToken = (amount) => {
    return amount / 10 ** config.tokenDecimals;
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-light fixed-top"
        id="mainNav"
        style={{ background: "#202342" }}
      >
        <div className="container px-4 px-lg-5">
          <img
            className="img-brand logo-rakki p-2"
            src="assets/logo.png"
            width="5%"
            alt=""
          />
          <button
            className="navbar-toggler navbar-toggler-right"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarResponsive"
            aria-controls="navbarResponsive"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="fas fa-bars" aria-hidden="true"></i>
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <div
                  className="nav-link"
                  style={{ color: "#4a6cdf", alignSelf: "center" }}
                >
                  <strong>
                    {window.walletAccount
                      ? window.walletAccount.isSignedIn()
                        ? window.walletAccount._authData.accountId
                        : ""
                      : ""}
                  </strong>
                </div>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link req-button"
                  style={{ padding: "0.5rem 2rem" }}
                  onClick={onLogin}
                >
                  {window.walletAccount
                    ? window.walletAccount.isSignedIn()
                      ? "Disconnect"
                      : "Connect Wallet"
                    : "Connect Wallet"}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="App bg-list text-white">
        <div style={{ paddingTop: "10rem" }}>
          <div className="container">
            <h1 className="pb-4">Rakkigusu Staking</h1>
            <div className="row">
              <div className="col">
                <div className="bg-card p-3">
                  <label className="form-label" style={{ margin: "0" }}>
                    Total Staked: {totalStaked}
                  </label>
                </div>
              </div>
              <div className="col">
                <div className="bg-card p-3">
                  <label className="form-label" style={{ margin: "0" }}>
                    Total User Staked: {totalUserStaked}
                  </label>
                </div>
              </div>
              <div className="col">
                <div className="bg-card p-3">
                  <label className="form-label" style={{ margin: "0" }}>
                    Your Stake Reward: {formatToken(claimable)}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div
            className="row container"
            style={{
              width: "100%",
              margin: "0 auto",
              alignItems: "center",
              paddingTop: "2rem",
            }}
          >
            <div className="col-sm-6">
              <div className="bg-card p-4">
                <h3 className="text-start">Wallet:</h3>
                {walletData ? (
                  <div className="row scroll-control">
                    {/* {walletData.map((item, i) => (
                      <> */}
                    {walletData.map((item) => (
                      <div className="col-sm-4">
                        <div className="mb-3">
                          <img width="100%" src={item.imageMedia} />
                          <label>{item.title}</label>
                        </div>
                        <button
                          type="button"
                          className="btn req-button mb-3"
                          style={{ padding: "0.5rem", margin: "0" }}
                          onClick={(e) => {
                            stake(e, item.tokenId);
                          }}
                        >
                          Stake
                        </button>
                      </div>
                    ))}
                    {/* </>
                    ))} */}
                  </div>
                ) : (
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn req-button mt-3"
                style={{ padding: "0.5rem", margin: "0" }}
                onClick={stakeAll}
              >
                Stake All
              </button>
            </div>
            <div className="col-sm-6">
              <div className="bg-card p-4">
                <h3 className="text-start">Staked:</h3>
                {stakeData ? (
                  <div className="row scroll-control">
                    {stakeData.map((item, i) => (
                      <>
                        {item.map((data, index) => (
                          <div className="col-sm-4">
                            <div className="mb-3">
                              <img width="100%" src={item[index].imageMedia} />
                              <label>{item[index].title}</label>
                            </div>
                            <div className="row mb-3">
                              <div className="col-sm-6">
                                <button
                                  type="button"
                                  className="btn req-button"
                                  style={{
                                    padding: "0.5rem 1.1rem",
                                    margin: "0",
                                  }}
                                  onClick={claim}
                                >
                                  Claim
                                </button>
                              </div>
                              <div className="col-sm-6">
                                <button
                                  type="button"
                                  className="btn req-button"
                                  style={{ padding: "0.5rem", margin: "0" }}
                                  onClick={(e) => {
                                    unStake(e, item[index].tokenId);
                                  }}
                                >
                                  Unstake
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ))}
                  </div>
                ) : (
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn req-button mt-3"
                style={{ padding: "0.5rem", margin: "0" }}
                onClick={unStakeAll}
              >
                Unstake All
              </button>
              {/* <header className="App-header">
                <div className="mb-3">
                  <br />
                  <label for="exampleFormControlInput1" className="form-label">
                    {walletName}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="user.testnet"
                    onChange={(e) => {
                      setWalletName(e.target.value);
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label for="exampleFormControlInput1" className="form-label">
                    Token ID 0
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="0"
                    onChange={(e) => {
                      setTokenId(e.target.value);
                    }}
                  />
                </div>
                <div className="row">
                  <div className="col">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={stake}
                    >
                      Stake
                    </button>
                  </div>
                  <div className="col">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={claim}
                    >
                      Claim
                    </button>
                  </div>
                  <div className="col">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={unStake}
                    >
                      Unstake
                    </button>
                  </div>
                  <div className="col">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={onLogin}
                    >
                      {walletAccount
                        ? walletAccount.isSignedIn()
                          ? "Logout"
                          : "Login"
                        : "Login"}
                    </button>
                  </div>
                  <div className="col">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={sendToken}
                    >
                      Send Token
                    </button>
                  </div>
                </div>
              </header> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
