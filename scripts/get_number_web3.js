const Web3 = require('web3')
const storageCompiledJSON = require('../build/contracts/Storage.json')

// ELAETHSC testnet
const storageContractAddress = '0x654Ff88970F04B8C2A75dfeEB0B133dE8024c671'

;(async () => {
  const web3 = new Web3('https://rpc.elaeth.io')

  const storageInstance = new web3.eth.Contract(
    storageCompiledJSON.abi,
    storageContractAddress
  )

  console.log(await storageInstance.methods.retrieve().call())

  process.exit()
})()
