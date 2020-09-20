import React, { useState, useEffect, useRef } from 'react';
import Web3 from 'web3'
import logo from './logo.svg';
import { LoadingOverlay } from './Loading'

import './App.css'
import './styles/bootstrap.min.css'

import storageCompiledJSON from './contracts/Storage.json'

// ELAETHSC testnet
const storageContractAddress = '0x654Ff88970F04B8C2A75dfeEB0B133dE8024c671'


function App() {

  let web3, storageInstance

  const inputEl = useRef(null)
  const [ loading, setLoading ] = useState(false)

  // this will have the value in the Storage contract
  const [ storedNumber, setStoredNumber ] = useState()

  if (window.ethereum){
    web3 = new Web3(window.ethereum)

    // this triggers the Metamask permission request
    window.ethereum.enable()

    storageInstance = new web3.eth.Contract(storageCompiledJSON.abi, storageContractAddress)
  }

  // initial load
  useEffect(() => {
    if (!window.ethereum) {
      return
    }

    (async () => {
      const result = await storageInstance.methods.retrieve().call()

      setStoredNumber(parseFloat(result))
    })()
  }, [])

  const storeNumber = async () => {

    setLoading(true)

    const numberToStore = parseFloat(inputEl.current.value)

    if (isNaN(numberToStore)){
      alert('Please enter a number!')
      return
    }

    const accounts = await web3.eth.getAccounts()

    await storageInstance.methods.store(numberToStore).send({
      from: accounts[0],
      gasPrice: 1000000000
    })

    const result = await storageInstance.methods.retrieve().call()

    setStoredNumber(parseFloat(result))

    inputEl.current.value = ''

    setLoading(false)
  }

  return (
    <div className="App">
        <img src={logo} className="App-logo" alt="logo"/>
        {window.ethereum ?
          <p>
            Stored Number: {storedNumber}
          </p> :
          <p>No Ethereum Extension Detected!</p>
        }

      <div>
        {loading && <LoadingOverlay/>}
        <input type="number" ref={inputEl}/>
        <button className="btn btn-info" onClick={storeNumber}>Store Number</button>
      </div>
    </div>
  );
}

export default App;
