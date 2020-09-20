const BN = require('bn.js')

const Storage = artifacts.require('Storage')

contract('storage', (accounts) => {

  let storageInstance

  before(async () => {
    storageInstance = await Storage.deployed()
  })

  it('Should verify that the initial value is 0', async () => {

    const result = await storageInstance.retrieve()

    assert(new BN(0).eq(result))
  })

  it('Should store and verify number', async () => {

    await storageInstance.store(5)
    const result = await storageInstance.retrieve()

    assert(new BN(5).eq(result))
  })

})
