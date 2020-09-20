const Storage = artifacts.require('Storage')

const runProcess = async function (){

  const storageInstance = await Storage.deployed()

  // contract "calls" do not require gas so no wallet is needed
  const result = await storageInstance.retrieve()

  console.log(result.toString())
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
