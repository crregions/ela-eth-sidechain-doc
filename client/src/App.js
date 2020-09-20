import React, { useState, useEffect } from 'react';
import Web3 from 'web3'
import logo from './logo.svg';

import './App.css';

import storageCompiledJSON from './contracts/Storage.json'

const web3 = new Web3('https://rpc.elaeth.io')

// ELAETHSC testnet
const storageContractAddress = '0x654Ff88970F04B8C2A75dfeEB0B133dE8024c671'

const storageInstance = new web3.eth.Contract(storageCompiledJSON.abi, storageContractAddress)

function App() {

  // this will have the value in the Storage contract
  const [ storedNumber, setStoredNumber ] = useState()

  // initial load
  useEffect(() => {
    (async () => {
      const result = await storageInstance.methods.retrieve().call()

      setStoredNumber(parseFloat(result))
    })()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Stored Number: {storedNumber}
        </p>
      </header>
    </div>
  );
}

export default App;
