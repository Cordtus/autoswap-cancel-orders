import { cosmwasm, FEES, getSigningOsmosisClient, getSigningCosmwasmClient } from "osmojs";
const { executeContract } = cosmwasm.wasm.v1.MessageComposer.withTypeUrl;
const { MsgExecuteContract } = cosmwasm.wasm.v1;

(async () => {
  // waits for window.keplr to exist (if extension is installed, enabled and injecting its content script)
  await getKeplr();
  // ok keplr is present... enable chain
  await keplr_connectOsmosis();


})();

// // INITIALIZATION:
async function getKeplr() {
  if (window.keplr) {
    return window.keplr;
  }

  if (document.readyState === "complete") {
    return window.keplr;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event) => {
      if (event.target && event.target.readyState === "complete") {
        resolve(window.keplr);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
}

async function keplr_connectOsmosis() {
  await window.keplr
    ?.enable("osmosis-1")
    .then(async () => {
      // Connected
      keplr_chains_onConnected();
    })
    .catch(() => {
      // Rejected
      keplr_chains_onRejected();
    });
}

// get osmosis wallet from user's selected account in keplr extension
async function getOsmosisWallet() {
  ui_resetForms();
  const wallet = await window.keplr?.getKey("osmosis-1").then((user_key) => {
    return user_key;
  });
  return wallet;
}

// EVENT HANDLERS
async function keplr_chains_onConnected() {
  ui_reinitialize();
  const wallet = await getOsmosisWallet();
  ui_setWallet(wallet);
  // update UI
  ui_showElementById("form_gamms");

  // register event handler: if user changes account:
  window.addEventListener("keplr_keystorechange", keplr_keystore_onChange);
}

async function keplr_chains_onRejected() {
  ui_resetForms();
  ui_setWallet(undefined);
}

async function keplr_keystore_onChange(e) {
  const wallet = await getOsmosisWallet();
  ui_setWallet(wallet);
}

// EXPORTED TO A GLOBAL "module" OBJECT FOR INLINE HTML DOM EVENT LISTENERS

export async function btnConnectKeplr_onClick() {
  // connect Keplr wallet extension
  await keplr_connectOsmosis();
}


async function cancelOrder() {
  try {
    if (window.getOfflineSignerAuto) {
      const offlineSigner = await window.getOfflineSignerAuto("osmosis-1");
      // const accounts = await offlineSigner.getAccounts();
      const walletAddress = await getOsmosisWallet().then((wallet) => {
        return wallet.bech32Address;
      });

      const client = await getSigningCosmwasmClient({
        rpcEndpoint: "https://rpc.osmosis.zone:443",
        signer: offlineSigner,
      });

      const gasFee = {
        "amount": [
          {
            "amount": "10000",
            "denom": "uosmo"
          }
        ],
        "gas": "200000"
      }

      const orderId = 1891;

      // const { MsgExecuteContract } = cosmwasm.wasm.v1;
      const msgExecuteContract = MsgExecuteContract.fromAmino({
        "sender": walletAddress,
        "contract": "osmo1wg5qzw6yn88yz9kxtwvs36fmq5jxa03pg6zptvgte62hrlw0c4rqc9mjtf",
        "msg": { "cancel_request": { "id": orderId } },
        "funds": []
      });

      const msg = executeContract(msgExecuteContract);

      ui_toggleMask("Broadcasting Transaction...");
      try {
        const result = await client.signAndBroadcast(walletAddress, [msg], gasFee, "by https://jasbanza.github.io/autoswap-cancel-orders");
        ui_updateLastTx(result);
      } catch (error) {
        ui_hideElementById("lastTxHash");
        ui_showError(error.message);
      }
      ui_toggleMask();
    }
  } catch (error) {
    console.error(error);
  }
}

window.cancelOrder = cancelOrder;

function ui_toggleMask() { }
function ui_updateLastTx(result) {
  document.getElementById("divResponse").innerHTML = JSON.stringify(result, null, 2);
}

function ui_showElementById() { }
function ui_hideElementById() { }
function ui_showError(errorMessage) {
  document.getElementById("divError").innerHTML = errorMessage;
}

function ui_resetForms() { }
function ui_reinitialize() { }
function ui_setWallet(wallet) {
  document.getElementById("walletAddress").innerHTML = wallet.bech32Address;
}