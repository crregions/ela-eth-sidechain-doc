import React, { useState, useEffect, useRef } from 'react';
import Web3 from 'web3'
import logo from './logo.png';
import { LoadingOverlay } from './Loading'

import './App.css'
import './styles/bootstrap.min.css'

import storageCompiledJSON from './contracts/Storage.json'

// ELAETHSC testnet
const storageContractAddress = '0x654Ff88970F04B8C2A75dfeEB0B133dE8024c671'

let web3, storageInstance

function App() {

  const inputEl = useRef(null)
  const [ loading, setLoading ] = useState(false)

  // this will have the value in the Storage contract
  const [ storedNumber, setStoredNumber ] = useState()

  // initial load
  useEffect(() => {
    (async () => {
      if (!window.ethereum) {
        return
      }

      // set our web3 variable to the one passed in by metamask
      web3 = new Web3(window.ethereum)

      // this triggers the Metamask permission request to connect this app to Metamask
      try {
        await window.ethereum.enable()
      } catch(err){
        alert('You need to connect an account to interact with the smart contract')
        return
      }

      // instantiate an object to interact with the smart contract based on the ABI method spec
      storageInstance = new web3.eth.Contract(storageCompiledJSON.abi, storageContractAddress)

      // await fetching for the current stored value by calling the "retrieve" method
      // on the smart contract

      const result = await storageInstance.methods.retrieve().call()

      setStoredNumber(parseFloat(result))
    })()
  }, [])


  /**
   * TODO: this needs to check if Metamask Ethereum.web3 is enabled
   * @returns {Promise<void>}
   */
  const storeNumber = async () => {

    setLoading(true)

    const numberToStore = parseFloat(inputEl.current.value)

    if (isNaN(numberToStore)){
      alert('Please enter a number!')
      return
    }

    const accounts = await web3.eth.getAccounts()
    if (accounts.length <= 0){
      alert('Please select an account')
      return
    }

    await storageInstance.methods.store(numberToStore).send({
      from: accounts[0], // metamask only has one address for now
      gasPrice: 1000000000
    })

    // of course we can use the value directly, but let's retrieve it as an exercise
    const result = await storageInstance.methods.retrieve().call()

    setStoredNumber(parseFloat(result))

    inputEl.current.value = ''

    setLoading(false)
  }

  return (
    <div className="App">
        <img src={logo} className="App-logo" alt="logo"/>
        <p className="my-3">
          <span className="font-weight-light">Smart Contract:</span>

          <a href="https://testnet.elaeth.io/address/0x654ff88970f04b8c2a75dfeeb0b133de8024c671/transactions" target="_blank">0x654Ff88970F04B8C2A75dfeEB0B133dE8024c671</a>
        </p>
        {window.ethereum ?
          <p>
            Stored Number: <b>{storedNumber}</b>
          </p> :
          <p>No Ethereum Extension Detected!</p>
        }

      <div>
        {loading && <LoadingOverlay/>}
        <input type="number" ref={inputEl}/>
        <button className="btn btn-info ml-1" onClick={storeNumber}>Store Number</button>
      </div>
    </div>
  );
}

export default App;
