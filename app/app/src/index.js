import Web3 from "web3";
import solnSquareVerifierArtifact from "../../../eth-contracts/build/contracts/SolnSquareVerifier.json";
const { proof, inputs } = require('../../../zokrates/code/square/proof.json')

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = solnSquareVerifierArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        solnSquareVerifierArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      console.log("Connected to account: " + this.account);
      document.getElementById("connected-account").innerHTML = this.account;

      this.status = document.getElementById("status");

    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  addSolution2: async function () {
    const { addSolution } = this.meta.methods;

    const index = document.getElementById("index").value;
    const address = document.getElementById("address").value;

    try {
      await addSolution(index, address).send({ from: this.account });
    } catch (e) {
      console.log("SolutionAdded error: " + e);
    }

    this.meta.events.SolutionAdded(function (error, result) {
      if (!error) {
        this.status.innerHTML = JSON.stringify(result);
        console.log('SolutionAdded ' + JSON.stringify(result));

      } else {
        console.log('SolutionAdded ' + error);
      }
    });
  },

  mint2: async function () {
    const index = document.getElementById("token-index").value;
    const mintAccount = document.getElementById("mint-address").value;

    this.setStatus.innerHTML = "Initiating minting... (please wait)";

    const { mintNFTAfterVerification } = this.meta.methods;

    try {
      await mintNFTAfterVerification(index, mintAccount, proof, inputs).send({ from: this.account });
    } catch (e) {
      console.log("Minting error: " + e);
    }

    this.meta.events.Transfer(function (error, result) {
      if (!error) {
        const status = document.getElementById("status");
        status.innerHTML = JSON.stringify(result);
        console.log('Minting ' + JSON.stringify(result));

      } else {
        console.log('Minting ' + error);
      }
    });
  },

  setStatus: function (message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },
};

window.App = App;

window.addEventListener("load", function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
