import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import { abi } from './utils/WavePortal.json';

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setLoader] = useState(false);
  const [allWaves, setAllWaves] = useState([]);
  const [waveMessage, setMessage] = useState("");
  const [errorMessage, setError] = useState("");

  const contractAddress = "0xC15fef671dE88D38Ea0FbA5Ce496e98a0FC4a79f";
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
        await getAllWaves();
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

        console.log("Sending wave message:", waveMessage);
        const waveTxn = await wavePortalContract.wave(waveMessage);
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined --", waveTxn.hash);

        await getAllWaves();
        setLoader(false);
        setMessage("");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error here!", error);
      console.log(typeof error, error.message)
      if(error.message.includes("Wait 15m")) {
        setError("You can only wave once every 15 minutes!")
      }
      setLoader(false);
    }
}

const getAllWaves = async () => {
  try {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

      const waves = await wavePortalContract.getAllWaves();

      let cleanWaves = [];
      waves.forEach(wave => {
        cleanWaves.push({
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        });
      });

      setAllWaves(cleanWaves);
    } else {
      console.log("Ethereum object doesn't exist!")
    }
  } catch (error) {
    console.log(error);
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
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>Connect Wallet</button> 
        )}
        <div>
          <input 
            type="text"
            value={waveMessage} 
            placeholder="Write a message!" 
            disabled={isLoading} 
            onChange={e => setMessage(e.target.value)}
            />
          <button className="waveButton" disabled={isLoading} onClick={wave}>
           {isLoading ? "Processing Your Wave!" : "Wave at Me!"}
          </button>
        </div>
        {errorMessage && <span>{errorMessage}</span>}
        <div className="waveHolder">
          <div>
            <h3>Wave Count</h3>
            <p>{allWaves.length || 0}</p>
          </div>
          <div>
          <h3>Wave Messages</h3>
            {allWaves && allWaves.map((wave, index) => {
              return (
                <div key={index} className="waveMessage">
                  <div>Address: {wave.address}</div>
                  <div>Time: {wave.timestamp.toString()}</div>
                  <div>Message: {wave.message}</div>
                </div>)
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
