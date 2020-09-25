const Web3 = require('web3')
const BN = require('bn.js')
const _ = require('lodash')
const Storage = artifacts.require('Storage')
const HDWalletProvider = require('@truffle/hdwallet-provider')

const secrets = require('../secrets.json')
const mnemonic = secrets.mnemonic

const walletAddress = '0x243C7B804a1CB650c3f584FaC5e33FdB61Cd26CE'

const runProcess = async function () {
  let web3 = new Web3(new HDWalletProvider(mnemonic, 'https://rpc.elaeth.io'))

  // if your mnemonic was imported correctly it should match the walletAddress you sent test ELAETHSC
  if (web3.currentProvider.addresses[0] !== walletAddress.toLowerCase()) {
    console.error('expected wallet address does not match')
    return
  }

  const numberToStore = new BN(_.last(process.argv))

  console.log(`Storing the number ${numberToStore}`)

  // Truffle automatically fetches the correct deployed contract from the corresponding network
  const storageInstance = await Storage.deployed()

  await storageInstance.store(numberToStore)

  console.log('Number stored sucessfully')
}

module.exports = function (callback) {
  return runProcess().then(
    () => {
      return callback()
    },
    (err) => {
      return callback(err)
    }
  )
}
