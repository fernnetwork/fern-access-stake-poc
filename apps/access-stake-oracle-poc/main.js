'use strict'
const AccessStake = require('../../build/contracts/AccessStake.json')
const AccessStakeOracleHandler = require('../../build/contracts/AccessStakeOracleHandler.json')

const { stakeOwners, networks, authorityAddress } = require('../config.js')
const { kovan: mainNetwork, local: localNetwork } = networks

const Web3 = require('web3')
const web3Main = new Web3(mainNetwork.provider)
const web3Local = new Web3(localNetwork.provider)

const accessStakeAddress = mainNetwork.contracts.AccessStake
const accessStake = new web3Main.eth.Contract(AccessStake.abi, accessStakeAddress)

const accessStakeOracleHandlerAddress = AccessStakeOracleHandler.networks[localNetwork.networkId].address
const accessStakeOracleHandler = new web3Local.eth.Contract(AccessStakeOracleHandler.abi, accessStakeOracleHandlerAddress)

const updateIntervalMinutes = 1 // every minute

const updateOracle = async () => {
  try {
    console.log('-------------')
    console.log('Querying stake balance from mainnet...')
    const balances = await Promise.all(
      stakeOwners.map(validator => {
        return accessStake.methods.balanceOf(validator).call({ from: authorityAddress })
      })
    )

    console.log('Updating stake oracle on local network...')
    await accessStakeOracleHandler.methods.update(stakeOwners, balances).send({ from: authorityAddress })
  } catch (error) {
    console.error(`Error updating access stake oracle handler contract: ${error.message}`, error)
  }

  console.log('Checking oracle data...')
  const results = await Promise.all(
    stakeOwners.map(address => accessStakeOracleHandler.methods.getStakeBalance(address).call({ from: authorityAddress }))
  )
  results.forEach((result, i) => {
    const { balance, lastUpdated } = result
    console.log(`${stakeOwners[i]} has ${balance} tokens staked. Last updated: ${lastUpdated}`)
  })
}

updateOracle()

// Update oracle on pre-defined intervals
setInterval(updateOracle, updateIntervalMinutes * 60 * 1000)

// Log all oracle events
accessStakeOracleHandler.events.allEvents((error, event) => {
  if (error) {
    console.error(error)
    return
  }
  console.log(`${event.event} event received.`)
})
