'use strict'
/**
 * Demo app for demonstrating balance updates using oracles. Transfers tokens to validators every x seconds.
 */
const ERC20Token = require('../../build/contracts/ERC20.json')
const AccessStake = require('../../build/contracts/AccessStake.json')

const { networks, authorityAddress } = require('../config.js')
const { kovan: mainNetwork } = networks

const Web3 = require('web3')
const web3Main = new Web3(mainNetwork.provider)

const fernTokenAddress = mainNetwork.contracts.FernToken
const fernToken = new web3Main.eth.Contract(ERC20Token.abi, fernTokenAddress)

const accessStakeAddress = mainNetwork.contracts.AccessStake
const accessStake = new web3Main.eth.Contract(AccessStake.abi, accessStakeAddress)

const transferIntervalSeconds = 30 // transfer stake every 30 seconds

const transferTokens = async() => {
  try {
    const depositAmount = Math.floor(Math.random() * 10)
    await fernToken.methods.approve(accessStakeAddress, depositAmount).send({ from: authorityAddress })
    await accessStake.methods.deposit(depositAmount).send({ from: authorityAddress })
    console.log(`${authorityAddress} has deposited ${depositAmount} tokens into AccessStake contract.`)
  } catch (err) {
    console.error(`Error depositing token into stake contract: ${err.message}`)
  }
}

transferTokens()

setInterval(transferTokens, transferIntervalSeconds * 1000)
