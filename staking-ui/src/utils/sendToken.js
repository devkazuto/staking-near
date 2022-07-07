import { parseNearAmount } from "near-api-js/lib/utils/format";
import { config } from "../lib/config";
import { executeMultipleTransactions, parserToken, storage_balance_of } from "../lib/contract";

export const sendMultipleToken = async (walletAccount, dataJson) => {

    let txs = [];
    for(let data of dataJson){
        let deposited = await storage_balance_of(walletAccount.account(), config.ftContractName, walletAccount.getAccountId());
        if (!deposited) {
            txs.push({
                receiverId: config.ftContractName,
                functionCalls: [{
                    methodName: 'storage_deposit',
                    contractId: config.ftContractName,
                    args: {
                        account_id: walletAccount.getAccountId(),
                    },
                    attachedDeposit: parseNearAmount('0.0125'),
                    gas: config.GAS_FEE,
                }, ],
            })
        }
    
        txs.push({
            receiverId: config.ftContractName,
            functionCalls: [
              {
                methodName: 'ft_transfer',
                contractId: config.ftContractName,
                args: {
                  "receiver_id": data["wallet_id"],
                  "amount": parserToken(data["amount"]).toString(),
                },
                attachedDeposit: 1,
                gas: config.GAS_FEE,
              },
            ],
          })
    };

    let resp = await executeMultipleTransactions(txs);
    return resp;

}