import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

import { ethers } from "ethers";

import abiConfig from "./config/abi.js";
import contractConfig from "./config/contract.js";

const CONTRACT_ABI = abiConfig;
const MINT_PRICE = contractConfig.MINT_PRICE;
const MAX_TOKEN_SUPPLY = contractConfig.MAX_TOKEN_SUPPLY;
const CONTRACT_ADDRESS = contractConfig.CONTRACT_ADDRESS;
const NFT_NAME = contractConfig.NFT_NAME;

const noop = () => {};

function _notify(msg, status, error = null) {
    console.log("Notification:", msg);
    let error_ = "";
    if (error != null) {
        console.log("Error:", error);
        error_ = error.reason;
        if (error.code == "UNPREDICTABLE_GAS_LIMIT") {
            error_ = "Sales not open yet.";
        }
    }

    const _html = `
    <div class="notifications__single ${status}">
        <span class="notifications__single__close">x</span>
        <span class="notifications__single__msg">${msg}</span>
        <span class="notifications__single_error">${error_}</span>
    </div>
    `;
    const html = $(_html);
    const notification = $("#notifications").prepend(html);
    html.children(".notifications__single__close").on("click", function (e) {
        $(this).parent().hide("slow");
    });
}

function _sign_in() {
    try {
        const ethereum = window.ethereum;
        const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
        if (metamaskIsInstalled) {
            const web3Provider = new ethers.providers.Web3Provider(ethereum);

            web3Provider
                .send("eth_requestAccounts", [])
                .then(() => {
                    _notify("Wallet connected!", "success");
                })
                .catch(e => {
                    _notify("Wallet connection failed!", "error", e);
                });

            const signer = web3Provider.getSigner();

            return web3Provider;
        } else {
            _notify("Please install MetaMask", "error");
        }
    } catch (e) {
        _notify("Wallet connection failed:", "error");
        return null;
    }
}

function _mint(web3Provider, quantity) {
    const signer_ = web3Provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Provider);
    const signer = contract.connect(signer_);

    const total_price = ethers.utils.parseUnits((MINT_PRICE * quantity).toString(), 18);
    const tx = signer
        .mint(quantity, { value: total_price.toString() })
        .then(() => {
            _notify(`Minted ${quantity} ${NFT_NAME}!`, "success");
        })
        .catch(e => {
            _notify("Minting failed!", "error", e);
        });
}

function _get_token_count(web3Provider) {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Provider);
    // const token_count = contract.totalSupply()

    return contract.tokenCounter();
}

function main() {
    /*
    1. Connect to metamask using `window.ethereum`
    2. OnClick of #mint-submit, get #mint-quantity-input and transact with the contract.
    */

    let web3Provider = null;
    $("#sign-in").on("click", function (e) {
        web3Provider = _sign_in();

        if (web3Provider) {
            console.log("web3Provider");
            web3Provider._networkPromise.then(web3Obj => {
                if (web3Obj.chainId != 1) {
                    _notify("Please switch to Ethereum Mainnet", "error");
                } else {
                    _get_token_count(web3Provider)
                        .then(count => {
                            $("#token_count").text(`${count - 1}/${MAX_TOKEN_SUPPLY}`);
                        })
                        .catch(e => {
                            _notify("Failed to get current token count.", "error", e);
                        });
                    $("#sign-in").hide();
                }
            });
        }
    });

    $("#mint-submit").on("click", function (e) {
        e.preventDefault();
        let quantity = $("#mint-quantity-input").val();
        if (quantity < 1 || quantity > 10) {
            quantity = 1;
        }
        _mint(web3Provider, quantity);
    });
}

main();
