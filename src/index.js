import { cosmwasm, FEES } from "osmojs";

// import { Keplr } from "@keplr-wallet/provider";

// // import { chain, assets, asset_list, testnet, testnet_assets } from '@chain-registry/osmosis';
// // import Long from "long";
// // import Big from "big.js"; // long library looses precision with dividing

const { executeContract } = cosmwasm.wasm.v1.MessageComposer.withTypeUrl;

// // const msg = executeContract({ contract, funds, msg, sender });

// const keplr = new Keplr();
// await keplr.init();
// await keplr.experimentalSuggestChain(chainInfo);
// await keplr.enable(chainId);

// // joinSwapExternAmountIn({})
// //const msg_swapExactAmountIn = swapExactAmountIn({routes,sender,tokenOutMinAmount,tokenIn});

(async () => {
  // waits for window.keplr to exist (if extension is installed, enabled and injecting its content script)
  await getKeplr();
  // ok keplr is present... enable chain
  await keplr_connectOsmosis();
})();

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

// // get osmosis wallet from user's selected account in keplr extension
// async function getOsmosisWallet() {
//   ui_resetForms();
//   const wallet = await window.keplr?.getKey("osmosis-1").then((user_key) => {
//     return user_key;
//   });
//   return wallet;
// }

// // EVENT HANDLERS
// async function keplr_chains_onConnected() {
//   ui_reinitialize();
//   const wallet = await getOsmosisWallet();
//   ui_setWallet(wallet);
//   // update UI
//   ui_showElementById("form_gamms");

//   // register event handler: if user changes account:
//   window.addEventListener("keplr_keystorechange", keplr_keystore_onChange);
// }

// async function keplr_chains_onRejected() {
//   ui_resetForms();
//   ui_setWallet(undefined);
// }

// async function keplr_keystore_onChange(e) {
//   const wallet = await getOsmosisWallet();
//   ui_setWallet(wallet);
// }

// // EXPORTED TO A GLOBAL "module" OBJECT FOR INLINE HTML DOM EVENT LISTENERS

// // export async function btnConnectKeplr_onClick() {
// //   // connect Keplr wallet extension
// //   await keplr_connectOsmosis();
// // }

// async function testTransaction() {
//   if (window.getOfflineSignerOnlyAmino) {
//     const offlineSigner = window.getOfflineSignerOnlyAmino("osmosis-1");
//     const accounts = await offlineSigner.getAccounts();
//     const walletAddress = await getOsmosisWallet().then((wallet) => {
//       return wallet.bech32Address;
//     });
//     const client = await getSigningOsmosisClient({
//       rpcEndpoint: "https://rpc.osmosis.interbloc.org",
//       signer: offlineSigner,
//     });

//     const fee = FEES.osmosis.lockTokens("low"); // failing types check

//     const msg = {
//       type: "wasm/MsgExecuteContract",
//       value: {
//         sender: signer.bech32Address,
//         contract: contractAddress,
//         msg: {
//           execute: {
//             contract: contractAddress,
//             msg: {
//               your_message: "Hello, Keplr!",
//             },
//             funds: [],
//           },
//         },
//       },
//     };

//     ui_toggleMask("Broadcasting Transaction...");
//     try {
//       const result = await client.signAndBroadcast(walletAddress, [msg], fee);
//       ui_updateLastTx(result);
//     } catch (error) {
//       ui_hideElementById("lastTxHash");
//       ui_showError(error.message);
//     }
//     ui_toggleMask();
//   }
// }

// function ui_toggleMask() {}
// function ui_updateLastTx() {}

// function ui_showElementById() {}
// function ui_hideElementById() {}
// function ui_showError() {}
