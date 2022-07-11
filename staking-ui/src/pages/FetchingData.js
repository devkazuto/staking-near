import React, { useState, useEffect } from "react";
import { config } from "../lib/config";
import { Buffer } from 'buffer';
import { formatToken, ftBalanceOf, getSupplyForOwner, loadContract } from "../lib/contract";
import "./../App.css";

// @ts-ignore
window.Buffer = Buffer;

function FetchingData() {

    const [contractId, setContractId] = useState("");
    const [contractFtId, setContractFtId] = useState("");
    const [contractNft, setContractNft] = useState("");
    const [contractFt, setContractFt] = useState("");

    useEffect(() => {
        initNear();
        console.log(contractId);
    }, [contractId, contractFtId]);

    const initNear = async () => {
        let contractNft = await loadContract(contractId, "NFT");
        let contractFt = await loadContract(contractFtId, "FT");

        setContractNft(contractNft);
        setContractFt(contractFt);
    }

    const fetchData = async () => {
        let result = [];
        const response = await fetch(`${config.apiUrl}/collection-stats?collection_id=${contractId}`);
        const data = await response.json();
        // console.log(data);
        let ownerIds = data.data.results.owner_ids;
        // console.log(ownerIds);
        if (!ownerIds) return alert("No data found");
        for (let ownerId of ownerIds) {
            let supplyNft = await getSupplyForOwner(contractNft, ownerId);
            // console.log(`${ownerId} has ${supplyNft}`);
            let supplyFt = await ftBalanceOf(contractFt, ownerId);
            // console.log(`${ownerId} has ${supplyFt}`);
            result.push({
                "wallet_id": ownerId,
                "nft_amount": supplyNft,
                "ft_amount": formatToken(supplyFt).toFixed(2)
            });
            break;
        }
        console.log(result);
    }

    return (
        <div className="App">
            <header className="App-header">
                <div class="mb-3">
                    <input
                        type="text"
                        class="form-control"
                        placeholder="collection id"
                        onChange={(e) => {
                            setContractId(e.target.value);
                        }}
                    />
                    <input
                        type="text"
                        class="form-control"
                        placeholder="contract Ft id"
                        onChange={(e) => {
                            setContractFtId(e.target.value);
                        }}
                    />
                    <div class="col">
                        <button type="button" loading class="btn btn-light" onClick={fetchData}>
                            Fetch
                        </button>
                    </div>
                </div>
            </header>
        </div>
    )

}

export default FetchingData;