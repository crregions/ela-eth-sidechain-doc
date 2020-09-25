// React
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import logo from './logo.png'
import { LoadingOverlay } from './Loading'
import { Spinner } from './components/spinner'
import './App.css'
import './styles/bootstrap.min.css'


// Blockchain
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { ethers } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from '@ethersproject/units'

import storageCompiledJSON from './contracts/Storage.json'

// this helps us reconnect if Metamask is already authorized
import { useEagerConnect } from './hooks/useEagerConnect'

// this sets up listeners for events such as the chain changing/disconnecting
import { useInactiveListener } from './hooks/useInactiveListener'

// helper hook for wallet balance
import { useBalance } from './hooks/useBalance'

// ELAETHSC testnet
const storageContractAddress = '0x654Ff88970F04B8C2A75dfeEB0B133dE8024c671'

// Injected Connector (MetaMask handler) from web3-react
const injectedConnector = new InjectedConnector()


function getLibrary(provider) {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

export default function() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  )
}

const App = () => {

  /*
  **************************************************************************************************
  * Ethereum Connection Setup
  **************************************************************************************************
   */

  const [ web3, setWeb3 ] = useState()

  // Web3React provides all current state info in this context
  const context = useWeb3React()

  // these are the variables that tell us about the state
  const { connector, library, chainId, account, activate, deactivate, active, error } = context

  // this allows us to show when we are in a temporary activating (connecting state)
  // `activatingConnector` is really just undefined or the connector (obj), when we activate we set `activatingConnector`
  // to the string, and while it does not match `connector` we are in a transient "connecting" state
  const [activatingConnector, setActivatingConnector] = useState()
  useEffect(() => {

    // clear activatingConnector after activation is successful
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector, library])

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect(injectedConnector)

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(injectedConnector,!triedEager || !!activatingConnector)


  /*
  **************************************************************************************************
  * Application Setup
  **************************************************************************************************
   */
  const inputEl = useRef(null)
  const [loading, setLoading] = useState(false)

  const [ storageInstance, setStorageInstance ] = useState()

  // connect toggle
  const [connectOpen, setConnectOpen] = useState(false);
  const toggleConnect = () => setConnectOpen(prevState => !prevState);

  // this will have the value in the Storage contract
  const [storedNumber, setStoredNumber] = useState()

  const balance = useBalance()

  const connectButton = useCallback(() => {

    // let eager connect try first, show loading meanwhile
    if (!triedEager){
      return <Dropdown isOpen={connectOpen} toggle={toggleConnect}>
        <DropdownToggle>
          <Spinner color={'black'} style={{ height: '20px', marginLeft: '-1rem' }} /> Loading
        </DropdownToggle>
      </Dropdown>
    }

    if (active){
      return <Dropdown isOpen={connectOpen} toggle={toggleConnect}>
        <DropdownToggle caret>
          ✅ Connected
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem className="btn-dark" onClick={() => {
            setActivatingConnector(undefined)
            deactivate()
          }}>Disconnect</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    }

    // default
    return <button className="btn btn-dark" onClick={() => {
      setActivatingConnector(injectedConnector)
      activate(injectedConnector)
    }}>
      Connect to Metamask
    </button>

  })

  // initial load
  useEffect(() => {
    (async () => {

      if (!active || !library){
        return
      }

      // instantiate an object to interact with the smart contract based on the ABI method spec
      const storageInstance = new ethers.Contract(
        storageContractAddress,
        storageCompiledJSON.abi,
        library.getSigner(account)
      )

      // await fetching for the current stored value by calling the "retrieve" method
      // on the smart contract

      const result = await storageInstance.retrieve()

      setStoredNumber(parseFloat(result))

      setStorageInstance(storageInstance)
    })()
  }, [active, library, account])

  const storeNumber = useCallback(() => {
    (async () => {
      if (!storageInstance){
        return
      }

      setLoading(true)

      const numberToStore = parseFloat(inputEl.current.value)

      if (isNaN(numberToStore)){
        alert('Please enter a number!')
        return
      }

      // ethers.js is more granular, it returns the transaction with a `wait()`
      const transResp = await storageInstance.store(numberToStore, {
        gasPrice: 1000000000
      })

      // this properly waits for the result to update
      await transResp.wait()

      // of course we can use the value directly, but let's retrieve it as an exercise
      const result = await storageInstance.retrieve()

      setStoredNumber(parseFloat(result))

      inputEl.current.value = ''

      setLoading(false)
    })()

  }, [storageInstance])

  return (
    <div className="App">
      <header className="text-right p-3">
        {connectButton()}
      </header>
      <img src={logo} className="App-logo" alt="logo" />
      <p className="mt-3">
        <span className="font-weight-light">Smart Contract:</span>{' '}

        <a
          href="https://testnet.elaeth.io/address/0x654ff88970f04b8c2a75dfeeb0b133de8024c671/transactions"
          target="_blank"
        >
          0x654Ff88970F04B8C2A75dfeEB0B133dE8024c671
        </a>
      </p>
      {active ? (
        <div>
          <p>
            <span className="font-weight-light">Your Address:</span>{' '}

            <a
              href={`https://testnet.elaeth.io/address/${account}/transactions`}
              target="_blank"
            >
              {account}
            </a>

          </p>
          <p>
            <span className="font-weight-light">Your Balance:</span>{' '}
            {`Ξ${balance ? formatEther(balance) : ''}`}
          </p>
          Stored Number: <b>{storedNumber}</b>

          <br/>
          {loading && <LoadingOverlay />}
          <input type="number" ref={inputEl} />
          <button className="btn btn-info ml-1" onClick={storeNumber}>
            Store Number
          </button>
        </div>
      ) : (
        <p className="font-weight-bold">
          No Metamask Extension Detected!
          <br/>
          <span className="font-weight-light">
            Please click "Connect to Metamask" in the top right.
          </span>
        </p>
      )}
    </div>
  )
}

