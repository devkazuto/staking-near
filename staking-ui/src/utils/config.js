import getConfig from "./near";
let config = getConfig("testnet");

let viewMethodsStaking = ['get_total_staked', 'get_user_staked', 'get_session_interval', 'get_claimable', 'get_claimable_token', 'get_staked'];

export {
    config,
    viewMethodsStaking
};