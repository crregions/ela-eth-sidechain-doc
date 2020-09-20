const Web3 = require('web3')
const BN = require('bn.js')
const _ = require('lodash')

const HDWalletProvider = require('@truffle/hdwallet-provider')

const secrets = require('../secrets.json')
const mnemonic = secrets.mnemonic

const walletAddress = '0x243C7B804a1CB650c3f584FaC5e33FdB61Cd26CE'

// ELAETHSC testnet
const storageContractAddress = '0x654Ff88970F04B8C2A75dfeEB0B133dE8024c671'

const storageCompiledJSON = require('../build/contracts/Storage.json')

// self-executing function to wrap async - makes it easier to use await
;(async () => {

  const web3 = new Web3(new HDWalletProvider(mnemonic, 'https://rpc.elaeth.io'))

  // if your mnemonic was imported correctly it should match the walletAddress you sent test ELAETHSC
  if (web3.currentProvider.addresses[0] !== walletAddress.toLowerCase()){
    console.error('expected wallet address does not match')
    return
  }

  const numberToStore = new BN(_.last(process.argv))

  /*
  ******************************************************************************************
  * Here's where it's different, we need to instantiate the contract instance ourselves
  * instead of relying on Truffle's "artifacts.require".
  *
  * For this we need the ABI, which requires the compiled JSON from the build directory
  * and the address where we deployed it. This is network specific and you'll need
  * your own way to handle this if you intend to run this on multiple networks.
  ******************************************************************************************
   */
  const storageInstance = new web3.eth.Contract(storageCompiledJSON.abi, storageContractAddress)

  await storageInstance.methods.store(numberToStore).send({
    from: walletAddress,
    gasPrice: 1000000000
  })

  process.exit()
})()
