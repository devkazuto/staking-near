import {
  parseNearAmount
} from "near-api-js/lib/utils/format";
import {
  config
} from "../lib/config";
import {
  executeMultipleTransactions,
  executeMultipleTransferNear,
  ftMetadata,
  loadContract,
  parserToken,
  storage_balance_of
} from "../lib/contract";


// let data = [
//   {
//     wallet_id: "minimous36.testnet",
//     amount: 1,
//   },
//   {
//     wallet_id: "minimous35.testnet",
//     amount: 1,
//   },
// ];
export const sendMultipleToken = async (walletAccount, dataJson, contractFtId = config.ftContractName) => {

  let contractFT = await loadContract(contractFtId, "FT");
  let ft_metadata = await ftMetadata(contractFT);

  let txs = [];
  for (let data of dataJson) {
    let deposited = await storage_balance_of(walletAccount.account(), contractFtId, data["wallet_id"]);
    if (!deposited) {
      txs.push({
        receiverId: contractFtId,
        functionCalls: [{
          methodName: 'storage_deposit',
          contractId: walletAccount.getAccountId(),
          args: {
            account_id: data["wallet_id"],
          },
          attachedDeposit: parseNearAmount('0.0125'),
          gas: config.GAS_FEE,
        }, ],
      })
    }

    txs.push({
      receiverId: contractFtId,
      functionCalls: [{
        methodName: 'ft_transfer',
        contractId: walletAccount.getAccountId(),
        args: {
          "receiver_id": data["wallet_id"],
          "amount": parserToken(data["amount"], ft_metadata.decimals).toString(),
        },
        attachedDeposit: 1,
        gas: config.GAS_FEE,
      }, ],
    })
  };

  let resp = await executeMultipleTransactions(txs);
  return resp;

}

// let data = [
//   {
//     wallet_id: "minimous36.testnet",
//     amount: 1,
//   },
//   {
//     wallet_id: "minimous35.testnet",
//     amount: 1,
//   },
// ];
export const sendMultipleNear = async (dataJson) => {
  const txs = [];

  for (let data of dataJson) {
    txs.push({
      receiverId: data["wallet_id"],
      functionCalls: [{
        amount: parseNearAmount(data["amount"].toString()),
      }, ],
    })
  }

  let resp = await executeMultipleTransferNear(txs);
  return resp;
}