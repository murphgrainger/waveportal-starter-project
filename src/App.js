import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import { abi } from './utils/WavePortal.json';

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [waveCount, setCount] = useState(0);
  const [isLoading, setLoader] = useState(false);

  const contractAddress = "0xA45A2dfDA01d7dd9a019f3be5E42FBE976cbdcEc";
  const contractABI = abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if(!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
       console.log("No authorized account found")
      }
    } catch(error) {
     console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if(!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch(error) {
      console.log(error);
    }
  }
 
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        setLoader(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined --", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        setCount(count.toNumber())
        setLoader(false);
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      setLoader(false);
    }
}
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
         Hello People of the Future!
        </div>

        <div className="bio">
        I am learning about Solidity and Ethereum and all the things. Connect your Ethereum wallet and wave at me in the new Web3 world!
        </div>

        <div>
          <h3>Wave Count</h3>
          {waveCount}
        </div>

        <button className="waveButton" disabled={isLoading} onClick={wave}>
          {isLoading ? "Processing Your Wave!" : "Wave at Me!"}
        </button>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>Connect Wallet</button> 
        )}
        </div>
    </div>
  );
}
