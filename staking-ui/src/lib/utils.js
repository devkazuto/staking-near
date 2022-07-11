import {
    Axios
} from "axios";
import {
    config
} from "./config"

export const checkAccount = async (accountId) => {
    const resp = await Axios.post(config.nodeUrl, {
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'query',
        params: {
            request_type: 'view_account',
            finality: 'final',
            account_id: accountId,
        },
    })
    return resp;
}


export const parserTokenCustom = (amount, decimal) => {
    return amount * 10 ** decimal;
}

export const getBase64FromUrl = async (url) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
        }
    });
}